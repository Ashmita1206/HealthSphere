import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';

const req = createRequire(import.meta.url);
const automationRules = req('../../server/services/automationRules');
const workflowEngine = req('../../server/services/workflowEngine');
const workflowController = req('../../server/controllers/workflowController');
const notificationService = req('../../server/services/notificationService');
const timelineService = req('../../server/services/timelineService');

describe('F22 — Healthcare Workflow Automation Backend Suite', () => {
  const patientUserId = '64b1f77bcf86cd7994390001';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. evaluateCondition correctly evaluates comparison operators', () => {
    // gt & lt
    expect(automationRules.evaluateCondition({ systolic: 185 }, { field: 'systolic', operator: 'gt', value: 180 })).toBe(true);
    expect(automationRules.evaluateCondition({ systolic: 170 }, { field: 'systolic', operator: 'gt', value: 180 })).toBe(false);
    expect(automationRules.evaluateCondition({ spo2: 88 }, { field: 'spo2', operator: 'lt', value: 90 })).toBe(true);
    expect(automationRules.evaluateCondition({ spo2: 95 }, { field: 'spo2', operator: 'lt', value: 90 })).toBe(false);

    // gte & lte
    expect(automationRules.evaluateCondition({ missedDoses: 1 }, { field: 'missedDoses', operator: 'gte', value: 1 })).toBe(true);
    expect(automationRules.evaluateCondition({ hoursUntil: 24 }, { field: 'hoursUntil', operator: 'lte', value: 24 })).toBe(true);
    expect(automationRules.evaluateCondition({ hoursUntil: 36 }, { field: 'hoursUntil', operator: 'lte', value: 24 })).toBe(false);

    // contains & in
    expect(automationRules.evaluateCondition({ medicine: 'Metformin 500mg' }, { field: 'medicine', operator: 'contains', value: 'Metformin' })).toBe(true);
    expect(automationRules.evaluateCondition({ status: 'critical' }, { field: 'status', operator: 'in', value: ['critical', 'severe'] })).toBe(true);
  });

  it('2. BP > 180 triggers Hypertensive Crisis pipeline: Emergency Alert, Doctor Notification, Timeline Event, Push Notification', async () => {
    const notifSpy = vi.spyOn(notificationService, 'createNotification').mockResolvedValue({});
    const timelineSpy = vi.spyOn(timelineService, 'createEvent').mockResolvedValue({});

    const evaluation = await workflowEngine.evaluateTrigger(patientUserId, 'vital_breach', { systolic: 192 });

    expect(evaluation.success).toBe(true);
    expect(evaluation.matchedCount).toBeGreaterThanOrEqual(1);

    const crisisPipeline = evaluation.executedPipelines.find(
      (p: any) => p.ruleId === 'RULE_HYPERTENSIVE_CRISIS'
    );
    expect(crisisPipeline).toBeDefined();

    // 4 actions: emergency_alert, doctor_notification, timeline_event, push_notification
    expect(crisisPipeline.actionsExecuted.length).toBe(4);
    const executedActionTypes = crisisPipeline.actionsExecuted.map((a: any) => a.actionType);
    expect(executedActionTypes).toContain('emergency_alert');
    expect(executedActionTypes).toContain('doctor_notification');
    expect(executedActionTypes).toContain('timeline_event');
    expect(executedActionTypes).toContain('push_notification');

    // Emergency notification created
    expect(notifSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: patientUserId,
        type: 'emergency',
        severity: 'critical',
      })
    );

    // Timeline event created
    expect(timelineSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: patientUserId,
        eventType: 'emergency',
        title: expect.stringContaining('Hypertensive'),
      })
    );
  });

  it('3. Medication Missed triggers Care Cascade: Reminder, Family Notification, Doctor Notification', async () => {
    const notifSpy = vi.spyOn(notificationService, 'createNotification').mockResolvedValue({});

    const evaluation = await workflowEngine.evaluateTrigger(patientUserId, 'medication_missed', { missedDoses: 2 });

    expect(evaluation.success).toBe(true);
    const missedMedPipeline = evaluation.executedPipelines.find(
      (p: any) => p.ruleId === 'RULE_MISSED_MEDICATION'
    );
    expect(missedMedPipeline).toBeDefined();

    const actionTypes = missedMedPipeline.actionsExecuted.map((a: any) => a.actionType);
    expect(actionTypes).toContain('reminder');
    expect(actionTypes).toContain('family_notification');
    expect(actionTypes).toContain('doctor_notification');

    expect(notifSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: patientUserId,
        type: 'medication',
      })
    );
  });

  it('4. Appointment Tomorrow (hoursUntil <= 24) triggers: Reminder, Directions, Checklist', async () => {
    const notifSpy = vi.spyOn(notificationService, 'createNotification').mockResolvedValue({});

    const evaluation = await workflowEngine.evaluateTrigger(patientUserId, 'appointment_upcoming', { hoursUntil: 18 });

    expect(evaluation.success).toBe(true);
    const apptPipeline = evaluation.executedPipelines.find(
      (p: any) => p.ruleId === 'RULE_APPOINTMENT_TOMORROW'
    );
    expect(apptPipeline).toBeDefined();

    const actionTypes = apptPipeline.actionsExecuted.map((a: any) => a.actionType);
    expect(actionTypes).toContain('reminder');
    expect(actionTypes).toContain('push_notification');
    expect(actionTypes).toContain('checklist');

    const checklistAction = apptPipeline.actionsExecuted.find((a: any) => a.actionType === 'checklist');
    expect(checklistAction.checklist.length).toBeGreaterThan(0);
    expect(checklistAction.checklist[0]).toContain('photo ID');
  });

  it('5. Workflow Builder API allows creating, retrieving, updating, and deleting custom rules', async () => {
    // 1. Create custom rule
    const newRule = await workflowEngine.createRule(patientUserId, {
      name: 'Custom High Blood Sugar Alert',
      description: 'Alerts physician if postprandial glucose exceeds 250 mg/dL',
      trigger: 'vital_breach',
      conditions: [{ field: 'glucose', operator: 'gt', value: 250 }],
      actions: [
        {
          actionType: 'doctor_notification',
          payload: { title: 'Hyperglycemia Alert', message: 'Blood glucose spike > 250 mg/dL' },
        },
      ],
      priority: 7,
    });

    expect(newRule.name).toBe('Custom High Blood Sugar Alert');
    expect(newRule.ruleId).toBeDefined();

    // 2. Get rules
    const allRules = await workflowEngine.getRules(patientUserId);
    expect(allRules.length).toBeGreaterThanOrEqual(4);

    // 3. Update rule
    const updated = await workflowEngine.updateRule(patientUserId, newRule.ruleId, {
      description: 'Updated clinical guidance for high glucose',
    });
    expect(updated.description).toBe('Updated clinical guidance for high glucose');

    // 4. Delete rule
    const deleteRes = await workflowEngine.deleteRule(patientUserId, newRule.ruleId);
    expect(deleteRes.success).toBe(true);
  });

  it('6. Controller endpoints execute workflow operations correctly', async () => {
    let resData: any = null;
    let resStatus = 0;
    const resMock = {
      status: (code: number) => {
        resStatus = code;
        return {
          json: (data: any) => {
            resData = data;
          },
        };
      },
    };

    // 1. GET /api/workflows/rules
    await workflowController.getRules({ user: { _id: patientUserId } } as any, resMock as any, () => {});
    expect(resStatus).toBe(200);
    expect(resData.success).toBe(true);
    expect(resData.count).toBeGreaterThanOrEqual(4);

    // 2. POST /api/workflows/rules
    await workflowController.createRule(
      {
        user: { _id: patientUserId },
        body: {
          name: 'Patient Inactivity Alert',
          trigger: 'custom',
          conditions: [{ field: 'steps', operator: 'lt', value: 500 }],
          actions: [{ actionType: 'push_notification', payload: { title: 'Movement Reminder' } }],
        },
      } as any,
      resMock as any,
      () => {}
    );
    expect(resStatus).toBe(201);
    expect(resData.success).toBe(true);

    // 3. POST /api/workflows/evaluate
    await workflowController.evaluateWorkflow(
      {
        user: { _id: patientUserId },
        body: {
          trigger: 'vital_breach',
          data: { systolic: 190 },
        },
      } as any,
      resMock as any,
      () => {}
    );
    expect(resStatus).toBe(200);
    expect(resData.data.success).toBe(true);
    expect(resData.data.matchedCount).toBeGreaterThanOrEqual(1);
  });
});
