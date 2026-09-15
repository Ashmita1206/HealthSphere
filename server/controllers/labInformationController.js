const labInformationService = require('../services/labInformationService');

exports.getDashboard = async (req, res) => {
  try {
    const dashboard = await labInformationService.getDashboard();
    return res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSpecimens = async (req, res) => {
  try {
    const specimens = await labInformationService.getSpecimens(req.query);
    return res.status(200).json({ success: true, count: specimens.length, data: specimens });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.registerSpecimen = async (req, res) => {
  try {
    const specimen = await labInformationService.registerSpecimen(req.body);
    return res.status(201).json({ success: true, data: specimen });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTechnicianQueue = async (req, res) => {
  try {
    const queue = await labInformationService.getTechnicianQueue(req.query);
    return res.status(200).json({ success: true, count: queue.length, data: queue });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitTestResults = async (req, res) => {
  try {
    const updatedOrder = await labInformationService.submitTestResults(req.params.testOrderId, req.body.results);
    return res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyResults = async (req, res) => {
  try {
    const verification = await labInformationService.verifyResults(req.params.testOrderId, req.body);
    return res.status(200).json(verification);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.detectAbnormalities = async (req, res) => {
  try {
    const analysis = await labInformationService.detectAbnormalities(req.body.parameters);
    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
