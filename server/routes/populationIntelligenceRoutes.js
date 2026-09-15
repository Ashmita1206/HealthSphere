const express = require('express');
const router = express.Router();
const populationIntelligenceController = require('../controllers/populationIntelligenceController');

// Overview & Dashboard
router.get('/overview', populationIntelligenceController.getOverview);

// Disease Outbreak Surveillance & AI Forecasting
router.get('/outbreaks', populationIntelligenceController.getOutbreaks);
router.post('/predict', populationIntelligenceController.predictOutbreak);

// Geographic Hotspots & Heatmap
router.get('/hotspots', populationIntelligenceController.getHotspots);
router.get('/heatmap', populationIntelligenceController.getHeatmap);

// Regional Demographics & Health Strain
router.get('/regions', populationIntelligenceController.getRegions);

// Vaccination Coverage Tracking
router.get('/vaccinations', populationIntelligenceController.getVaccinations);

// Chronic Disease 5-Year Trends
router.get('/chronic-trends', populationIntelligenceController.getChronicTrends);

module.exports = router;
