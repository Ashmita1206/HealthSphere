const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorName: { type: String, required: true },
    specialty: String,
    hospital: String,
    appointmentDate: { type: Date, required: true },
    status: { type: String, default: "scheduled" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
