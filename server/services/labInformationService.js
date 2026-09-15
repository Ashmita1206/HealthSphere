const LabOrder = require('../models/LabSample');

const seedLabOrders = [
  {
    testOrderId: 'LAB-ORD-101',
    specimenId: 'SMP-8801',
    patientId: 'PT-301',
    patientName: 'Arthur Dent',
    testCode: 'CBC',
    testName: 'Complete Blood Count with Differential',
    panelCategory: 'Hematology',
    orderedByDoctor: 'Dr. Sarah Connor',
    priority: 'stat_urgent',
    status: 'in_progress',
    results: [],
    aiSummary: null,
    criticalValueAlert: false,
    technicianNotes: 'Specimen slightly hemolyzed, processed with caution',
    pathologistSignOff: { doctorName: null, signedAt: null }
  },
  {
    testOrderId: 'LAB-ORD-102',
    specimenId: 'SMP-8802',
    patientId: 'PT-302',
    patientName: 'Maya Lin',
    testCode: 'CMP',
    testName: 'Comprehensive Metabolic Panel',
    panelCategory: 'Biochemistry',
    orderedByDoctor: 'Dr. Julian Ross',
    priority: 'routine',
    status: 'approved',
    results: [
      { parameterName: 'Serum Creatinine', observedValue: 1.1, unit: 'mg/dL', referenceRangeLow: 0.6, referenceRangeHigh: 1.2, abnormalityFlag: 'normal', aiInsight: 'Normal renal clearance' },
      { parameterName: 'Blood Urea Nitrogen (BUN)', observedValue: 14, unit: 'mg/dL', referenceRangeLow: 7, referenceRangeHigh: 20, abnormalityFlag: 'normal', aiInsight: 'Normal nitrogen balance' },
      { parameterName: 'Fasting Plasma Glucose', observedValue: 145, unit: 'mg/dL', referenceRangeLow: 70, referenceRangeHigh: 99, abnormalityFlag: 'high', aiInsight: 'Hyperglycemia noted, correlate with HbA1c' }
    ],
    aiSummary: 'Isolated hyperglycemia with preserved glomerular and hepatic function.',
    criticalValueAlert: false,
    technicianNotes: 'Automated Roche Cobas 6000 run',
    pathologistSignOff: { doctorName: 'Dr. Gregory House', signedAt: new Date(Date.now() - 3600000 * 4) }
  },
  {
    testOrderId: 'LAB-ORD-103',
    specimenId: 'SMP-8803',
    patientId: 'PT-303',
    patientName: 'Viktor Krum',
    testCode: 'TROPONIN',
    testName: 'High Sensitivity Troponin I',
    panelCategory: 'Biochemistry',
    orderedByDoctor: 'Dr. Lisa Cuddy',
    priority: 'critical',
    status: 'in_progress',
    results: [],
    aiSummary: null,
    criticalValueAlert: false,
    technicianNotes: 'Emergency chest pain evaluation',
    pathologistSignOff: { doctorName: null, signedAt: null }
  }
];

const seedSpecimens = [
  {
    specimenId: 'SMP-8801',
    barcode: 'BC-8801-WB',
    patientId: 'PT-301',
    patientName: 'Arthur Dent',
    sampleType: 'Whole Blood (EDTA Purple Top)',
    collectedAt: new Date(Date.now() - 3600000 * 2),
    status: 'received_in_lab',
    storageLocation: 'Rack-H1-Ambient'
  },
  {
    specimenId: 'SMP-8802',
    barcode: 'BC-8802-SER',
    patientId: 'PT-302',
    patientName: 'Maya Lin',
    sampleType: 'Serum (SST Gold Top)',
    collectedAt: new Date(Date.now() - 3600000 * 6),
    status: 'archived',
    storageLocation: 'ColdStore-Tray-4'
  },
  {
    specimenId: 'SMP-8803',
    barcode: 'BC-8803-HEP',
    patientId: 'PT-303',
    patientName: 'Viktor Krum',
    sampleType: 'Plasma (Lithium Heparin Green Top)',
    collectedAt: new Date(Date.now() - 1800000),
    status: 'processing',
    storageLocation: 'Centrifuge-Bay-2'
  }
];

