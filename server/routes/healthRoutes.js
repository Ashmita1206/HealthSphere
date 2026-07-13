const router = require("express").Router();
const Joi = require("joi");
const { protect } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validate");
const { chatLimiter } = require("../middlewares/rateLimiters");
const c = require("../controllers/healthController");

router.use(protect);
router.get("/logs", c.listLogs);
router.post("/logs", c.createLog);
router.put("/logs/:id", c.updateLog);
router.delete("/logs/:id", c.deleteLog);
router.get("/medicines", c.listMedicines);
router.post("/medicines", c.createMedicine);
router.delete("/medicines/:id", c.deleteMedicine);
router.get("/appointments", c.listAppointments);
router.post("/appointments", c.createAppointment);
router.delete("/appointments/:id", c.deleteAppointment);
router.post("/donors", c.registerDonor);
router.post("/donation-requests", c.createDonationRequest);
router.get("/insights", c.getInsights);
router.post(
  "/chat",
  chatLimiter,
  validate(
    Joi.object({
      messages: Joi.array().items(
        Joi.object({
          role: Joi.string().valid("user", "assistant").required(),
          content: Joi.string().allow("").required()
        })
      ).min(1).required()
    })
  ),
  c.chat
);

module.exports = router;
