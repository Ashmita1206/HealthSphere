const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    age: Number,
    gender: String,
    medicalHistory: { type: [String], default: [] },
    conditions: { type: [String], default: [] },
    medications: { type: [String], default: [] },
    phone: String,
    dateOfBirth: String,
    bloodType: String,
    address: String,
    emergencyContactName: String,
    emergencyContactPhone: String,
    healthScore: { type: Number, default: 75 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
