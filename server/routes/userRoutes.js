const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const { getProfile, updateProfile, updatePreferences } = require("../controllers/userController");

router.use(protect);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/preferences", updatePreferences);

module.exports = router;
