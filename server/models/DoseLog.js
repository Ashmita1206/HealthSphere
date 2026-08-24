const mongoose = require("mongoose");

const doseLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    careActionId: { type: String, required: true, index: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
    reminderId: { type: mongoose.Schema.Types.ObjectId, ref: "Reminder" },
    medicineName: { type: String },
    scheduledDate: { type: String, required: true, index: true },
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

doseLogSchema.index({ userId: 1, careActionId: 1, scheduledDate: 1 }, { unique: true });

module.exports = mongoose.model("DoseLog", doseLogSchema);
