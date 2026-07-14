const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const c = require("../controllers/reportController");

router.use(protect);
router.get("/", c.listReports);
router.post("/upload", c.upload.single("file"), c.uploadReport);
router.delete("/:id", c.deleteReport);

module.exports = router;
