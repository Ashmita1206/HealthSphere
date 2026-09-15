const healthcareAutomationService = require('../services/healthcareAutomationService');

exports.getDashboard = async (req, res) => {
  try {
    const data = await healthcareAutomationService.getDashboard();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRules = async (req, res) => {
  try {
    const rules = await healthcareAutomationService.getRules(req.query);
    return res.status(200).json({ success: true, count: rules.length, data: rules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRule = async (req, res) => {
  try {
    const rule = await healthcareAutomationService.createRule(req.body);
    return res.status(201).json({ success: true, data: rule });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.dispatchEvent = async (req, res) => {
  try {
    const result = await healthcareAutomationService.dispatchEvent(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.autonomousSchedule = async (req, res) => {
  try {
    const appointment = await healthcareAutomationService.autonomousSchedule(req.body);
    return res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.orchestrateWorkflow = async (req, res) => {
  try {
    const job = await healthcareAutomationService.orchestrateWorkflow(req.body.workflowType, req.body.context);
    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getWorkflowAnalytics = async (req, res) => {
  try {
    const analytics = await healthcareAutomationService.getWorkflowAnalytics();
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
