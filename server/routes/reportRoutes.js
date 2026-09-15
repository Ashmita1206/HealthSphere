const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const c = require("../controllers/reportController");
const rac = require("../controllers/reportAnalysisController");

router.use(protect);
router.get("/", c.listReports);
router.get("/:id", c.getReportById);
router.post("/upload", c.upload.single("file"), c.uploadReport);
router.delete("/:id", c.deleteReport);
router.post("/:id/analyze", rac.analyzeReport);
router.get("/:id/analysis", rac.getReportAnalysis);

module.exports = router;
