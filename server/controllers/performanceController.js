const { cacheStore } = require('../services/cacheService');
const jobQueueService = require('../services/jobQueueService');
const os = require('os');
const logger = require('../utils/logger');

async function getPerformanceMetrics(req, res) {
  try {
    const cacheMetrics = cacheStore.getMetrics();
    const queueMetrics = jobQueueService.getMetrics();

    const memUsage = process.memoryUsage();
    const systemMetrics = {
      heapUsedMb: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMb: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
      rssMb: (memUsage.rss / 1024 / 1024).toFixed(2),
      totalSystemMemMb: (os.totalmem() / 1024 / 1024).toFixed(0),
      freeSystemMemMb: (os.freemem() / 1024 / 1024).toFixed(0),
      cpuCores: os.cpus().length,
      uptimeSeconds: process.uptime().toFixed(0),
    };

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      cache: cacheMetrics,
      queue: queueMetrics,
      system: systemMetrics,
    });
  } catch (err) {
    logger.error('Error fetching performance metrics', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch metrics' });
  }
}

async function purgeCache(req, res) {
  try {
    const cleared = cacheStore.clear();
    return res.status(200).json({
      success: true,
      clearedKeys: cleared,
      message: 'Cache successfully purged',
    });
  } catch (err) {
    logger.error('Error purging cache', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to clear cache' });
  }
}

async function triggerJob(req, res) {
  try {
    const { type = 'ANALYTICS_ROLLUP', priority = 'normal', payload = {} } = req.body;
    const job = jobQueueService.enqueue(type, payload, priority);
    return res.status(201).json({
      success: true,
      job,
      message: `Background job ${job.id} enqueued`,
    });
  } catch (err) {
    logger.error('Error triggering job', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to enqueue job' });
  }
}

module.exports = {
  getPerformanceMetrics,
  purgeCache,
  triggerJob,
};
