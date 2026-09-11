const billingInsuranceService = require('../services/billingInsuranceService');

exports.getRevenueDashboard = async (req, res) => {
  try {
    const dashboard = await billingInsuranceService.getRevenueDashboard();
    return res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyInsurance = async (req, res) => {
  try {
    const { policyNumber, providerName } = req.body;
    const result = await billingInsuranceService.verifyInsuranceEligibility(policyNumber, providerName);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await billingInsuranceService.getInvoices(req.query);
    return res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const invoice = await billingInsuranceService.generateInvoice(req.body);
    return res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getClaims = async (req, res) => {
  try {
    const claims = await billingInsuranceService.getClaims(req.query);
    return res.status(200).json({ success: true, count: claims.length, data: claims });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitClaim = async (req, res) => {
  try {
    const claim = await billingInsuranceService.submitClaim(req.body);
    return res.status(201).json({ success: true, data: claim });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.adjudicateClaim = async (req, res) => {
  try {
    const result = await billingInsuranceService.adjudicateClaim(req.params.claimId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const result = await billingInsuranceService.recordPayment(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
