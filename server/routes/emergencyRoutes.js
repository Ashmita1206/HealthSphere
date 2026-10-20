const router = require("express").Router();
const Joi = require("joi");
const { protect } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validate");
const {
  triggerSos,
  resolveSos,
  nearbyHospitals,
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  twilioStatusCallback,
  getSosStatus,
} = require("../controllers/emergencyController");
const eic = require("../controllers/emergencyIncidentController");

// Twilio status webhook (MUST be public - Twilio does not have a user JWT)
router.post("/twilio/status-callback", twilioStatusCallback);

router.use(protect);
router.get("/contacts", listContacts);
router.post(
  "/contacts",
  validate(
    Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      relation: Joi.string().allow("").optional(),
    })
  ),
  createContact
);
router.put(
  "/contacts/:id",
  validate(
    Joi.object({
      name: Joi.string().optional(),
      phone: Joi.string().optional(),
      relation: Joi.string().allow("").optional(),
    })
  ),
  updateContact
);
router.delete("/contacts/:id", deleteContact);

router.get(
  "/nearby",
  validate(
    Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      radius: Joi.number().optional()
    }),
    "query"
  ),
  nearbyHospitals
);
const sosSchema = validate(
  Joi.object({
    latitude: Joi.number().optional().allow(null),
    longitude: Joi.number().optional().allow(null),
    contactIds: Joi.array().items(Joi.string()).optional(),
  })
);

router.post("/sos", sosSchema, triggerSos);
router.post("/trigger-sos", sosSchema, triggerSos);
router.get("/sos/status", getSosStatus);
router.get("/sos/:id/status", getSosStatus);
router.post("/resolve", resolveSos);
router.post("/report", eic.reportEmergency);
router.get("/history", eic.getEmergencyHistory);
router.get("/active", eic.getActiveEmergencies);
router.put("/:id/resolve", eic.resolveEmergency);

module.exports = router;
