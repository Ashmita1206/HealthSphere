const express = require('express');
const router = express.Router();
const labInformationController = require('../controllers/labInformationController');

// Lab Operations Dashboard
router.get('/dashboard', labInformationController.getDashboard);

// Specimen Tracking & Chain of Custody
router.get('/specimens', labInformationController.getSpecimens);
router.post('/specimens', labInformationController.registerSpecimen);

// Technician Queue (Prioritized by STAT / Critical)
router.get('/technician-queue', labInformationController.getTechnicianQueue);

// Test Results Entry & Automated Reference Evaluation
router.post('/tests/:testOrderId/results', labInformationController.submitTestResults);

// Pathologist Authorization & Sign-off
router.post('/tests/:testOrderId/verify', labInformationController.verifyResults);

// Standalone AI Multi-Analyte Abnormality Detection
router.post('/ai-detect-abnormalities', labInformationController.detectAbnormalities);

module.exports = router;