let activeLabOrders = JSON.parse(JSON.stringify(seedLabOrders));
let activeSpecimens = JSON.parse(JSON.stringify(seedSpecimens));

class LabInformationService {
  /**
   * Laboratory Operational Dashboard
   */
  async getDashboard() {
    const totalOrders = activeLabOrders.length;
    const pendingOrders = activeLabOrders.filter(o => o.status === 'in_progress' || o.status === 'ordered').length;
    const criticalAlerts = activeLabOrders.filter(o => o.criticalValueAlert || o.priority === 'critical').length;
    const verifiedOrders = activeLabOrders.filter(o => o.status === 'approved' || o.status === 'verified').length;

    return {
      timestamp: new Date().toISOString(),
      metrics: {
        totalOrdersToday: totalOrders,
        pendingProcessingCount: pendingOrders,
        verifiedAndSignedCount: verifiedOrders,
        activeCriticalAlerts: criticalAlerts,
        averageTurnaroundMinutes: 38.5,
        analyzerOnlineStatus: {
          'Roche Cobas 6000 (Biochem)': 'Operational (99.8%)',
          'Sysmex XN-1000 (Hematology)': 'Operational (100%)',
          'Bio-Rad D-10 (HbA1c)': 'Operational (98.5%)'
        }
      },
      specimenOverview: {
        totalActiveSpecimens: activeSpecimens.length,
        inProcessing: activeSpecimens.filter(s => s.status === 'processing').length,
        receivedPendingRun: activeSpecimens.filter(s => s.status === 'received_in_lab').length
      }
    };
  }

  /**
   * Specimen Tracking & Chain of Custody
   */
  async getSpecimens(query = {}) {
    let specimens = [...activeSpecimens];
    if (query.specimenId) {
      specimens = specimens.filter(s => s.specimenId.toLowerCase().includes(query.specimenId.toLowerCase()));
    }
    if (query.status) {
      specimens = specimens.filter(s => s.status.toLowerCase() === query.status.toLowerCase());
    }
    return specimens;
  }

  async registerSpecimen(data) {
    const specimen = {
      specimenId: data.specimenId || `SMP-${Math.floor(8000 + Math.random() * 1999)}`,
      barcode: data.barcode || `BC-${Date.now()}`,
      patientId: data.patientId || 'PT-UNKNOWN',
      patientName: data.patientName || 'Unknown Patient',
      sampleType: data.sampleType || 'Whole Blood',
      collectedAt: new Date(),
      status: 'received_in_lab',
      storageLocation: data.storageLocation || 'Reception-Bay-1'
    };
    activeSpecimens.push(specimen);
    return specimen;
  }

  /**
   * Technician Queue (Prioritized by STAT / Critical)
   */
  async getTechnicianQueue(query = {}) {
    let queue = activeLabOrders.filter(o => o.status !== 'approved');

    if (query.panelCategory) {
      queue = queue.filter(o => o.panelCategory.toLowerCase() === query.panelCategory.toLowerCase());
    }

    const priorityWeight = { 'critical': 3, 'stat_urgent': 2, 'routine': 1 };
    queue.sort((a, b) => (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1));

    return queue;
  }

