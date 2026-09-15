const clinicalResearchService = require('../services/clinicalResearchService');

exports.getOverview = async (req, res) => {
  try {
    const data = await clinicalResearchService.getResearchOverview();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTrials = async (req, res) => {
  try {
    const trials = await clinicalResearchService.getTrials(req.query);
    return res.status(200).json({ success: true, count: trials.length, data: trials });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.matchEligibility = async (req, res) => {
  try {
    const result = await clinicalResearchService.matchPatientEligibility(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.enrollSubject = async (req, res) => {
  try {
    const result = await clinicalResearchService.enrollSubject(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getEnrolledSubjects = async (req, res) => {
  try {
    const subjects = await clinicalResearchService.getEnrolledSubjects(req.params.trialId);
    return res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getResearchAnalytics = async (req, res) => {
  try {
    const analytics = await clinicalResearchService.getResearchAnalytics();
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPublications = async (req, res) => {
  try {
    const publications = await clinicalResearchService.getPublications();
    return res.status(200).json({ success: true, count: publications.length, data: publications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
