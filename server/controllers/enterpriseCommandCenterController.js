const enterpriseCommandCenterService = require('../services/enterpriseCommandCenterService');

exports.getOverview = async (req, res) => {
  try {
    const overview = await enterpriseCommandCenterService.getUnifiedOverview();
    return res.status(200).json({ success: true, data: overview });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLiveAIInsights = async (req, res) => {
  try {
    const insights = await enterpriseCommandCenterService.getLiveAIInsights();
    return res.status(200).json({ success: true, count: insights.length, data: insights });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInfrastructureTelemetry = async (req, res) => {
  try {
    const telemetry = await enterpriseCommandCenterService.getInfrastructureTelemetry();
    return res.status(200).json({ success: true, data: telemetry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    const health = await enterpriseCommandCenterService.getSystemHealth();
    return res.status(200).json({ success: true, data: health });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBackgroundJobs = async (req, res) => {
  try {
    const jobs = await enterpriseCommandCenterService.getBackgroundJobs();
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
