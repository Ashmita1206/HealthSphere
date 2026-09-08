const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const HealthTimeline = require('../models/HealthTimeline');
const { protect } = require('../middlewares/authMiddleware');

// All timeline routes require authentication
router.use(protect);

/**
 * GET /api/timeline
 * Fetch authenticated user's timeline events with optional category filtering and pagination.
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { category, eventType, search } = req.query;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const skip = (page - 1) * limit;

    const query = { userId };

    const selectedFilter = category || eventType;
    if (selectedFilter && selectedFilter !== 'all' && selectedFilter !== 'All') {
      query.$or = [
        { category: selectedFilter.toLowerCase() },
        { eventType: selectedFilter.toLowerCase() },
      ];
    }

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$and = (query.$and || []).concat([
        {
          $or: [{ title: regex }, { description: regex }],
        },
      ]);
    }

    const [events, total] = await Promise.all([
      HealthTimeline.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      HealthTimeline.countDocuments(query),
    ]);

    const formattedEvents = events.map((doc) => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      eventType: doc.eventType,
      category: doc.category || doc.eventType,
      title: doc.title,
      description: doc.description,
      metadata: doc.metadata || {},
      relatedId: doc.relatedId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      timestamp: doc.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedEvents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/timeline
 * Create a new health timeline event for the authenticated user.
 */
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, description, eventType, category, metadata, relatedId } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const type = eventType || category || 'general';

    const created = await HealthTimeline.create({
      userId,
      eventType: type,
      category: category || type,
      title: title.trim(),
      description: description.trim(),
      metadata: metadata || {},
      relatedId: relatedId || null,
    });

    res.status(201).json({
      success: true,
      data: {
        id: created._id.toString(),
        _id: created._id.toString(),
        userId: created.userId.toString(),
        eventType: created.eventType,
        category: created.category,
        title: created.title,
        description: created.description,
        metadata: created.metadata,
        relatedId: created.relatedId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        timestamp: created.createdAt,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation failed', details: err.message });
    }
    next(err);
  }
});

/**
 * DELETE /api/timeline/:id
 * Delete a user's timeline event with IDOR protection.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid timeline event ID' });
    }

    const event = await HealthTimeline.findOne({ _id: id, userId });
    if (!event) {
      const existsForOther = await HealthTimeline.findById(id);
      if (existsForOther) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this timeline event' });
      }
      return res.status(404).json({ success: false, message: 'Timeline event not found' });
    }

    await HealthTimeline.deleteOne({ _id: id, userId });
    res.status(200).json({ success: true, message: 'Timeline event deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
