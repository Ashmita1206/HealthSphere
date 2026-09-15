const workflowEngine = require('../services/workflowEngine');

/**
 * GET /api/workflows/rules
 * List all active automation rules (presets and custom)
 */
async function getRules(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const rules = await workflowEngine.getRules(userId);

    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/workflows/rules
 * Create custom clinical automation rule
 */
async function createRule(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const rule = await workflowEngine.createRule(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Workflow rule created successfully',
      data: rule,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/workflows/rules/:id
 * Update existing automation rule
 */
async function updateRule(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const updated = await workflowEngine.updateRule(userId, id, req.body);

    res.status(200).json({
      success: true,
      message: 'Workflow rule updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/workflows/rules/:id
 * Delete automation rule
 */
async function deleteRule(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const result = await workflowEngine.deleteRule(userId, id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/workflows/evaluate
 * Evaluate trigger and execute pipeline
 */
async function evaluateWorkflow(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { trigger, data } = req.body;

    if (!trigger) {
      return res.status(400).json({
        success: false,
        message: 'trigger parameter is required (e.g. vital_breach, medication_missed, appointment_upcoming)',
      });
    }

    const evaluation = await workflowEngine.evaluateTrigger(userId, trigger, data || {});

    res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  evaluateWorkflow,
};
