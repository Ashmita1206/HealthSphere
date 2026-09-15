const mongoose = require('mongoose');

const PharmacyItemSchema = new mongoose.Schema({
  medicineId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  genericName: { type: String, required: true },
  brand: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Antibiotic', 'Cardiovascular', 'Analgesic', 'Endocrine', 'Respiratory', 'Emergency', 'Antiviral'], 
    required: true 
  },
  batchNumber: { type: String, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  reorderThreshold: { type: Number, required: true, default: 20 },
  unitPrice: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  storageCondition: { type: String, default: 'Room Temperature (15-25°C)' },
  supplier: { type: String, default: 'Apex Pharma Distribution' },
  status: { 
    type: String, 
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'expired'], 
    default: 'in_stock' 
  }
}, {
  timestamps: true,
  autoIndex: false,
  bufferCommands: false
});

module.exports = mongoose.model('PharmacyItem', PharmacyItemSchema);
