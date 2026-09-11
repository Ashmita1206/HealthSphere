const express = require('express');
const router = express.Router();
const enterpriseCommandCenterController = require('../controllers/enterpriseCommandCenterController');

// Unified Command Center Dashboard & Subsystems
router.get('/overview', enterpriseCommandCenterController.getOverview);

// Live Streaming AI Insights & Clinical Alerts
router.get('/insights', enterpriseCommandCenterController.getLiveAIInsights);

// Real-Time Infrastructure & Operational Telemetry
router.get('/telemetry', enterpriseCommandCenterController.getInfrastructureTelemetry);

// System Health & Latency Metrics
router.get('/system-health', enterpriseCommandCenterController.getSystemHealth);

// Background Jobs & Queue Telemetry
router.get('/jobs', enterpriseCommandCenterController.getBackgroundJobs);

module.exports = router;
