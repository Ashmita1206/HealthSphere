const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bloodType: String,
    organType: String,
    donationType: String,
    status: { type: String, default: "active" },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const donationRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requestType: String,
    bloodType: String,
    organType: String,
    urgency: String,
    notes: String,
    status: { type: String, default: "active" }
  },
  { timestamps: true }
);

module.exports = {
  Donor: mongoose.model("Donor", donorSchema),
  DonationRequest: mongoose.model("DonationRequest", donationRequestSchema)
};
