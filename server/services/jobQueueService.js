const crypto = require('crypto');
const logger = require('../utils/logger');

class JobQueueService {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 3;
    this.runningCount = 0;
    this.queue = [];
    this.jobs = new Map();
    this.handlers = new Map();

    // Default handlers
    this.registerHandler('SEND_EMAIL', async (payload) => {
      logger.info('Executing async email dispatch', { to: payload.to, subject: payload.subject });
      return { sent: true, timestamp: new Date().toISOString() };
    });

    this.registerHandler('GENERATE_HEALTH_REPORT', async (payload) => {
      logger.info('Generating asynchronous health analytics report', { userId: payload.userId });
      return { reportId: `REP-${Date.now()}`, status: 'COMPLETED' };
    });

    this.registerHandler('CACHE_WARMUP', async (payload) => {
      logger.info('Executing cache warmup task', { scope: payload.scope });
      return { warmed: true };
    });
  }

  registerHandler(type, fn) {
    this.handlers.set(type, fn);
  }

  enqueue(type, payload = {}, options = {}) {
    const jobId = options.id || `job_${crypto.randomBytes(8).toString('hex')}`;
    const job = {
      id: jobId,
      type,
      payload,
      priority: options.priority || 'normal', // high, normal, low
      maxRetries: options.maxRetries || 2,
      attempts: 0,
      status: 'QUEUED', // QUEUED, PROCESSING, COMPLETED, FAILED
      result: null,
      error: null,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
    };

    this.jobs.set(jobId, job);

    if (job.priority === 'high') {
      this.queue.unshift(jobId);
    } else {
      this.queue.push(jobId);
    }

    // Trigger processing
    this._processNext();

    return job;
  }

  async _processNext() {
    if (this.runningCount >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const jobId = this.queue.shift();
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'COMPLETED') {
      return this._processNext();
    }

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = 'FAILED';
      job.error = `No registered handler for job type: ${job.type}`;
      return this._processNext();
    }

    this.runningCount += 1;
    job.status = 'PROCESSING';
    job.startedAt = new Date();
    job.attempts += 1;

    try {
      const result = await handler(job.payload);
      job.status = 'COMPLETED';
      job.result = result;
      job.completedAt = new Date();
    } catch (err) {
      if (job.attempts <= job.maxRetries) {
        job.status = 'QUEUED';
        this.queue.push(jobId); // Re-queue
      } else {
        job.status = 'FAILED';
        job.error = err.message;
        job.completedAt = new Date();
        logger.error('Background job permanently failed', { jobId: job.id, type: job.type, error: err.message });
      }
    } finally {
      this.runningCount -= 1;
      this._processNext();
    }
  }

  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  getStats() {
    let queued = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;

    for (const job of this.jobs.values()) {
      if (job.status === 'QUEUED') queued += 1;
      else if (job.status === 'PROCESSING') processing += 1;
      else if (job.status === 'COMPLETED') completed += 1;
      else if (job.status === 'FAILED') failed += 1;
    }

    return {
      totalJobs: this.jobs.size,
      queued,
      processing,
      completed,
      failed,
      concurrency: this.concurrency,
      runningCount: this.runningCount,
    };
  }
}

const jobQueueService = new JobQueueService();

module.exports = {
  jobQueueService,
  JobQueueService,
};
