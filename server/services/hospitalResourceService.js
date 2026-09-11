const HospitalResourceSnapshot = require('../models/HospitalResource');

// In-memory master seed state if DB is uninitialized or in tests
const defaultResourceData = {
  facilityId: 'HEALTHSPHERE-CENTRAL',
  beds: [
    { bedId: 'BED-ICU-01', department: 'Critical Care', ward: 'ICU-North', roomNumber: 'ICU-1', bedNumber: 'B1', acuityLevel: 'ICU', status: 'occupied', patientId: 'P-901', patientName: 'Robert Vance', admissionTime: new Date(Date.now() - 3600000 * 18) },
    { bedId: 'BED-ICU-02', department: 'Critical Care', ward: 'ICU-North', roomNumber: 'ICU-1', bedNumber: 'B2', acuityLevel: 'ICU', status: 'occupied', patientId: 'P-902', patientName: 'Elena Rostova', admissionTime: new Date(Date.now() - 3600000 * 48) },
    { bedId: 'BED-ICU-03', department: 'Critical Care', ward: 'ICU-North', roomNumber: 'ICU-2', bedNumber: 'B3', acuityLevel: 'ICU', status: 'available', patientId: null, patientName: null, admissionTime: null },
    { bedId: 'BED-ICU-04', department: 'Critical Care', ward: 'ICU-North', roomNumber: 'ICU-2', bedNumber: 'B4', acuityLevel: 'ICU', status: 'available', patientId: null, patientName: null, admissionTime: null },
    { bedId: 'BED-HDU-01', department: 'Cardiology', ward: 'HDU-East', roomNumber: '201', bedNumber: 'B1', acuityLevel: 'HDU', status: 'occupied', patientId: 'P-905', patientName: 'Marcus Bell', admissionTime: new Date(Date.now() - 3600000 * 6) },
    { bedId: 'BED-GEN-01', department: 'General Medicine', ward: 'Ward-3', roomNumber: '301', bedNumber: 'B1', acuityLevel: 'General', status: 'available', patientId: null, patientName: null, admissionTime: null },
    { bedId: 'BED-GEN-02', department: 'General Medicine', ward: 'Ward-3', roomNumber: '301', bedNumber: 'B2', acuityLevel: 'General', status: 'occupied', patientId: 'P-908', patientName: 'Sarah Jenkins', admissionTime: new Date(Date.now() - 3600000 * 24) },
    { bedId: 'BED-GEN-03', department: 'Orthopedics', ward: 'Ward-4', roomNumber: '401', bedNumber: 'B1', acuityLevel: 'General', status: 'maintenance', patientId: null, patientName: null, admissionTime: null }
  ],
  operatingTheaters: [
    { theaterId: 'OT-1', name: 'Cardiac Suite 1', surgeryType: 'CABG Bypass', leadSurgeon: 'Dr. Sarah Connor', anesthesiologist: 'Dr. M. Patel', scheduledStart: new Date(Date.now() + 3600000), scheduledEnd: new Date(Date.now() + 3600000 * 4), status: 'scheduled', priority: 'urgent' },
    { theaterId: 'OT-2', name: 'Neuro Suite', surgeryType: 'Craniotomy Decompression', leadSurgeon: 'Dr. Julian Ross', anesthesiologist: 'Dr. L. Wei', scheduledStart: new Date(Date.now() - 1800000), scheduledEnd: new Date(Date.now() + 3600000 * 2), status: 'in_progress', priority: 'emergency' },
    { theaterId: 'OT-3', name: 'Orthopedic Theater', surgeryType: 'Total Hip Arthroplasty', leadSurgeon: 'Dr. Emily Watson', anesthesiologist: 'Dr. K. Vance', scheduledStart: new Date(Date.now() + 3600000 * 5), scheduledEnd: new Date(Date.now() + 3600000 * 7), status: 'scheduled', priority: 'elective' }
  ],
  staff: [
    { staffId: 'STF-101', name: 'Dr. Sarah Connor', role: 'Surgeon', department: 'Cardiology', shift: 'Morning', status: 'on_duty', assignedUnit: 'OT-1' },
    { staffId: 'STF-102', name: 'Dr. Julian Ross', role: 'Surgeon', department: 'Neurology', shift: 'Morning', status: 'on_duty', assignedUnit: 'OT-2' },
    { staffId: 'STF-201', name: 'Nurse Clara Oswald', role: 'Nurse', department: 'Critical Care', shift: 'Morning', status: 'on_duty', assignedUnit: 'ICU-North' },
    { staffId: 'STF-202', name: 'Nurse James Holden', role: 'Nurse', department: 'Emergency', shift: 'Morning', status: 'on_duty', assignedUnit: 'ER-Triage' },
    { staffId: 'STF-301', name: 'David Bowman', role: 'Paramedic', department: 'Emergency', shift: 'Morning', status: 'dispatched', assignedUnit: 'AMB-01' }
  ],
  ambulances: [
    { vehicleNumber: 'HS-AMB-01', type: 'Advanced Life Support', status: 'dispatched', currentCoordinates: { lat: 28.6189, lng: 77.2140 }, etaMinutes: 8, assignedParamedic: 'David Bowman', emergencyCaseId: 'EMG-702' },
    { vehicleNumber: 'HS-AMB-02', type: 'Basic Life Support', status: 'available', currentCoordinates: { lat: 28.6139, lng: 77.2090 }, etaMinutes: 0, assignedParamedic: 'Alex Mercer', emergencyCaseId: null },
    { vehicleNumber: 'HS-AMB-03', type: 'Neonatal', status: 'available', currentCoordinates: { lat: 28.6139, lng: 77.2090 }, etaMinutes: 0, assignedParamedic: 'Tanya Adams', emergencyCaseId: null }
  ],
  equipment: [
    { equipmentId: 'EQ-VENT-01', name: 'Hamilton-C6 High-End Ventilator', category: 'Ventilator', location: 'ICU-North Bed 1', operationalStatus: 'in_use', lastMaintenance: new Date(Date.now() - 3600000 * 24 * 10), telemetryMetrics: { batteryPercentage: 98, temperatureCelsius: 22.4, utilizationHours: 412 } },
    { equipmentId: 'EQ-VENT-02', name: 'Hamilton-C6 High-End Ventilator', category: 'Ventilator', location: 'ICU-North Bed 2', operationalStatus: 'in_use', lastMaintenance: new Date(Date.now() - 3600000 * 24 * 15), telemetryMetrics: { batteryPercentage: 95, temperatureCelsius: 23.1, utilizationHours: 580 } },
    { equipmentId: 'EQ-VENT-03', name: 'Puritan Bennett 980', category: 'Ventilator', location: 'ICU Storage Bay', operationalStatus: 'operational', lastMaintenance: new Date(Date.now() - 3600000 * 24 * 5), telemetryMetrics: { batteryPercentage: 100, temperatureCelsius: 21.0, utilizationHours: 120 } },
    { equipmentId: 'EQ-DIAL-01', name: 'Fresenius 5008S Dialysis', category: 'Dialysis', location: 'Nephrology Ward', operationalStatus: 'operational', lastMaintenance: new Date(Date.now() - 3600000 * 24 * 8), telemetryMetrics: { batteryPercentage: 100, temperatureCelsius: 23.8, utilizationHours: 320 } },
    { equipmentId: 'EQ-DEFIB-01', name: 'Zoll R Series Plus Defibrillator', category: 'Defibrillator', location: 'Emergency Room', operationalStatus: 'operational', lastMaintenance: new Date(Date.now() - 3600000 * 24 * 2), telemetryMetrics: { batteryPercentage: 100, temperatureCelsius: 21.5, utilizationHours: 45 } }
  ]
};

