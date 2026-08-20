const router = require('express').Router();
const { protect } = require('../middlewares/authMiddleware');

// In-memory notifications store fallback per user
const userNotificationsMap = new Map();
const pushSubscriptionsMap = new Map();

// Helper to seed initial notification items
function getInitialUserNotifications(userId) {
  if (!userNotificationsMap.has(userId)) {
    userNotificationsMap.set(userId, [
      {
        id: `notif-${Date.now()}-1`,
        userId,
        type: 'report',
        title: 'Lab Analysis Baseline Verified',
        message: 'Your Blood Panel CBC OCR report has been analyzed by HealthSphere AI.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        read: false,
        severity: 'info',
        route: '/reports',
      },
      {
        id: `notif-${Date.now()}-2`,
        userId,
        type: 'medication',
        title: 'Prescription Schedule Reminder',
        message: 'Time for Metformin 500mg (Post Lunch). Take with 250ml water.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: false,
        severity: 'attention',
        route: '/medicines',
      },
    ]);
  }
  return userNotificationsMap.get(userId);
}

// All notification routes are protected
router.use(protect);

// GET /api/notifications — fetch user notifications
router.get('/', (req, res) => {
  const userId = req.user.id || req.user._id;
  const notifications = getInitialUserNotifications(userId);
  res.status(200).json({ success: true, data: notifications });
});

// PUT /api/notifications/:id/read — mark single notification as read
router.put('/:id/read', (req, res) => {
  const userId = req.user.id || req.user._id;
  const notifications = getInitialUserNotifications(userId);
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) {
    notif.read = true;
  }
  res.status(200).json({ success: true, data: notif });
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', (req, res) => {
  const userId = req.user.id || req.user._id;
  const notifications = getInitialUserNotifications(userId);
  notifications.forEach((n) => (n.read = true));
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

// POST /api/notifications/subscribe — register Web Push subscription
router.post('/subscribe', (req, res) => {
  const userId = req.user.id || req.user._id;
  const subscription = req.body;
  pushSubscriptionsMap.set(userId, subscription);
  res.status(201).json({ success: true, message: 'Push subscription registered successfully' });
});

module.exports = router;
