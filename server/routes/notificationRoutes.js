const router = require('express').Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const { protect } = require('../middlewares/authMiddleware');

const mapNotification = (n) => ({
  id: n._id ? n._id.toString() : n.id,
  _id: n._id ? n._id.toString() : n.id,
  userId: n.userId ? n.userId.toString() : undefined,
  type: n.type || 'general',
  title: n.title,
  message: n.message,
  timestamp: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
  read: Boolean(n.read),
  severity: n.severity || n.priority || 'info',
  priority: n.priority || 'normal',
  route: n.route || '/dashboard',
  metadata: n.metadata || {},
  createdAt: n.createdAt,
  updatedAt: n.updatedAt,
});

// All notification routes are protected
router.use(protect);

// GET /api/notifications — fetch authenticated user's notifications
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const query = { userId };
    if (req.query.read !== undefined) {
      query.read = req.query.read === 'true';
    }
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, data: notifications.map(mapNotification) });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications — create a new notification
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, message, type, severity, priority, route, metadata } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const created = await Notification.create({
      userId,
      title: title.trim(),
      message: message.trim(),
      type: type || 'general',
      severity: severity || 'info',
      priority: priority || 'normal',
      route: route || '/dashboard',
      metadata: metadata || {},
    });

    res.status(201).json({ success: true, data: mapNotification(created) });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation failed', details: err.message });
    }
    next(err);
  }
});

// PUT /api/notifications/:id/read — mark single notification as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      const existsForOtherUser = await Notification.findById(id);
      if (existsForOtherUser) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this notification' });
      }
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, data: mapNotification(notification) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notifications/:id — delete single notification
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      const existsForOtherUser = await Notification.findById(id);
      if (existsForOtherUser) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this notification' });
      }
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await Notification.deleteOne({ _id: id, userId });
    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/subscribe — register/upsert Web Push subscription
router.post('/subscribe', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { endpoint, keys, expirationTime } = req.body || {};

    if (!endpoint || typeof endpoint !== 'string' || !endpoint.trim()) {
      return res.status(400).json({ success: false, message: 'Endpoint is required and must be a string' });
    }

    if (!keys || typeof keys !== 'object') {
      return res.status(400).json({ success: false, message: 'Subscription keys are required' });
    }

    await PushSubscription.findOneAndUpdate(
      { userId, endpoint: endpoint.trim() },
      {
        $set: {
          keys: {
            p256dh: keys.p256dh || '',
            auth: keys.auth || '',
          },
          expirationTime: expirationTime || null,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, message: 'Push subscription registered successfully' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation failed', details: err.message });
    }
    next(err);
  }
});

module.exports = router;
