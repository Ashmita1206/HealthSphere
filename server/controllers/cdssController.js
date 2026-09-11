const { cdssService } = require('../services/cdssService');

async function evaluateCase(req, res, next) {
  try {
    const result = await cdssService.evaluatePatientCase(req.body || {});
    res.json({ success: true, cdss: result });
  } catch (error) {
    next(error);
  }
}

async function checkInteractions(req, res, next) {
  try {
    const { medications = [] } = req.body;
    const result = cdssService.checkDrugInteractions(medications);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function checkContraindications(req, res, next) {
  try {
    const { patientProfile = {}, proposedDrugs = [] } = req.body;
    const result = cdssService.checkContraindications(patientProfile, proposedDrugs);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getDifferentialDiagnosis(req, res, next) {
  try {
    const result = cdssService.generateDifferentialDiagnosis(req.body || {});
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getRiskStratification(req, res, next) {
  try {
    const result = cdssService.evaluateRiskStratification(req.body || {});
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  evaluateCase,
  checkInteractions,
  checkContraindications,
  getDifferentialDiagnosis,
  getRiskStratification,
};
