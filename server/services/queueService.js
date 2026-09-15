/**
 * HealthSphere Enterprise Background Job Processing & Queue Service
 * Built on BullMQ with Redis and high-reliability local queue fallback.
 * Manages Email, Reminder, Notification, AI, and OCR queues with retry policies and DLQ.
 */

const { Queue, Worker } = require('bullmq');
const logger = require('../utils/logger');

// Standardized retry policy for healthcare critical tasks
const DEFAULT_RETRY_POLICY = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: 100,
  removeOnFail: false, // Retain for Dead Letter Queue analysis
};

class HealthcareQueueService {
  constructor() {
    this.queues = {};
    this.workers = {};
    this.inMemoryQueues = {};
    this.deadLetterQueue = [];
    this.isRedisReady = false;

    // Available queues
    this.queueNames = ['email', 'reminder', 'notification', 'ai', 'ocr'];

    this.redisConfig = {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };

    this._initializeQueues();
  }

  _initializeQueues() {
    this.queueNames.forEach((name) => {
      // In-memory buffer fallback
      this.inMemoryQueues[name] = {
        waiting: [],
        active: [],
        completed: [],
        failed: [],
      };

      // Try creating BullMQ Queue if Redis URL / connection is configured
      if (process.env.REDIS_URL || process.env.ENABLE_BULLMQ_REDIS === 'true') {
        try {
          this.queues[name] = new Queue(name, {
            connection: this.redisConfig,
            defaultJobOptions: DEFAULT_RETRY_POLICY,
          });
        } catch (_e) {
          // Fallback to in-memory
        }
      }
    });
  }

  /**
   * Adds a job to the specified queue with automatic retry policy
   */
  async addJob(queueName, jobName, data, options = {}) {
    if (!this.queueNames.includes(queueName)) {
      throw new Error(`Queue "${queueName}" is not registered in HealthSphere OS`);
    }

    const jobOptions = {
      ...DEFAULT_RETRY_POLICY,
      ...options,
    };

    // If BullMQ is active and connected
    if (this.queues[queueName]) {
      try {
        const bullJob = await this.queues[queueName].add(jobName, data, jobOptions);
        logger.info(`Job added to BullMQ: [${queueName}] ${jobName} (${bullJob.id})`);
        return { id: bullJob.id, name: jobName, queue: queueName, data };
      } catch (_err) {
        // Fall back to memory queue
      }
    }

    // High-performance resilient in-memory processing
    const jobId = `mem-${queueName}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const memoryJob = {
      id: jobId,
      name: jobName,
      queue: queueName,
      data,
      attemptsMade: 0,
      maxAttempts: jobOptions.attempts || 3,
      status: 'waiting',
      timestamp: new Date().toISOString(),
    };

    this.inMemoryQueues[queueName].waiting.push(memoryJob);
    logger.info(`Job queued in background memory worker: [${queueName}] ${jobName} (${jobId})`);
    return memoryJob;
  }

  /**
   * Register a worker processor for a queue
   */
  async registerWorker(queueName, processor) {
    if (!this.queueNames.includes(queueName)) {
      throw new Error(`Invalid queue name: ${queueName}`);
    }

    this.workers[queueName] = processor;

    // If BullMQ is active
    if (this.queues[queueName]) {
      try {
        new Worker(
          queueName,
          async (job) => {
            return processor(job.data, job);
          },
          { connection: this.redisConfig }
        );
      } catch (_e) {
        // Ignore
      }
    }

    // Process queued in-memory job
    return this._processInMemoryQueue(queueName, processor);
  }

  /**
   * Process all waiting jobs for an in-memory queue
   */
  async processJobs(queueName, processor) {
    const handler = processor || this.workers[queueName];
    if (!handler) return;
    while (this.inMemoryQueues[queueName]?.waiting.length > 0) {
      await this._processInMemoryQueue(queueName, handler);
    }
  }

  async _processInMemoryQueue(queueName, processor) {
    const queueState = this.inMemoryQueues[queueName];
    if (!queueState || queueState.waiting.length === 0) return;

    const job = queueState.waiting.shift();
    queueState.active.push(job);
    job.status = 'active';

    try {
      const result = await processor(job.data, job);
      job.status = 'completed';
      job.result = result;
      queueState.active = queueState.active.filter((j) => j.id !== job.id);
      queueState.completed.push(job);
      return job;
    } catch (err) {
      job.attemptsMade++;
      queueState.active = queueState.active.filter((j) => j.id !== job.id);

      if (job.attemptsMade < job.maxAttempts) {
        job.status = 'waiting';
        queueState.waiting.push(job); // Retry
      } else {
        job.status = 'failed';
        job.error = err.message || String(err);
        queueState.failed.push(job);
        this._sendToDeadLetterQueue(queueName, job, err);
      }
      return job;
    }
  }


  _sendToDeadLetterQueue(queueName, job, err) {
    const dlqItem = {
      dlqId: `dlq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      originalQueue: queueName,
      originalJobId: job.id,
      jobName: job.name,
      data: job.data,
      error: err?.message || String(err),
      attemptsMade: job.attemptsMade,
      failedAt: new Date().toISOString(),
    };

    this.deadLetterQueue.push(dlqItem);
    logger.error(`Job moved to Dead Letter Queue (DLQ): [${queueName}] ${job.name}`, dlqItem);
  }

  _handleJobFailure(queueName, job, err) {
    if (job.attemptsMade >= (job.opts?.attempts || 3)) {
      this._sendToDeadLetterQueue(queueName, job, err);
    }
  }

  /**
   * Helper specialized dispatchers for the 5 required queues
   */
  async queueEmail(type, to, payload) {
    return this.addJob('email', `email:${type}`, { type, to, payload });
  }

  async queueReminder(reminderId, patientId, schedule) {
    return this.addJob('reminder', 'reminder:medication_alert', { reminderId, patientId, schedule });
  }

  async queueNotification(userId, notification) {
    return this.addJob('notification', 'notification:push', { userId, notification });
  }

  async queueAiInference(task, input) {
    return this.addJob('ai', `ai:${task}`, { task, input });
  }

  async queueOcr(documentId, fileUrl) {
    return this.addJob('ocr', 'ocr:report_parse', { documentId, fileUrl });
  }

  /**
   * Inspect queue job counters
   */
  async getQueueStats(queueName) {
    const memState = this.inMemoryQueues[queueName] || { waiting: [], active: [], completed: [], failed: [] };
    return {
      queue: queueName,
      waiting: memState.waiting.length,
      active: memState.active.length,
      completed: memState.completed.length,
      failed: memState.failed.length,
    };
  }

  /**
   * Retrieve all dead letter jobs
   */
  getDeadLetterJobs() {
    return [...this.deadLetterQueue];
  }

  /**
   * Clear all queues
   */
  async reset() {
    this.queueNames.forEach((name) => {
      this.inMemoryQueues[name] = {
        waiting: [],
        active: [],
        completed: [],
        failed: [],
      };
    });
    this.deadLetterQueue = [];
  }
}

const queueService = new HealthcareQueueService();

module.exports = queueService;
