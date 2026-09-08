const express = require('express');
const router = express.Router();
const MedicalProfile = require('../models/MedicalProfile');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');

/**
 * Public Route: GET /api/profile/medical/public/:healthId
 * Read-only emergency summary accessible via QR code scan
 */
router.get('/public/:healthId', async (req, res, next) => {
  try {
    const { healthId } = req.params;
    const profile = await MedicalProfile.findOne({ healthId }).lean();
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Digital Health ID not found' });
    }

    // Return only emergency-critical medical data
    const emergencySummary = {
      healthId: profile.healthId,
      fullName: profile.fullName,
      bloodGroup: profile.bloodGroup,
      allergies: profile.allergies,
      chronicDiseases: profile.chronicDiseases,
      currentMedications: profile.currentMedications,
      emergencyContacts: profile.emergencyContacts,
      organDonor: profile.organDonor,
      notes: profile.notes,
    };

    res.status(200).json({
      success: true,
      data: emergencySummary,
    });
  } catch (err) {
    next(err);
  }
});

// All routes below require user authentication
router.use(protect);

/**
 * GET /api/profile/medical
 * Fetch current authenticated user's medical profile
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let profile = await MedicalProfile.findOne({ userId });

    if (!profile) {
      const user = await User.findById(userId);
      const year = new Date().getFullYear();
      const suffix = userId.toString().slice(-6).toUpperCase();
      const healthId = `HS-${year}-${suffix}`;

      profile = new MedicalProfile({
        userId,
        healthId,
        fullName: user?.name || user?.fullName || 'HealthSphere Patient',
        bloodGroup: 'Unknown',
        allergies: [],
        chronicDiseases: [],
        currentMedications: [],
        surgeries: [],
        familyHistory: [],
        emergencyContacts: [],
        vaccinations: [],
      });
      await profile.save();
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/profile/medical
 * Create or initialize medical profile
 */
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const existing = await MedicalProfile.findOne({ userId });

    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      return res.status(200).json({
        success: true,
        data: existing,
        message: 'Medical profile updated successfully',
      });
    }

    const newProfile = new MedicalProfile({
      ...req.body,
      userId,
    });
    await newProfile.save();

    res.status(201).json({
      success: true,
      data: newProfile,
      message: 'Medical profile created successfully',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/profile/medical
 * Update medical profile fields
 */
router.put('/', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let profile = await MedicalProfile.findOne({ userId });

    if (!profile) {
      profile = new MedicalProfile({
        ...req.body,
        userId,
      });
    } else {
      // Whitelist updateable properties
      const fields = [
        'fullName',
        'dateOfBirth',
        'gender',
        'bloodGroup',
        'height',
        'weight',
        'allergies',
        'chronicDiseases',
        'currentMedications',
        'surgeries',
        'familyHistory',
        'emergencyContacts',
        'insurance',
        'organDonor',
        'vaccinations',
        'lifestyle',
        'address',
        'notes',
      ];

      fields.forEach((field) => {
        if (req.body[field] !== undefined) {
          profile[field] = req.body[field];
        }
      });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Medical profile updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/profile/medical
 * Remove medical profile
 */
router.delete('/', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    await MedicalProfile.findOneAndDelete({ userId });
    res.status(200).json({
      success: true,
      message: 'Medical profile deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
