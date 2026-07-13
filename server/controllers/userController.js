const User = require("../models/User");

const toProfile = (u) => ({
  id: u._id,
  email: u.email || "",
  full_name: u.name || "",
  phone: u.phone || "",
  date_of_birth: u.dateOfBirth || "",
  gender: u.gender || "",
  blood_type: u.bloodType || "",
  address: u.address || "",
  emergency_contact_name: u.emergencyContactName || "",
  emergency_contact_phone: u.emergencyContactPhone || "",
  health_score: u.healthScore || 75
});

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    res.json(toProfile(user));
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const body = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: body.full_name,
        phone: body.phone,
        dateOfBirth: body.date_of_birth,
        gender: body.gender,
        bloodType: body.blood_type,
        address: body.address,
        emergencyContactName: body.emergency_contact_name,
        emergencyContactPhone: body.emergency_contact_phone,
        healthScore: body.health_score
      },
      { new: true }
    );
    res.json(toProfile(user));
  } catch (error) {
    next(error);
  }
}

async function updatePreferences(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { preferences: req.body }, { new: true });
    res.json(user.preferences || {});
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile, updatePreferences };
