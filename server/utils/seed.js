require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const HealthLog = require("../models/HealthLog");
const Reminder = require("../models/Reminder");
const logger = require("./logger");

async function runSeed() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(process.env.MONGODB_URI);

  const email = "demo@healthsphere.ai";
  const passwordHash = await bcrypt.hash("Demo@12345", 10);

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: "HealthSphere Demo",
      email,
      password: passwordHash,
      gender: "prefer-not-to-say",
      healthScore: 78
    });
  }

  await HealthLog.deleteMany({ userId: user._id });
  await Reminder.deleteMany({ userId: user._id });

  await HealthLog.insertMany([
    { userId: user._id, symptoms: ["headache", "fatigue"], notes: "Mild symptoms after work", date: new Date() },
    { userId: user._id, symptoms: ["headache"], notes: "Headache recurring in evenings", date: new Date(Date.now() - 86400000) },
    { userId: user._id, symptoms: ["dizziness"], notes: "Dizzy spell in morning", date: new Date(Date.now() - 172800000) }
  ]);

  await Reminder.insertMany([
    { userId: user._id, medicineName: "Vitamin D", dosage: "1000 IU", time: "09:00", frequency: "daily", reminderType: "medication", isActive: true },
    { userId: user._id, medicineName: "BP Tablet", dosage: "5 mg", time: "20:00", frequency: "daily", reminderType: "medication", isActive: false }
  ]);

  logger.info("Seed completed", { demoUser: email });
  await mongoose.disconnect();
}

runSeed().catch(async (error) => {
  logger.error("Seed failed", { error: error.message });
  await mongoose.disconnect();
  process.exit(1);
});
