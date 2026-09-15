const seedRules = [
  {
    ruleId: 'RULE-AUT-01',
    name: 'Critical Cardiac Biomarker STAT Escalation',
    triggerEvent: 'LAB_CRITICAL_VALUE',
    conditionExpression: "analyte == 'Troponin I' && value > 0.04",
    actions: [
      { actionType: 'DISPATCH_STAT_ALERT', targetRecipient: 'On-Duty Cardiology Fellow', payloadTemplate: 'Critical Troponin elevation: Immediate 12-lead ECG required' },
      { actionType: 'ASSIGN_SPECIALIST_TEAM', targetRecipient: 'Cardiac Care Unit (CCU)', payloadTemplate: 'Auto-reserve monitored bed in CCU' }
    ],
    status: 'active',
    executionCount: 142,
    lastExecutedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    ruleId: 'RULE-AUT-02',
    name: 'Autonomous 24H Appointment SMS & App Reminder',
    triggerEvent: 'APPOINTMENT_UPCOMING_24H',
    conditionExpression: 'confirmed == true',
    actions: [
      { actionType: 'SEND_PATIENT_REMINDER', targetRecipient: 'Patient Mobile App / SMS', payloadTemplate: 'Reminder: Your consultation with Dr. {doctor} is scheduled for tomorrow at {time}' }
    ],
    status: 'active',
    executionCount: 1840,
    lastExecutedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    ruleId: 'RULE-AUT-03',
    name: 'Telemetry Early Warning Score (NEWS2) Triage Escalation',
    triggerEvent: 'VITALS_DETERIORATION',
    conditionExpression: 'news2Score >= 7',
    actions: [
      { actionType: 'SMART_ROUTE_TRIAGE', targetRecipient: 'Rapid Response Medical Emergency Team', payloadTemplate: 'High NEWS2 score alert: Immediate bedside evaluation indicated' },
      { actionType: 'DISPATCH_STAT_ALERT', targetRecipient: 'Attending Physician', payloadTemplate: 'Patient vitals unstable' }
    ],
    status: 'active',
    executionCount: 89,
    lastExecutedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    ruleId: 'RULE-AUT-04',
    name: 'Chronic Disease Refill Auto-Trigger',
    triggerEvent: 'MEDICATION_REFILL_DUE',
    conditionExpression: 'daysRemaining <= 3',
    actions: [
      { actionType: 'AUTO_REFILL_MEDICATION', targetRecipient: 'Central Outpatient Pharmacy', payloadTemplate: 'Autonomous 30-day maintenance refill processed' }
    ],
    status: 'active',
    executionCount: 512,
    lastExecutedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

let activeRules = JSON.parse(JSON.stringify(seedRules));
let executedJobs = [];

class HealthcareAutomationService {
  /**
   * Autonomous Automation Dashboard
   */
  async getDashboard() {
    const totalExecutions = activeRules.reduce((acc, r) => acc + r.executionCount, 0);

    return {
      timestamp: new Date().toISOString(),
      overview: {
        activeAutonomousRules: activeRules.filter(r => r.status === 'active').length,
        totalAutonomousExecutions: totalExecutions,
        estimatedClinicalHoursSaved: Number((totalExecutions * 0.25).toFixed(1)),
        automatedWorkflowSuccessRatePct: 99.4,
        activeOrchestrationJobs: executedJobs.filter(j => j.overallStatus === 'in_progress').length
      },
      rulesSummary: activeRules.map(r => ({
        ruleId: r.ruleId,
        name: r.name,
        triggerEvent: r.triggerEvent,
        executionCount: r.executionCount,
        status: r.status
      })),
      recentOrchestrations: executedJobs.slice(-5)
    };
  }

  /**
   * List Rules
   */
  async getRules(query = {}) {
    let rules = [...activeRules];
    if (query.status) {
      rules = rules.filter(r => r.status.toLowerCase() === query.status.toLowerCase());
    }
    if (query.triggerEvent) {
      rules = rules.filter(r => r.triggerEvent === query.triggerEvent);
    }
    return rules;
  }

  /**
   * Create New Rule
   */
  async createRule(ruleData) {
    const { name, triggerEvent, conditionExpression, actions } = ruleData;
    if (!name || !triggerEvent || !actions || actions.length === 0) {
      throw new Error('Automation rule requires name, triggerEvent, and at least one action');
    }

    const newRule = {
      ruleId: `RULE-AUT-${String(activeRules.length + 1).padStart(2, '0')}`,
      name,
      triggerEvent,
      conditionExpression: conditionExpression || 'true',
      actions,
      status: 'active',
      executionCount: 0,
      lastExecutedAt: null
    };

    activeRules.push(newRule);
    return newRule;
  }

  /**
   * Event-Driven Automation Dispatcher
   */
  async dispatchEvent({ eventType, sourceModule, payload }) {
    if (!eventType) throw new Error('eventType is required for event dispatching');

    const matchingRules = activeRules.filter(r => r.status === 'active' && r.triggerEvent === eventType);

    const executedActions = [];

    for (const rule of matchingRules) {
      rule.executionCount += 1;
      rule.lastExecutedAt = new Date().toISOString();

      for (const action of rule.actions) {
        executedActions.push({
          ruleId: rule.ruleId,
          ruleName: rule.name,
          actionType: action.actionType,
          targetRecipient: action.targetRecipient,
          payload: {
            ...payload,
            templateOutput: action.payloadTemplate
          },
          status: 'dispatched',
          dispatchedAt: new Date().toISOString()
        });
      }
    }

    return {
      success: true,
      eventType,
      sourceModule: sourceModule || 'Autonomous Gateway',
      matchedRulesCount: matchingRules.length,
      actionsExecutedCount: executedActions.length,
      executedActions
    };
  }

  /**
   * Smart AI Autonomous Appointment Scheduling & Smart Routing
   */
  async autonomousSchedule({ patientId, patientName, specialty, urgency, preferredDays }) {
    if (!patientId || !specialty) {
      throw new Error('Autonomous scheduling requires patientId and specialty');
    }

    const availableSpecialists = {
      'Cardiology': [{ doctorId: 'DOC-101', name: 'Dr. Sarah Connor', nextSlot: 'Tomorrow 10:30 AM', room: 'Suite-4B' }],
      'Neurology': [{ doctorId: 'DOC-102', name: 'Dr. Julian Ross', nextSlot: 'Thursday 02:00 PM', room: 'Suite-2A' }],
      'General Medicine': [{ doctorId: 'DOC-103', name: 'Dr. Arthur Harris', nextSlot: 'Today 04:15 PM', room: 'Clinic-101' }]
    };

    const specialists = availableSpecialists[specialty] || availableSpecialists['General Medicine'];
    const chosen = specialists[0];

    const appointment = {
      appointmentId: `APT-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId,
      patientName: patientName || 'Designated Patient',
      specialty,
      assignedDoctor: chosen.name,
      doctorId: chosen.doctorId,
      consultationRoom: chosen.room,
      scheduledTime: chosen.nextSlot,
      triageUrgency: urgency || 'routine',
      routingReason: `AI Smart Routing: Matched based on ${specialty} availability and ${urgency || 'routine'} priority queue`,
      autoRemindersArmed: true,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    return appointment;
  }

  /**
   * Multi-Step Clinical Task Orchestration
   */
  async orchestrateWorkflow(workflowType, context = {}) {
    const validWorkflows = ['RAPID_SEPSIS_RESPONSE', 'STROKE_CODE_HYPERACUTE', 'AUTONOMOUS_POST_OP_DISCHARGE'];
    const selectedWorkflow = validWorkflows.includes(workflowType) ? workflowType : 'RAPID_SEPSIS_RESPONSE';

    const jobId = `JOB-${Date.now()}`;
    const steps = [];

    if (selectedWorkflow === 'RAPID_SEPSIS_RESPONSE') {
      steps.push(
        { stepId: 'STP-1', stepName: 'Stat Blood Cultures & Serum Lactate Ordered', status: 'completed', outputMessage: 'Automated order dispatched to Laboratory Information System', completedAt: new Date() },
        { stepId: 'STP-2', stepName: 'Broad-Spectrum IV Antimicrobial Auto-Approval', status: 'completed', outputMessage: 'Smart Pharmacy verified Piperacillin/Tazobactam regimen', completedAt: new Date() },
        { stepId: 'STP-3', stepName: 'ICU / HDU High-Acuity Bed Hold', status: 'completed', outputMessage: 'Hospital Resource Management allocated Bed-ICU-03', completedAt: new Date() },
        { stepId: 'STP-4', stepName: 'Rapid Response Team Bedside Page', status: 'completed', outputMessage: 'Pager notification broadcasted to Medical Emergency Team', completedAt: new Date() }
      );
    } else if (selectedWorkflow === 'STROKE_CODE_HYPERACUTE') {
      steps.push(
        { stepId: 'STP-1', stepName: 'Non-Contrast Brain CT Protocol Activated', status: 'completed', outputMessage: 'Radiology suite CT-1 cleared for immediate emergency acquisition', completedAt: new Date() },
        { stepId: 'STP-2', stepName: 'Stroke Neurologist Video Tele-Consult Established', status: 'completed', outputMessage: 'Automated tele-stroke video channel opened', completedAt: new Date() },
        { stepId: 'STP-3', stepName: 'IV Thrombolysis (tPA / Tenecteplase) Pre-Calculated', status: 'completed', outputMessage: 'Dosage calculated based on verified patient weight', completedAt: new Date() }
      );
    } else {
      steps.push(
        { stepId: 'STP-1', stepName: 'Discharge Summary Auto-Compiled', status: 'completed', outputMessage: 'Synthesized clinical notes, medications, and follow-up plan', completedAt: new Date() },
        { stepId: 'STP-2', stepName: 'Discharge Medications Dispensed', status: 'completed', outputMessage: 'Smart Pharmacy dispatched discharge medication pack', completedAt: new Date() },
        { stepId: 'STP-3', stepName: 'Bed Released to Environmental Services', status: 'completed', outputMessage: 'Bed marked for sanitization in Resource Manager', completedAt: new Date() }
      );
    }

    const job = {
      jobId,
      workflowName: selectedWorkflow,
      patientId: context.patientId || 'PT-301',
      priority: selectedWorkflow.includes('SEPSIS') || selectedWorkflow.includes('STROKE') ? 'critical' : 'high',
      steps,
      overallStatus: 'completed',
      initiatedBy: 'Autonomous AI Healthcare Orchestrator',
      completedAt: new Date().toISOString()
    };

    executedJobs.push(job);
    return job;
  }

  /**
   * Workflow & Automation Telemetry Analytics
   */
  async getWorkflowAnalytics() {
    return {
      throughputMetrics: {
        dailyAutomatedEventsProcessed: 4210,
        averageEventProcessingLatencyMs: 48,
        autonomousResolutionRatePct: 94.8,
        humanInterventionEscalationRatePct: 5.2
      },
      eventDistribution: [
        { event: 'APPOINTMENT_UPCOMING_24H', count: 1840, percentage: 43.7 },
        { event: 'MEDICATION_REFILL_DUE', count: 512, percentage: 12.2 },
        { event: 'LAB_CRITICAL_VALUE', count: 142, percentage: 3.4 },
        { event: 'VITALS_DETERIORATION', count: 89, percentage: 2.1 },
        { event: 'OTHER_CLINICAL_WORKFLOWS', count: 1627, percentage: 38.6 }
      ],
      clinicalImpact: {
        averageMinutesSavedPerCriticalAlert: 14.5,
        avoidableAdverseEventsPreventedMonth: 38,
        satisfactionScore: 4.8
      }
    };
  }
}

module.exports = new HealthcareAutomationService();
