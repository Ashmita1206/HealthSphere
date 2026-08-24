const mongoose = require("mongoose");

const healthLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    symptoms: { type: [String], default: [] },
    notes: String,
    weight: Number,
    glucose: Number,
    heartRate: Number,
    systolic: Number,
    diastolic: Number,
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthLog", healthLogSchema);
