import { describe, it, expect, beforeEach } from 'vitest';

describe('F40 — Background Jobs & Worker Queue Suite', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const queueService = require('../../server/services/queueService');

  beforeEach(async () => {
    await queueService.reset();
  });

  it('1. Queue Registration: initializes all 5 specialized enterprise queues', () => {
    expect(queueService.queueNames).toEqual(['email', 'reminder', 'notification', 'ai', 'ocr']);
  });

  it('2. Email Queue: enqueues transactional healthcare notification emails', async () => {
    const job = await queueService.queueEmail('appointment_confirmation', 'patient@healthsphere.io', {
      doctorName: 'Dr. Sarah Connor',
      dateTime: '2026-09-15 10:00 AM',
    });

    expect(job).toBeDefined();
    expect(job.queue).toBe('email');
    expect(job.name).toBe('email:appointment_confirmation');
    expect(job.data.to).toBe('patient@healthsphere.io');

    const stats = await queueService.getQueueStats('email');
    expect(stats.waiting).toBe(1);
  });

  it('3. Reminder Queue: schedules critical medication reminders', async () => {
    const job = await queueService.queueReminder('rem-404', 'patient-77', {
      medication: 'Amoxicillin 500mg',
      dosage: '1 capsule',
      time: '08:00 AM',
    });

    expect(job.queue).toBe('reminder');
    expect(job.data.reminderId).toBe('rem-404');
  });

  it('4. Notification Queue: enqueues push notifications for instant delivery', async () => {
    const job = await queueService.queueNotification('user-99', {
      title: 'Lab Report Ready',
      body: 'Your blood panel results are now available for review.',
    });

    expect(job.queue).toBe('notification');
    expect(job.data.notification.title).toBe('Lab Report Ready');
  });

  it('5. AI Queue & OCR Queue: supports asynchronous heavy ML and vision pipelines', async () => {
    const aiJob = await queueService.queueAiInference('risk_stratification', { patientId: 'p-100' });
    expect(aiJob.queue).toBe('ai');
    expect(aiJob.data.task).toBe('risk_stratification');

    const ocrJob = await queueService.queueOcr('doc-555', 'https://res.cloudinary.com/reports/blood_test.pdf');
    expect(ocrJob.queue).toBe('ocr');
    expect(ocrJob.data.documentId).toBe('doc-555');
  });

  it('6. Worker Processing: successfully executes background tasks', async () => {
    await queueService.queueEmail('welcome', 'new@patient.io', { name: 'John Doe' });

    let processedData: { name: string } | null = null;
    await queueService.registerWorker('email', async (data: { payload: { name: string } }) => {
      processedData = data.payload;
      return { sent: true };
    });

    const stats = await queueService.getQueueStats('email');
    expect(stats.completed).toBe(1);
    expect(processedData).toEqual({ name: 'John Doe' });
  });

  it('7. Dead Letter Queue & Retry Policy: captures permanently failed jobs', async () => {
    // Add job with 2 max attempts
    await queueService.addJob('ocr', 'ocr:faulty_document', { docId: 'corrupt-image' }, { attempts: 2 });

    const failingWorker = async () => {
      throw new Error('Corrupt DICOM image format: unreadable file');
    };

    // First attempt fails, re-enqueued to waiting
    await queueService.registerWorker('ocr', failingWorker);

    // Second attempt fails, attempts reaches 2, sent to DLQ
    await queueService._processInMemoryQueue('ocr', failingWorker);

    const dlq = queueService.getDeadLetterJobs();
    expect(dlq.length).toBe(1);
    expect(dlq[0].originalQueue).toBe('ocr');
    expect(dlq[0].jobName).toBe('ocr:faulty_document');
    expect(dlq[0].error).toContain('Corrupt DICOM image format');
    expect(dlq[0].attemptsMade).toBe(2);
  });

});