  /**
   * Submit Analyzer Results & Run AI Abnormality Detection
   */
  async submitTestResults(testOrderId, results) {
    const order = activeLabOrders.find(o => o.testOrderId === testOrderId);
    if (!order) {
      throw new Error(`Lab test order ${testOrderId} not found`);
    }

    // Process parameters with automated reference checks
    let hasCritical = false;
    const evaluatedResults = results.map(param => {
      let flag = 'normal';
      let insight = 'Within biological reference interval';

      const low = Number(param.referenceRangeLow);
      const high = Number(param.referenceRangeHigh);
      const val = Number(param.observedValue);

      if (val < low) {
        if (val < low * 0.7) {
          flag = 'critical_low';
          hasCritical = true;
          insight = `Critical low level detected (${val} ${param.unit})`;
        } else {
          flag = 'low';
          insight = `Sub-optimal low level (${val} ${param.unit})`;
        }
      } else if (val > high) {
        if (val > high * 1.4) {
          flag = 'critical_high';
          hasCritical = true;
          insight = `Critical elevation exceeding biological safety threshold (${val} ${param.unit})`;
        } else {
          flag = 'high';
          insight = `Mild-to-moderate elevation (${val} ${param.unit})`;
        }
      }

      return {
        parameterName: param.parameterName,
        observedValue: val,
        unit: param.unit,
        referenceRangeLow: low,
        referenceRangeHigh: high,
        abnormalityFlag: flag,
        aiInsight: insight
      };
    });

    order.results = evaluatedResults;
    order.status = 'preliminary_ready';
    order.criticalValueAlert = hasCritical;

    // AI Multi-analyte synthesis
    const abnormalParams = evaluatedResults.filter(r => r.abnormalityFlag !== 'normal');
    if (abnormalParams.length > 0) {
      order.aiSummary = `AI Interpretation: Detected ${abnormalParams.length} atypical analyte(s). ` +
        abnormalParams.map(a => `${a.parameterName} flagged ${a.abnormalityFlag}`).join('; ') +
        (hasCritical ? ' — STAT Doctor Notification Initiated.' : '');
    } else {
      order.aiSummary = 'AI Interpretation: All evaluated biochemical and hematological indices fall within standard normative parameters.';
    }

    return order;
  }

  /**
   * Pathologist Result Sign-off and Verification
   */
  async verifyResults(testOrderId, { doctorName, technicianNotes }) {
    const order = activeLabOrders.find(o => o.testOrderId === testOrderId);
    if (!order) throw new Error(`Lab test order ${testOrderId} not found`);

    order.status = 'approved';
    order.pathologistSignOff = {
      doctorName: doctorName || 'Dr. Gregory House, MD',
      signedAt: new Date()
    };
    if (technicianNotes) {
      order.technicianNotes = technicianNotes;
    }

    return {
      success: true,
      message: `Test order ${testOrderId} verified and authorized by ${order.pathologistSignOff.doctorName}`,
      order
    };
  }

  /**
   * AI Abnormality Detection Engine (Standalone Analyzer Support)
   */
  async detectAbnormalities(parameters) {
    if (!parameters || !Array.isArray(parameters)) {
      throw new Error('Expected array of lab test parameters');
    }

    const detections = [];
    let detectedSyndrome = null;

    const hb = parameters.find(p => p.name.toLowerCase().includes('hemoglobin'));
    const mcv = parameters.find(p => p.name.toLowerCase().includes('mcv'));
    const ferritin = parameters.find(p => p.name.toLowerCase().includes('ferritin'));

    if (hb && hb.value < 11.5 && mcv && mcv.value < 80) {
      detectedSyndrome = 'Microcytic Hypochromic Pattern (Suspicion of Iron Deficiency Anemia vs Thalassemia Trait)';
      detections.push({
        syndrome: detectedSyndrome,
        confidence: 0.94,
        suggestedFollowUp: 'Serum Iron Profile (Ferritin, TIBC, Transferrin Saturation)'
      });
    }

    const trop = parameters.find(p => p.name.toLowerCase().includes('troponin'));
    if (trop && trop.value > 0.04) {
      detections.push({
        syndrome: 'Acute Myocardial Necrosis Marker Elevation (Non-ST / ST Elevation Myocardial Infarction Alert)',
        confidence: 0.98,
        suggestedFollowUp: 'Immediate 12-lead ECG, cardiology consult, heparin/antiplatelet protocol'
      });
    }

    return {
      analyzedParametersCount: parameters.length,
      evaluatedAt: new Date().toISOString(),
      detectionsCount: detections.length,
      detections
    };
  }
}

module.exports = new LabInformationService();
