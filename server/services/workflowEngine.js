const mongoose = require('mongoose');
const AutomationRule = require('../models/AutomationRule');
const { DEFAULT_AUTOMATION_RULES, matchesAllConditions } = require('./automationRules');
const notificationService = require('./notificationService');
const timelineService = require('./timelineService');
const logger = require('../utils/logger');

/**
 * Get all available automation rules (System defaults + User custom)
 */
async function getRules(userId) {
  let customRules = [];
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      customRules = await AutomationRule.find({
        $or: [{ userId: null }, { userId }],
      }).lean();
    } catch (err) {
      logger.warn('Failed to query custom automation rules from DB', { error: err.message });
    }
  }

  // Merge default rules with DB rules, preferring DB rules if ruleId collides
  const ruleMap = new Map();
  for (const r of DEFAULT_AUTOMATION_RULES) {
    ruleMap.set(r.ruleId, { ...r, isSystem: true });
  }
  for (const r of customRules) {
    ruleMap.set(r.ruleId, { ...r, isSystem: !r.userId });
  }

  return Array.from(ruleMap.values());
}

/**
 * Create custom automation rule (Workflow Builder API)
 */
async function createRule(userId, ruleData = {}) {
  const { name, description, trigger, conditions, actions, priority = 1, enabled = true } = ruleData;

  if (!name || !trigger) {
    throw new Error('name and trigger are required to build a workflow rule');
  }

  const ruleId = ruleData.ruleId || `RULE_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const doc = {
    userId,
    ruleId,
    name,
    description: description || '',
    trigger,
    conditions: conditions || [],
    actions: actions || [],
    priority,
    enabled,
    executionCount: 0,
  };

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    const created = await AutomationRule.create(doc);
    return created.toObject();
  }

  return { ...doc, _id: `rule-${Date.now()}` };
}

/**
 * Update custom automation rule
 */
async function updateRule(userId, ruleId, updates = {}) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    const updated = await AutomationRule.findOneAndUpdate(
      { ruleId, $or: [{ userId }, { userId: null }] },
      { $set: updates },
      { new: true }
    );
    if (!updated) {
      throw new Error(`Rule ${ruleId} not found or unauthorized`);
    }
    return updated.toObject();
  }

  return { ruleId, ...updates, updatedAt: new Date().toISOString() };
}

/**
 * Delete custom automation rule
 */
async function deleteRule(userId, ruleId) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await AutomationRule.findOneAndDelete({ ruleId, userId });
  }
  return { success: true, message: `Rule ${ruleId} deleted successfully` };
}

/**
 * Execute single action block
 */
async function executeAction(userId, action = {}, triggerData = {}) {
  const { actionType, payload = {} } = action;
  const executionRecord = {
    actionType,
    status: 'success',
    executedAt: new Date().toISOString(),
    details: payload,
  };

  try {
    switch (actionType) {
      case 'emergency_alert': {
        await notificationService.createNotification({
          userId,
          title: payload.title || 'Emergency Workflow Alert',
          message: payload.message || 'Critical biometric condition detected.',
          type: 'emergency',
          severity: payload.severity || 'critical',
          priority: 'high',
          route: payload.route || '/emergency',
        });
        break;
      }

      case 'doctor_notification': {
        await notificationService.createNotification({
          userId,
          title: payload.title || 'Clinical Alert for Assigned Physician',
          message: payload.message || 'Automated care protocol triggered clinical notification.',
          type: 'health',
          severity: 'warning',
          priority: 'high',
        });
        break;
      }

      case 'timeline_event': {
        await timelineService.createEvent({
          userId,
          eventType: payload.eventType || 'emergency',
          category: payload.category || 'emergency',
          title: payload.title || 'Automated Workflow Event',
          description: payload.description || 'HealthSphere clinical automation triggered this event.',
        });
        break;
      }

      case 'push_notification': {
        await notificationService.createNotification({
          userId,
          title: payload.title || 'HealthSphere Notification',
          message: payload.body || payload.message || 'Workflow notification update.',
          type: 'system',
          priority: 'normal',
          route: payload.route,
        });
        break;
      }

      case 'reminder': {
        const isAppt = (payload.title || '').toLowerCase().includes('appointment');
        await notificationService.createNotification({
          userId,
          title: payload.title || 'Health Reminder',
          message: payload.message || 'Scheduled healthcare action required.',
          type: isAppt ? 'appointment' : 'medication',
          priority: 'normal',
        });
        break;
      }

      case 'family_notification': {
        await notificationService.createNotification({
          userId,
          title: payload.title || 'Care Circle Notification',
          message: payload.message || 'Automated family care update.',
          type: 'health',
          severity: 'medium',
          priority: 'normal',
        });
        break;
      }

      case 'checklist': {
        executionRecord.checklist = payload.checklistItems || payload.items || [];
        break;
      }

      default:
        executionRecord.status = 'skipped_unknown_action';
    }
  } catch (err) {
    logger.error('Failed to execute workflow action', { actionType, error: err.message, userId });
    executionRecord.status = 'failed';
    executionRecord.error = err.message;
  }

  return executionRecord;
}

/**
 * Execute sequential action pipeline for a matched rule
 */
async function executeActionPipeline(userId, rule, triggerData = {}) {
  const actionsExecuted = [];

  for (const action of rule.actions || []) {
    const record = await executeAction(userId, action, triggerData);
    actionsExecuted.push(record);
  }

  // Update rule metadata in DB if connected
  if (mongoose.connection && mongoose.connection.readyState === 1 && rule.ruleId) {
    await AutomationRule.updateOne(
      { ruleId: rule.ruleId },
      { $inc: { executionCount: 1 }, $set: { lastTriggeredAt: new Date() } }
    ).catch(() => {});
  }

  return {
    ruleId: rule.ruleId,
    name: rule.name,
    actionsExecuted,
    completedAt: new Date().toISOString(),
  };
}

/**
 * Evaluate incoming event trigger against all matching automation rules
 */
async function evaluateTrigger(userId, trigger, triggerData = {}) {
  try {
    const allRules = await getRules(userId);
    const candidateRules = allRules.filter((r) => r.enabled && r.trigger === trigger);

    const matchedRules = [];

    for (const rule of candidateRules) {
      if (matchesAllConditions(triggerData, rule.conditions)) {
        matchedRules.push(rule);
      }
    }

    // Sort by priority descending
    matchedRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const pipelineResults = [];
    for (const rule of matchedRules) {
      const result = await executeActionPipeline(userId, rule, triggerData);
      pipelineResults.push(result);
    }

    return {
      success: true,
      trigger,
      totalCandidates: candidateRules.length,
      matchedCount: matchedRules.length,
      executedPipelines: pipelineResults,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    logger.error('Error during workflow trigger evaluation', { userId, trigger, error: err.message });
    throw err;
  }
}

module.exports = {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  executeAction,
  executeActionPipeline,
  evaluateTrigger,
};
