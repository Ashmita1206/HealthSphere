const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const { getJwtSecret } = require("../config/jwt.config");
const signToken = (id) => jwt.sign({ id }, getJwtSecret(), { expiresIn: "7d" });


async function signup(req, res, next) {
  try {
    const { email, password, fullName, name } = req.body;
    const userName = (fullName || name || "").trim();
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name: userName, email, password: hashed });
    res.status(201).json({ token: signToken(user._id), user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    res.json({ token: signToken(user._id), user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login };
