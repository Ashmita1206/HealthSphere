const mongoose = require("mongoose");

const emergencyAlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: { type: String, enum: ["active", "resolved"], default: "active" },
    nearestHelp: String,
    contactAlerted: { type: Boolean, default: false },
    dispatchRecords: [
      {
        contactId: String,
        contactName: String,
        phone: String,
        channel: { type: String, default: "sms" },
        status: {
          type: String,
          enum: ["pending", "queued", "sent", "delivered", "undelivered", "failed", "unconfigured"],
          default: "pending",
        },
        messageSid: String,
        errorCode: String,
        errorMessage: String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = (mongoose.models.EmergencyAlert || mongoose.model("EmergencyAlert", emergencyAlertSchema));
