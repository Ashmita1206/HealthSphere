const populationIntelligenceService = require('../services/populationIntelligenceService');

exports.getOverview = async (req, res) => {
  try {
    const data = await populationIntelligenceService.getOverview();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOutbreaks = async (req, res) => {
  try {
    const data = await populationIntelligenceService.getOutbreaks();
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.predictOutbreak = async (req, res) => {
  try {
    const forecast = await populationIntelligenceService.predictOutbreak(req.body);
    return res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getHotspots = async (req, res) => {
  try {
    const data = await populationIntelligenceService.getHotspots();
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRegions = async (req, res) => {
  try {
    const data = await populationIntelligenceService.getRegionalAnalytics(req.query.regionCode);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getVaccinations = async (req, res) => {
  try {
    const data = await populationIntelligenceService.getVaccinationCoverage();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChronicTrends = async (req, res) => {
  try {
    const data = await populationIntelligenceService.getChronicDiseaseTrends();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHeatmap = async (req, res) => {
  try {
    const data = await populationIntelligenceService.getHeatmapData();
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
