const mongoose = require("mongoose");

const emergencyAlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
    nearestHelp: String,
    contactAlerted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmergencyAlert", emergencyAlertSchema);
