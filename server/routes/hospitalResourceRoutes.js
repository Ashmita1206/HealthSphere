const express = require('express');
const router = express.Router();
const hospitalResourceController = require('../controllers/hospitalResourceController');

// Overview & Dashboard
router.get('/overview', hospitalResourceController.getOverview);

// Bed Management
router.get('/beds', hospitalResourceController.getBeds);
router.post('/beds/allocate', hospitalResourceController.allocateBed);
router.post('/beds/:bedId/discharge', hospitalResourceController.dischargeBed);

// ICU Occupancy & Ventilator
router.get('/icu', hospitalResourceController.getIcuStatus);

// Operating Theaters
router.get('/operating-theaters', hospitalResourceController.getOperatingTheaters);
router.post('/operating-theaters/schedule', hospitalResourceController.scheduleSurgery);

// Staff Allocation
router.get('/staff', hospitalResourceController.getStaff);

// Ambulance Fleet & Tracking
router.get('/ambulances', hospitalResourceController.getAmbulances);
router.post('/ambulances/dispatch', hospitalResourceController.dispatchAmbulance);

// Queue Monitoring
router.get('/queues', hospitalResourceController.getQueues);

// Equipment Status & Telemetry
router.get('/equipment', hospitalResourceController.getEquipment);

module.exports = router;
