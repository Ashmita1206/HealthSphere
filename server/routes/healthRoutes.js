const router = require("express").Router();
const Joi = require("joi");
const { protect } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validate");
const { chatLimiter } = require("../middlewares/rateLimiters");
const c = require("../controllers/healthController");

const medicineUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  dosage: Joi.string().trim().allow("").max(100),
  frequency: Joi.string().trim().allow("").max(100),
  time: Joi.string().trim().allow("").max(100),
  timing: Joi.string().trim().allow("").max(100),
  startDate: Joi.string().trim().allow("").max(50),
  start_date: Joi.string().trim().allow("").max(50),
  endDate: Joi.string().trim().allow("").max(50),
  end_date: Joi.string().trim().allow("").max(50),
  notes: Joi.string().trim().allow("").max(1000),
  status: Joi.string().valid("active", "completed", "missed", "expired", "archived"),
  isActive: Joi.boolean(),
  is_active: Joi.boolean(),
  adherenceRate: Joi.number().min(0).max(100),
  adherence_rate: Joi.number().min(0).max(100),
  adherence: Joi.number().min(0).max(100),
  remainingPills: Joi.number().min(0),
  remaining_pills: Joi.number().min(0),
  totalPills: Joi.number().min(0),
  total_pills: Joi.number().min(0),
  doctorName: Joi.string().trim().allow("").max(200),
  doctor_name: Joi.string().trim().allow("").max(200),
  description: Joi.string().trim().allow("").max(1000),
  instructions: Joi.string().trim().allow("").max(1000),
  strength: Joi.string().trim().allow("").max(100),
}).min(1);

router.use(protect);
router.get("/logs", c.listLogs);
router.post("/logs", c.createLog);
router.put("/logs/:id", c.updateLog);
router.delete("/logs/:id", c.deleteLog);
router.get("/medicines", c.listMedicines);
router.post("/medicines", c.createMedicine);
router.put("/medicines/:id", validate(medicineUpdateSchema), c.updateMedicine);
router.delete("/medicines/:id", c.deleteMedicine);
router.get("/appointments", c.listAppointments);
router.post("/appointments", c.createAppointment);
router.put("/appointments/:id", c.updateAppointment);
router.delete("/appointments/:id", c.deleteAppointment);
router.get("/donors", c.listDonors);
router.post("/donors", c.registerDonor);
router.get("/donation-requests", c.listDonationRequests);
router.post("/donation-requests", c.createDonationRequest);
router.get("/insights", c.getInsights);
router.post("/doses/toggle", c.toggleDose);
router.get("/doses/today", c.getTodayDoses);
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
