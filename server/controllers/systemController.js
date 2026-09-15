/**
 * HealthSphere System Controller
 * Health check, Kubernetes/Docker probes, and operational telemetry
 */

const mongoose = require('mongoose');
const os = require('os');
const metricsService = require('../services/metricsService');

/**
 * Detailed system health report
 */
async function getHealth(_req, res) {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbLatencyMs = null;

  try {
    if (mongoose.connection.readyState === 1) {
      if (mongoose.connection.db && mongoose.connection.db.admin) {
        await mongoose.connection.db.admin().ping();
      }
      dbStatus = 'connected';
      dbLatencyMs = Date.now() - startTime;
    }
  } catch (_err) {
    dbStatus = 'degraded';
  }

  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());
  const isHealthy = dbStatus !== 'degraded';
  const cpus = os.cpus();

  const healthReport = {
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'healthsphere-healthcare-os',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    cpu: {
      cores: cpus.length,
      model: cpus[0]?.model || 'Unknown',
      loadAvg: os.loadavg(),
    },
    memory: {
      rssMB: Number((memory.rss / (1024 * 1024)).toFixed(2)),
      heapUsedMB: Number((memory.heapUsed / (1024 * 1024)).toFixed(2)),
      heapTotalMB: Number((memory.heapTotal / (1024 * 1024)).toFixed(2)),
      systemFreeMB: Number((os.freemem() / (1024 * 1024)).toFixed(2)),
      systemTotalMB: Number((os.totalmem() / (1024 * 1024)).toFixed(2)),
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  };

  res.status(isHealthy ? 200 : 503).json(healthReport);
}


/**
 * Liveness probe: returns 200 if process event loop is alive
 */
function getLiveness(_req, res) {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Readiness probe: checks dependencies before accepting traffic
 */
async function getReadiness(_req, res) {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    return res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    status: 'not_ready',
    database: 'disconnected',
    message: 'Backend is warming up or awaiting database connection',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Operational metrics report
 */
function getMetrics(_req, res) {
  const metrics = metricsService.getMetrics();
  res.status(200).json({
    success: true,
    data: metrics,
  });
}

module.exports = {
  getHealth,
  getLiveness,
  getReadiness,
  getMetrics,
};
