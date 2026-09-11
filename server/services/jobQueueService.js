/**
 * HealthSphere Background Jobs Queue Engine (F38)
 * - Asynchronous background worker queue for heavy clinical processing
 * - Priority scheduling, retry management, real-time throughput metrics
 */

const logger = require('../utils/logger');

class JobQueueService {
  constructor() {
    this.jobs = new Map();
    this.queue = [];
    this.activeWorkers = 0;
    this.maxConcurrent = 3;
    this.completedCount = 0;
    this.failedCount = 0;

    // Start worker loop
    setInterval(() => this.processNext(), 2000);
  }

  enqueue(type, payload = {}, priority = 'normal') {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const job = {
      id,
      type,
      payload,
      priority,
      status: 'pending',
      progress: 0,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      error: null,
    };

    this.jobs.set(id, job);
    if (priority === 'critical' || priority === 'high') {
      this.queue.unshift(id);
    } else {
      this.queue.push(id);
    }

    logger.info(`Background job queued: [${id}] type: ${type} priority: ${priority}`);
    this.processNext();
    return job;
  }

  async processNext() {
    if (this.activeWorkers >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const jobId = this.queue.shift();
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'pending') return;

    this.activeWorkers++;
    job.status = 'active';
    job.startedAt = new Date();
    job.attempts++;

    try {
      await this.executeJob(job);
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date();
      this.completedCount++;
      logger.info(`Job completed: [${job.id}] ${job.type}`);
    } catch (err) {
      logger.error(`Job failed: [${job.id}] ${job.type}`, { error: err.message });
      job.error = err.message;
      if (job.attempts < job.maxAttempts) {
        job.status = 'pending';
        this.queue.push(job.id);
      } else {
        job.status = 'failed';
        this.failedCount++;
      }
    } finally {
      this.activeWorkers--;
      this.processNext();
    }
  }

  async executeJob(job) {
    // Simulated clinical task processor
    switch (job.type) {
      case 'ANALYTICS_ROLLUP':
      case 'OCR_INDEXING':
      case 'CACHE_WARMUP':
      case 'AUDIT_ARCHIVAL':
      default:
        // simulate async work
        await new Promise((r) => setTimeout(r, 100));
        return { success: true };
    }
  }

  getMetrics() {
    return {
      activeWorkers: this.activeWorkers,
      maxConcurrent: this.maxConcurrent,
      pendingJobs: this.queue.length,
      totalCompleted: this.completedCount,
      totalFailed: this.failedCount,
      recentJobs: Array.from(this.jobs.values())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 15),
    };
  }
}

const jobQueueService = new JobQueueService();

module.exports = jobQueueService;
