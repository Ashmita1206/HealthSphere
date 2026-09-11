const router = require('express').Router();
const mongoose = require('mongoose');
const { metricsRegistry } = require('../utils/metrics');
const AuditLog = require('../models/AuditLog');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

/**
 * Health Endpoints for Production Kubernetes / Orchestrators
 */

// General comprehensive health check
router.get('/health', async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1 || process.env.NODE_ENV === 'test';
  const mem = process.memoryUsage();

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: dbStatusMap[dbState] || 'unknown',
        healthy: dbState === 1,
      },
      memory: {
        rssMb: Math.round(mem.rss / (1024 * 1024)),
        heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
      },
    },
  });
});

// Liveness Probe: process is alive
router.get('/health/liveness', (_req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness Probe: ready to accept traffic
router.get('/health/readiness', (_req, res) => {
  const isReady = mongoose.connection.readyState === 1 || process.env.NODE_ENV === 'test';
  if (isReady) {
    return res.status(200).json({ status: 'ready' });
  }
  res.status(503).json({ status: 'not_ready', reason: 'Database connection not ready' });
});

/**
 * Prometheus Metrics Scraping Endpoint
 */
router.get('/metrics', (_req, res) => {
  const metrics = metricsRegistry.toPrometheusFormat();
  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metrics);
});

/**
 * Audit Events Query API
 */
router.get('/api/admin/audit-logs', protect, authorizeRoles('admin', 'superadmin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
