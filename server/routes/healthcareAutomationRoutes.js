const express = require('express');
const router = express.Router();
const healthcareAutomationController = require('../controllers/healthcareAutomationController');

// Autonomous Dashboard & Rule Management
router.get('/dashboard', healthcareAutomationController.getDashboard);
router.get('/rules', healthcareAutomationController.getRules);
router.post('/rules', healthcareAutomationController.createRule);

// Event-Driven Automation Dispatcher
router.post('/dispatch-event', healthcareAutomationController.dispatchEvent);

// Smart AI Scheduling & Routing
router.post('/ai-schedule', healthcareAutomationController.autonomousSchedule);

// Multi-Step Task Orchestration
router.post('/orchestrate-workflow', healthcareAutomationController.orchestrateWorkflow);

// Workflow Analytics & Telemetry
router.get('/analytics', healthcareAutomationController.getWorkflowAnalytics);

module.exports = router;
