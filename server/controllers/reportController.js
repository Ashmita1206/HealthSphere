const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const Report = require("../models/Report");
const { parseMedicalReport } = require("../services/ocr/ocrService");
const { Readable } = require("stream");
const logger = require("../utils/logger");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function uploadToCloudinary(fileBuffer, fileName) {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Fallback for environment without Cloudinary credentials configured
      return resolve({ secure_url: `data:application/octet-stream;base64,${fileBuffer.toString("base64").slice(0, 100)}` });
    }
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "healthsphere/reports", public_id: `${Date.now()}-${fileName.replace(/\s+/g, "-")}`, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(fileBuffer).pipe(uploadStream);
  });
}

const mapReport = (r) => ({
  id: r._id,
  title: r.title,
  category: r.category || "general",
  file_type: r.fileType || "",
  file_size: r.fileSize || 0,
  file_url: r.fileUrl || "",
  created_at: r.createdAt,
  summary: r.summary || "",
  risk_level: r.riskLevel || "low",
  abnormal_values: r.abnormalValues || [],
  biomarkers: r.biomarkers || {},
  ocr_status: r.ocrStatus || "completed",
  extracted_text: r.extractedText || r.rawOcrText || "",
});

async function listReports(req, res, next) {
  try {
    const rows = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(rows.map(mapReport));
  } catch (error) {
    next(error);
  }
}

async function getReportById(req, res, next) {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(mapReport(report));
  } catch (error) {
    next(error);
  }
}

async function uploadReport(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Report file is required" });
    }

    // Server-side file validation
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Unsupported file type. Only PDF, JPEG, and PNG files are allowed." });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "File size exceeds maximum limit of 10MB." });
    }

    let fileUrl = "";
    try {
      const uploaded = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      fileUrl = uploaded.secure_url || "";
    } catch (err) {
      logger.warn("Cloudinary upload warning", { error: err.message });
    }

    // Create report record initially with pending status
    const report = await Report.create({
      userId: req.user._id,
      title: req.body.title || req.file.originalname,
      fileUrl: fileUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: req.body.category || "general",
      ocrStatus: "pending",
    });

    // Run Gemini OCR extraction
    try {
      const ocrResult = await parseMedicalReport({
        mimeType: req.file.mimetype,
        base64Data: req.file.buffer.toString("base64"),
      });

      if (ocrResult && ocrResult.ocrStatus !== "failed") {
        const normalizedRisk = ocrResult.riskLevel ? ocrResult.riskLevel.toLowerCase() : "low";
        const validRisk = ["low", "moderate", "high", "critical"].includes(normalizedRisk) ? normalizedRisk : "low";

        report.summary = ocrResult.summary || "";
        report.riskLevel = validRisk;
        report.abnormalValues = ocrResult.abnormalValues || [];
        report.biomarkers = ocrResult.biomarkers || {};
        report.category = ocrResult.category || report.category;
        report.ocrStatus = "completed";
      } else {
        report.ocrStatus = "failed";
      }
    } catch (ocrErr) {
      logger.warn("OCR processing failed during upload", { error: ocrErr.message });
      report.ocrStatus = "failed";
    }

    await report.save();
    res.status(201).json(mapReport(report));
  } catch (error) {
    next(error);
  }
}

async function deleteReport(req, res, next) {
  try {
    const result = await Report.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Report not found or unauthorized" });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = { upload, listReports, getReportById, uploadReport, deleteReport };
