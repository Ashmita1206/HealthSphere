const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bloodType: { type: String, trim: true },
    organType: { type: String, trim: true },
    donationType: { type: String, trim: true },
    status: { type: String, default: "active", trim: true },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const donationRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requestType: { type: String, trim: true },
    bloodType: { type: String, trim: true },
    organType: { type: String, trim: true },
    urgency: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "fulfilled", "cancelled", "active"],
      default: "pending",
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = {
  Donor: mongoose.model("Donor", donorSchema),
  DonationRequest: mongoose.model("DonationRequest", donationRequestSchema)
};
