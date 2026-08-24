const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    fileUrl: { type: String, default: "" },
    extractedText: { type: String, default: "" },
    category: { type: String, default: "general" },
    fileType: String,
    fileSize: Number,
    summary: String,
    riskLevel: { type: String, enum: ["low", "moderate", "high", "critical"], default: "low" },
    abnormalValues: { type: Array, default: [] },
    biomarkers: { type: Object, default: {} },
    ocrStatus: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
    rawOcrText: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
