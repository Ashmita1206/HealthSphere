const router = require("express").Router();
const Joi = require("joi");
const { signup, login } = require("../controllers/authController");
const { validate } = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/rateLimiters");

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  fullName: Joi.string().min(2).max(100).optional(),
  name: Joi.string().min(2).max(100).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required()
});

router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);

module.exports = router;
