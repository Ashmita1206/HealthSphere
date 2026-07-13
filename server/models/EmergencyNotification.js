const mongoose = require("mongoose");

const emergencyNotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    alertId: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyAlert", required: true },
    message: { type: String, required: true },
    type: { type: String, default: "contact_alert" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmergencyNotification", emergencyNotificationSchema);
