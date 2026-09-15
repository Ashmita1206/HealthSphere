const express = require('express');
const router = express.Router();
const billingInsuranceController = require('../controllers/billingInsuranceController');

// Revenue & Billing Operations Dashboard
router.get('/revenue-dashboard', billingInsuranceController.getRevenueDashboard);

// Real-Time Insurance Eligibility Verification
router.post('/verify-insurance', billingInsuranceController.verifyInsurance);

// Invoices & Patient Billing
router.get('/invoices', billingInsuranceController.getInvoices);
router.post('/invoices', billingInsuranceController.generateInvoice);

// Claims Processing & EDI Adjudication
router.get('/claims', billingInsuranceController.getClaims);
router.post('/claims/submit', billingInsuranceController.submitClaim);
router.post('/claims/:claimId/adjudicate', billingInsuranceController.adjudicateClaim);

// Payments & Ledger Settlement
router.post('/payments', billingInsuranceController.recordPayment);

module.exports = router;