// In-memory clone to support runtime modifications in test or live modes
let activeResources = JSON.parse(JSON.stringify(defaultResourceData));

class HospitalResourceService {
  /**
   * Comprehensive Hospital Overview
   */
  async getOverview() {
    const totalBeds = activeResources.beds.length;
    const occupiedBeds = activeResources.beds.filter(b => b.status === 'occupied').length;
    const availableBeds = activeResources.beds.filter(b => b.status === 'available').length;
    const maintenanceBeds = activeResources.beds.filter(b => b.status === 'maintenance').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const icuBeds = activeResources.beds.filter(b => b.acuityLevel === 'ICU');
    const icuOccupied = icuBeds.filter(b => b.status === 'occupied').length;
    const icuOccupancyRate = icuBeds.length > 0 ? Math.round((icuOccupied / icuBeds.length) * 100) : 0;

    const totalVentilators = activeResources.equipment.filter(e => e.category === 'Ventilator').length;
    const activeVentilators = activeResources.equipment.filter(e => e.category === 'Ventilator' && e.operationalStatus === 'in_use').length;

    const activeOTs = activeResources.operatingTheaters.filter(ot => ot.status === 'in_progress').length;
    const scheduledOTs = activeResources.operatingTheaters.filter(ot => ot.status === 'scheduled').length;

    const dispatchedAmbulances = activeResources.ambulances.filter(a => a.status === 'dispatched' || a.status === 'en_route_hospital').length;
    const availableAmbulances = activeResources.ambulances.filter(a => a.status === 'available').length;

    const staffOnDuty = activeResources.staff.filter(s => s.status === 'on_duty').length;

    return {
      facilityId: activeResources.facilityId,
      timestamp: new Date().toISOString(),
      beds: {
        total: totalBeds,
        occupied: occupiedBeds,
        available: availableBeds,
        maintenance: maintenanceBeds,
        occupancyRatePercentage: occupancyRate
      },
      icu: {
        totalBeds: icuBeds.length,
        occupiedBeds: icuOccupied,
        availableBeds: icuBeds.length - icuOccupied,
        occupancyRatePercentage: icuOccupancyRate,
        ventilatorsTotal: totalVentilators,
        ventilatorsInUse: activeVentilators,
        ventilatorsAvailable: totalVentilators - activeVentilators
      },
      operatingTheaters: {
        totalTheaters: activeResources.operatingTheaters.length,
        inProgressSurgeries: activeOTs,
        upcomingSurgeries: scheduledOTs
      },
      ambulanceFleet: {
        total: activeResources.ambulances.length,
        dispatched: dispatchedAmbulances,
        available: availableAmbulances
      },
      staff: {
        totalRegistered: activeResources.staff.length,
        currentlyOnDuty: staffOnDuty
      },
      queueSummary: {
        emergencyQueueCount: 7,
        avgTriageWaitMinutes: 11,
        outpatientQueueCount: 24,
        avgOutpatientWaitMinutes: 28
      }
    };
  }

