const router = require("express").Router();
const Joi = require("joi");
const { protect } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validate");
const { triggerSos, resolveSos, nearbyHospitals } = require("../controllers/emergencyController");

router.use(protect);
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
router.post(
  "/sos",
  validate(
    Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    })
  ),
  triggerSos
);
router.post("/resolve", resolveSos);

module.exports = router;
