const router = require('express').Router();
const { protect } = require('../middlewares/authMiddleware');
const c = require('../controllers/collaborationController');

// All collaboration endpoints require authentication
router.use(protect);

// Doctor & Staff Presence
router.get('/presence', c.getStaffPresence);
router.post('/presence', c.updateMyPresence);

// Care Team Discussion Threads
router.get('/threads', c.getCareTeamThreads);
router.post('/threads', c.createCareTeamThread);
router.post('/threads/:threadId/messages', c.postThreadMessage);

// Shared Clinical Notes (Multi-Disciplinary SOAP / Rounds)
router.get('/notes/:patientId', c.getSharedClinicalNote);
router.put('/notes/:noteId', c.updateSharedClinicalNote);

// Patient Record Field Locks (Concurrency Management)
router.post('/locks/acquire', c.acquireLock);
router.post('/locks/release', c.releaseLock);

module.exports = router;
