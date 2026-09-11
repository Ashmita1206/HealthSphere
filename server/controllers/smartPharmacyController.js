const smartPharmacyService = require('../services/smartPharmacyService');

exports.getInventory = async (req, res) => {
  try {
    const items = await smartPharmacyService.getInventory(req.query);
    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const item = await smartPharmacyService.addItem(req.body);
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getExpiryPrediction = async (req, res) => {
  try {
    const days = req.query.days ? Number(req.query.days) : 90;
    const prediction = await smartPharmacyService.getExpiryPrediction(days);
    return res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.triggerAutoRefill = async (req, res) => {
  try {
    const result = await smartPharmacyService.triggerAutoRefills();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPrescription = async (req, res) => {
  try {
    const result = await smartPharmacyService.verifyPrescription(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.suggestSubstitutions = async (req, res) => {
  try {
    const substitutions = await smartPharmacyService.suggestSubstitutions(req.params.drugName);
    return res.status(200).json({ success: true, data: substitutions });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPurchaseAnalytics = async (req, res) => {
  try {
    const analytics = await smartPharmacyService.getPurchaseAnalytics();
    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
