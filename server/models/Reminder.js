const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medicineName: { type: String, required: true },
    dosage: String,
    time: { type: String, required: true },
    frequency: { type: String, default: "daily" },
    reminderType: { type: String, default: "medication" },
    description: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", reminderSchema);
