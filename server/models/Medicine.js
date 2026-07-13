const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    dosage: String,
    frequency: String,
    isActive: { type: Boolean, default: true },
    adherenceRate: { type: Number, default: 100 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
