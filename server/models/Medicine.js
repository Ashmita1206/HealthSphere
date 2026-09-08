const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true },
    time: { type: String, trim: true },
    timing: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "completed", "missed", "expired", "archived"],
      default: "active",
    },
    isActive: { type: Boolean, default: true },
    adherenceRate: { type: Number, default: 100, min: 0, max: 100 },
    remainingPills: { type: Number, min: 0 },
    totalPills: { type: Number, min: 0 },
    doctorName: { type: String, trim: true },
    description: { type: String, trim: true },
    instructions: { type: String, trim: true },
    strength: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
