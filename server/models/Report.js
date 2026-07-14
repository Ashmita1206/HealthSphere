const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    extractedText: { type: String, default: "" },
    category: { type: String, default: "general" },
    fileType: String,
    fileSize: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
