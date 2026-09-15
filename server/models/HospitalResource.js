const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema({
  bedId: { type: String, required: true, unique: true },
  department: { type: String, required: true, default: 'General Ward' },
  ward: { type: String, default: 'Ward-A' },
  roomNumber: { type: String, default: '101' },
  bedNumber: { type: String, required: true },
  acuityLevel: { type: String, enum: ['General', 'HDU', 'ICU', 'Isolation'], default: 'General' },
  status: { type: String, enum: ['available', 'occupied', 'cleaning', 'maintenance', 'reserved'], default: 'available' },
  patientId: { type: String, default: null },
  patientName: { type: String, default: null },
  admissionTime: { type: Date, default: null }
}, { _id: false });

const OperatingTheaterSchema = new mongoose.Schema({
  theaterId: { type: String, required: true },
  name: { type: String, required: true },
  surgeryType: { type: String, required: true },
  leadSurgeon: { type: String, required: true },
  anesthesiologist: { type: String, required: true },
  scheduledStart: { type: Date, required: true },
  scheduledEnd: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'delayed', 'cancelled'], default: 'scheduled' },
  priority: { type: String, enum: ['elective', 'urgent', 'emergency'], default: 'elective' }
}, { _id: false });

const StaffAllocationSchema = new mongoose.Schema({
  staffId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Doctor', 'Nurse', 'Surgeon', 'Technician', 'Paramedic'], required: true },
  department: { type: String, required: true },
  shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'On-Call'], default: 'Morning' },
  status: { type: String, enum: ['on_duty', 'break', 'off_duty', 'dispatched'], default: 'on_duty' },
  assignedUnit: { type: String, default: 'Floor-3' }
}, { _id: false });

const AmbulanceFleetSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Advanced Life Support', 'Basic Life Support', 'Neonatal'], default: 'Advanced Life Support' },
  status: { type: String, enum: ['available', 'dispatched', 'en_route_hospital', 'maintenance'], default: 'available' },
  currentCoordinates: {
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 }
  },
  etaMinutes: { type: Number, default: 0 },
  assignedParamedic: { type: String, default: 'John Doe' },
  emergencyCaseId: { type: String, default: null }
}, { _id: false });

const EquipmentStatusSchema = new mongoose.Schema({
  equipmentId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['Ventilator', 'Dialysis', 'ECG Monitor', 'Defibrillator', 'Infusion Pump'], required: true },
  location: { type: String, required: true },
  operationalStatus: { type: String, enum: ['operational', 'in_use', 'calibration_needed', 'out_of_service'], default: 'operational' },
  lastMaintenance: { type: Date, default: Date.now },
  telemetryMetrics: {
    batteryPercentage: { type: Number, default: 100 },
    temperatureCelsius: { type: Number, default: 24 },
    utilizationHours: { type: Number, default: 0 }
  }
}, { _id: false });

const HospitalResourceSnapshotSchema = new mongoose.Schema({
  facilityId: { type: String, default: 'HEALTHSPHERE-CENTRAL', required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  beds: [BedSchema],
  operatingTheaters: [OperatingTheaterSchema],
  staff: [StaffAllocationSchema],
  ambulances: [AmbulanceFleetSchema],
  equipment: [EquipmentStatusSchema]
}, {
  timestamps: true,
  autoIndex: false,
  bufferCommands: false
});

module.exports = mongoose.model('HospitalResourceSnapshot', HospitalResourceSnapshotSchema);
