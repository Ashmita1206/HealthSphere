/**
 * Standard Clinical Automation Rules & Rule Presets
 * MASTER F22 — Healthcare Workflow Automation
 */

const DEFAULT_AUTOMATION_RULES = [
  {
    ruleId: 'RULE_HYPERTENSIVE_CRISIS',
    name: 'Hypertensive Crisis Intervention Protocol',
    description: 'Triggers multi-tiered critical escalation when systolic BP exceeds 180 mmHg.',
    trigger: 'vital_breach',
    priority: 10,
    enabled: true,
    conditions: [
      {
        field: 'systolic',
        operator: 'gt',
        value: 180,
      },
    ],
    actions: [
      {
        actionType: 'emergency_alert',
        payload: {
          title: 'Emergency Hypertensive Alert',
          severity: 'critical',
          message: 'Systolic blood pressure exceeded 180 mmHg. Initiating emergency clinical response.',
          route: '/emergency',
        },
      },
      {
        actionType: 'doctor_notification',
        payload: {
          title: 'Physician Priority Notification: Hypertensive Crisis',
          message: 'Patient biometric stream logged acute blood pressure surge above 180 mmHg.',
          channel: 'urgent_inbox',
        },
      },
      {
        actionType: 'timeline_event',
        payload: {
          eventType: 'emergency',
          category: 'emergency',
          title: 'Hypertensive Crisis Telemetry Breach',
          description: 'Systolic blood pressure measured above 180 mmHg, initiating emergency escalation.',
        },
      },
      {
        actionType: 'push_notification',
        payload: {
          title: 'Urgent: Seek Medical Assistance Immediately',
          body: 'Your blood pressure is dangerously high. Sit down, remain calm, and contact emergency services or your physician now.',
        },
      },
    ],
  },
  {
    ruleId: 'RULE_MISSED_MEDICATION',
    name: 'Medication Adherence Care Cascade',
    description: 'Automates patient reminder, family notification, and doctor alert upon missed medication.',
    trigger: 'medication_missed',
    priority: 8,
    enabled: true,
    conditions: [
      {
        field: 'missedDoses',
        operator: 'gte',
        value: 1,
      },
    ],
    actions: [
      {
        actionType: 'reminder',
        payload: {
          title: 'Medication Dose Missed',
          message: 'You missed your scheduled dose. Please take it if within the safe therapeutic window or log reason.',
        },
      },
      {
        actionType: 'family_notification',
        payload: {
          title: 'Family Caregiver Alert: Medication Missed',
          message: 'HealthSphere noted that your loved one has missed their scheduled medication.',
        },
      },
      {
        actionType: 'doctor_notification',
        payload: {
          title: 'Adherence Notice: Medication Skipped',
          message: 'Patient missed scheduled prescription dose. Updated in patient chart.',
        },
      },
    ],
  },
  {
    ruleId: 'RULE_APPOINTMENT_TOMORROW',
    name: 'Pre-Consultation Clinical Checklist & Navigation',
    description: 'Sends reminders, directions, and prep checklists 24 hours prior to scheduled appointment.',
    trigger: 'appointment_upcoming',
    priority: 5,
    enabled: true,
    conditions: [
      {
        field: 'hoursUntil',
        operator: 'lte',
        value: 24,
      },
    ],
    actions: [
      {
        actionType: 'reminder',
        payload: {
          title: 'Appointment Tomorrow',
          message: 'Your upcoming doctor consultation is scheduled within the next 24 hours.',
        },
      },
      {
        actionType: 'push_notification',
        payload: {
          title: 'Clinic Navigation & Directions',
          body: 'View clinic address, transit options, and parking information for your visit.',
          route: '/appointments',
        },
      },
      {
        actionType: 'checklist',
        payload: {
          title: 'Pre-Visit Consultation Checklist',
          checklistItems: [
            'Bring valid government photo ID and insurance card',
            'Have your past diagnostic reports and lab results ready',
            'Prepare a list of active medications and daily supplements',
            'Fast for 8 hours if blood work or lipid panel is scheduled',
            'Arrive 15 minutes before your scheduled appointment slot',
          ],
        },
      },
    ],
  },
  {
    ruleId: 'RULE_CRITICAL_HYPOXEMIA',
    name: 'Hypoxemia Safety Alert',
    description: 'Triggers immediate alerts if blood oxygen level falls below 90%.',
    trigger: 'vital_breach',
    priority: 9,
    enabled: true,
    conditions: [
      {
        field: 'spo2',
        operator: 'lt',
        value: 90,
      },
    ],
    actions: [
      {
        actionType: 'emergency_alert',
        payload: {
          title: 'Critical Hypoxemia Alert (SpO2 < 90%)',
          severity: 'critical',
          message: 'Blood oxygen level dropped below 90%. Immediate oxygenation or medical triage required.',
        },
      },
      {
        actionType: 'doctor_notification',
        payload: {
          title: 'Urgent Telemetry: Patient Hypoxemic',
          message: 'Wearable sensor detected SpO2 under 90%.',
        },
      },
      {
        actionType: 'timeline_event',
        payload: {
          eventType: 'emergency',
          category: 'emergency',
          title: 'Critical Hypoxemia Episode Logged',
          description: 'Blood oxygen saturation recorded under 90%. Emergency protocol triggered.',
        },
      },
      {
        actionType: 'push_notification',
        payload: {
          title: 'Critical Oxygen Level Detected',
          body: 'Your SpO2 is dangerously low. Please sit upright, practice deep breathing, and call emergency services if symptoms persist.',
        },
      },
    ],
  },
];

/**
 * Evaluate single condition against context data
 */
function evaluateCondition(data, condition) {
  if (!data || !condition || !condition.field) return false;

  const actualValue = data[condition.field];
  if (actualValue === undefined || actualValue === null) return false;

  const targetValue = condition.value;
  const numActual = typeof actualValue === 'number' ? actualValue : Number(actualValue);
  const numTarget = typeof targetValue === 'number' ? targetValue : Number(targetValue);
  const isNumericComparison = !isNaN(numActual) && !isNaN(numTarget);

  switch (condition.operator) {
    case 'gt':
      return isNumericComparison ? numActual > numTarget : actualValue > targetValue;
    case 'gte':
      return isNumericComparison ? numActual >= numTarget : actualValue >= targetValue;
    case 'lt':
      return isNumericComparison ? numActual < numTarget : actualValue < targetValue;
    case 'lte':
      return isNumericComparison ? numActual <= numTarget : actualValue <= targetValue;
    case 'eq':
      return isNumericComparison ? numActual === numTarget : String(actualValue) === String(targetValue);
    case 'ne':
      return isNumericComparison ? numActual !== numTarget : String(actualValue) !== String(targetValue);
    case 'contains':
      return String(actualValue).toLowerCase().includes(String(targetValue).toLowerCase());
    case 'in':
      if (Array.isArray(targetValue)) {
        return targetValue.includes(actualValue);
      }
      return false;
    default:
      return false;
  }
}

/**
 * Check if all conditions for a rule match
 */
function matchesAllConditions(data, conditions = []) {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((cond) => evaluateCondition(data, cond));
}

module.exports = {
  DEFAULT_AUTOMATION_RULES,
  evaluateCondition,
  matchesAllConditions,
};