  /**
   * Bed Management & Filter
   */
  async getBeds(query = {}) {
    let beds = [...activeResources.beds];
    if (query.department) {
      beds = beds.filter(b => b.department.toLowerCase() === query.department.toLowerCase());
    }
    if (query.acuityLevel) {
      beds = beds.filter(b => b.acuityLevel.toLowerCase() === query.acuityLevel.toLowerCase());
    }
    if (query.status) {
      beds = beds.filter(b => b.status.toLowerCase() === query.status.toLowerCase());
    }
    return beds;
  }

  /**
   * Allocate Bed to Patient
   */
  async allocateBed({ bedId, patientId, patientName, acuityLevel }) {
    const bed = activeResources.beds.find(b => b.bedId === bedId);
    if (!bed) {
      throw new Error(`Bed with id "${bedId}" not found`);
    }
    if (bed.status === 'occupied') {
      throw new Error(`Bed "${bedId}" is already occupied by patient ${bed.patientName || bed.patientId}`);
    }

    bed.status = 'occupied';
    bed.patientId = patientId;
    bed.patientName = patientName;
    bed.admissionTime = new Date();
    if (acuityLevel) bed.acuityLevel = acuityLevel;

    return {
      success: true,
      message: `Bed ${bedId} successfully allocated to ${patientName}`,
      bed
    };
  }

  /**
   * Discharge / Release Bed
   */
  async dischargeBed(bedId) {
    const bed = activeResources.beds.find(b => b.bedId === bedId);
    if (!bed) {
      throw new Error(`Bed with id "${bedId}" not found`);
    }
    bed.status = 'available';
    bed.patientId = null;
    bed.patientName = null;
    bed.admissionTime = null;

    return {
      success: true,
      message: `Bed ${bedId} released and marked available`,
      bed
    };
  }

  /**
   * ICU Occupancy & Ventilator Status
   */
  async getIcuStatus() {
    const icuBeds = activeResources.beds.filter(b => b.acuityLevel === 'ICU');
    const ventilators = activeResources.equipment.filter(e => e.category === 'Ventilator');

    return {
      facilityId: activeResources.facilityId,
      icuBeds,
      ventilators,
      stats: {
        totalBeds: icuBeds.length,
        occupiedBeds: icuBeds.filter(b => b.status === 'occupied').length,
        ventilatorsTotal: ventilators.length,
        ventilatorsInUse: ventilators.filter(v => v.operationalStatus === 'in_use').length,
        acuityAlert: icuBeds.filter(b => b.status === 'occupied').length >= icuBeds.length * 0.85
      }
    };
  }

  /**
   * OT Scheduling
   */
  async getOperatingTheaters() {
    return activeResources.operatingTheaters;
  }

