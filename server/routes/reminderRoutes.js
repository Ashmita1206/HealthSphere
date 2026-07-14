const router = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const c = require("../controllers/reminderController");

router.use(protect);
router.get("/", c.list);
router.post("/", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
