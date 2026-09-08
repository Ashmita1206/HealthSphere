const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  evaluateWorkflow,
} = require('../controllers/workflowController');

router.use(protect);

router.get('/rules', getRules);
router.post('/rules', createRule);
router.put('/rules/:id', updateRule);
router.delete('/rules/:id', deleteRule);
router.post('/evaluate', evaluateWorkflow);

module.exports = router;
