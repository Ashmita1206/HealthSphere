const express = require('express');
const router = express.Router();
const smartPharmacyController = require('../controllers/smartPharmacyController');

// Medicine Inventory
router.get('/inventory', smartPharmacyController.getInventory);
router.post('/inventory/item', smartPharmacyController.addItem);

// Expiry Prediction & FEFO Management
router.get('/expiry-prediction', smartPharmacyController.getExpiryPrediction);

// Auto Refill Automation
router.post('/auto-refill', smartPharmacyController.triggerAutoRefill);

// Digital Prescription Verification
router.post('/verify-prescription', smartPharmacyController.verifyPrescription);

// Generic Drug Substitutions
router.get('/substitutions/:drugName', smartPharmacyController.suggestSubstitutions);

// Purchase Analytics & Formulary Turnover
router.get('/purchase-analytics', smartPharmacyController.getPurchaseAnalytics);

module.exports = router;