  async scheduleSurgery(bookingData) {
    const { theaterId, surgeryType, leadSurgeon, anesthesiologist, scheduledStart, scheduledEnd, priority } = bookingData;
    if (!theaterId || !surgeryType || !leadSurgeon || !scheduledStart || !scheduledEnd) {
      throw new Error('Missing required surgery scheduling details');
    }

    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);

    // Conflict check on theater
    const conflict = activeResources.operatingTheaters.find(ot => 
      ot.theaterId === theaterId &&
      ot.status !== 'cancelled' &&
      ot.status !== 'completed' &&
      ((start >= new Date(ot.scheduledStart) && start < new Date(ot.scheduledEnd)) ||
       (end > new Date(ot.scheduledStart) && end <= new Date(ot.scheduledEnd)))
    );

    if (conflict) {
      throw new Error(`Theater conflict: ${theaterId} is already booked for "${conflict.surgeryType}" during this timeframe.`);
    }

    const newBooking = {
      theaterId,
      name: `Theater ${theaterId}`,
      surgeryType,
      leadSurgeon,
      anesthesiologist: anesthesiologist || 'Assigned On-Call',
      scheduledStart: start,
      scheduledEnd: end,
      status: 'scheduled',
      priority: priority || 'elective'
    };

    activeResources.operatingTheaters.push(newBooking);
    return newBooking;
  }

  /**
   * Staff Allocation
   */
  async getStaff(query = {}) {
    let staff = [...activeResources.staff];
    if (query.role) staff = staff.filter(s => s.role.toLowerCase() === query.role.toLowerCase());
    if (query.department) staff = staff.filter(s => s.department.toLowerCase() === query.department.toLowerCase());
    if (query.shift) staff = staff.filter(s => s.shift.toLowerCase() === query.shift.toLowerCase());
    return staff;
  }

  /**
   * Ambulance Tracking & Dispatch
   */
  async getAmbulances() {
    return activeResources.ambulances;
  }

  async dispatchAmbulance({ vehicleNumber, emergencyCaseId, destinationCoords, estimatedMinutes }) {
    const ambulance = activeResources.ambulances.find(a => a.vehicleNumber === vehicleNumber);
    if (!ambulance) {
      throw new Error(`Ambulance "${vehicleNumber}" not found in fleet.`);
    }
    if (ambulance.status !== 'available') {
      throw new Error(`Ambulance "${vehicleNumber}" is currently ${ambulance.status}.`);
    }

    ambulance.status = 'dispatched';
    ambulance.emergencyCaseId = emergencyCaseId || `EMG-${Math.floor(1000 + Math.random() * 9000)}`;
    ambulance.etaMinutes = estimatedMinutes || 10;
    if (destinationCoords) {
      ambulance.currentCoordinates = destinationCoords;
    }

    return {
      success: true,
      message: `Ambulance ${vehicleNumber} dispatched for case ${ambulance.emergencyCaseId}`,
      ambulance
    };
  }

  /**
   * Queue Monitoring
   */
  async getQueues() {
    return [
      {
        department: 'Emergency & Trauma',
        activeDoctors: 4,
        waitingCount: 6,
        averageWaitMinutes: 12,
        queue: [
          { queueNumber: 'EMG-01', patientName: 'John Reynolds', triageCategory: 'Resuscitation (T1)', waitMinutes: 1 },
          { queueNumber: 'EMG-02', patientName: 'Maria Silva', triageCategory: 'Emergent (T2)', waitMinutes: 8 },
          { queueNumber: 'EMG-03', patientName: 'Samir Khan', triageCategory: 'Urgent (T3)', waitMinutes: 19 }
        ]
      },
      {
        department: 'Outpatient Cardiology',
        activeDoctors: 3,
        waitingCount: 14,
        averageWaitMinutes: 25,
        queue: [
          { queueNumber: 'CARD-11', patientName: 'Eleanor Gray', triageCategory: 'Routine', waitMinutes: 15 },
          { queueNumber: 'CARD-12', patientName: 'Lucas Croft', triageCategory: 'Routine', waitMinutes: 22 }
        ]
      }
    ];
  }

  /**
   * Equipment Status
   */
  async getEquipment(query = {}) {
    let equipment = [...activeResources.equipment];
    if (query.category) {
      equipment = equipment.filter(e => e.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.operationalStatus) {
      equipment = equipment.filter(e => e.operationalStatus.toLowerCase() === query.operationalStatus.toLowerCase());
    }
    return equipment;
  }
}

module.exports = new HospitalResourceService();
