const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const Report = require("../models/Report");
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function uploadToCloudinary(fileBuffer, fileName) {
  return new Promise((resolve, reject) => {
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

async function listReports(req, res, next) {
  try {
    const rows = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(
      rows.map((r) => ({
        id: r._id,
        title: r.title,
        file_type: r.fileType || "",
        file_size: r.fileSize || 0,
        created_at: r.createdAt,
        file_url: r.fileUrl
      }))
    );
  } catch (error) {
    next(error);
  }
}

async function uploadReport(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Report file is required" });
    }
    const uploaded = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    const report = await Report.create({
      userId: req.user._id,
      title: req.body.title,
      fileUrl: uploaded.secure_url,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: req.body.category || "general",
      extractedText: ""
    });
    res.status(201).json({
      id: report._id,
      title: report.title,
      file_type: report.fileType,
      file_size: report.fileSize,
      created_at: report.createdAt,
      file_url: report.fileUrl
    });
  } catch (error) {
    next(error);
  }
}

async function deleteReport(req, res, next) {
  try {
    await Report.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = { upload, listReports, uploadReport, deleteReport };
