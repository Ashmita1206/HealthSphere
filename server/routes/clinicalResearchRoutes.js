const express = require('express');
const router = express.Router();
const clinicalResearchController = require('../controllers/clinicalResearchController');

// Research & Clinical Trials Overview
router.get('/overview', clinicalResearchController.getOverview);

// Clinical Trials Registry & Search
router.get('/trials', clinicalResearchController.getTrials);
router.get('/trials/:trialId/subjects', clinicalResearchController.getEnrolledSubjects);

// AI Patient Eligibility Matching
router.post('/match-eligibility', clinicalResearchController.matchEligibility);

// Subject Enrollment & Stratified Cohort Selection
router.post('/enroll', clinicalResearchController.enrollSubject);

// Research & Diversity Analytics
router.get('/analytics', clinicalResearchController.getResearchAnalytics);

// Publications & Academic Impact
router.get('/publications', clinicalResearchController.getPublications);

module.exports = router;
