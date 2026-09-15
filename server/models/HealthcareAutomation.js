const mongoose = require('mongoose');

const AutomationActionSchema = new mongoose.Schema({
  actionType: { 
    type: String, 
    enum: [
      'SEND_PATIENT_REMINDER', 
      'DISPATCH_STAT_ALERT', 
      'SCHEDULE_FOLLOW_UP', 
      'AUTO_REFILL_MEDICATION', 
      'ASSIGN_SPECIALIST_TEAM', 
      'SMART_ROUTE_TRIAGE'
    ], 
    required: true 
  },
  targetRecipient: { type: String, required: true },
  payloadTemplate: { type: String, default: '' }
}, { _id: false });

const AutomationRuleSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  triggerEvent: { 
    type: String, 
    enum: [
      'LAB_CRITICAL_VALUE', 
      'APPOINTMENT_UPCOMING_24H', 
      'VITALS_DETERIORATION', 
      'DISCHARGE_INITIATED', 
      'MEDICATION_REFILL_DUE', 
      'EMERGENCY_AMBULANCE_DISPATCH'
    ], 
    required: true 
  },
  conditionExpression: { type: String, default: 'true' }, // e.g. "value > 0.04" or "acuity == 'critical'"
  actions: [AutomationActionSchema],
  status: { type: String, enum: ['active', 'paused'], default: 'active' },
  executionCount: { type: Number, default: 0 },
  lastExecutedAt: { type: Date, default: null }
}, {
  timestamps: true,
  autoIndex: false,
  bufferCommands: false
});

const OrchestrationStepSchema = new mongoose.Schema({
  stepId: { type: String, required: true },
  stepName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
  outputMessage: { type: String, default: '' },
  completedAt: { type: Date, default: null }
}, { _id: false });

const OrchestrationJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  workflowName: { type: String, required: true },
  priority: { type: String, enum: ['routine', 'high', 'critical'], default: 'high' },
  steps: [OrchestrationStepSchema],
  overallStatus: { type: String, enum: ['in_progress', 'completed', 'failed'], default: 'in_progress' },
  initiatedBy: { type: String, default: 'AI Autonomous Engine' },
  completedAt: { type: Date, default: null }
}, {
  timestamps: true,
  autoIndex: false,
  bufferCommands: false
});

module.exports = {
  AutomationRule: mongoose.model('AutomationRule', AutomationRuleSchema),
  OrchestrationJob: mongoose.model('OrchestrationJob', OrchestrationJobSchema)
};
