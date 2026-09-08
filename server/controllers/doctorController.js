const Doctor = require('../models/Doctor');
const User = require('../models/User');

/**
 * POST /api/doctors/profile
 * Register doctor profile for current authenticated user
 */
async function createDoctorProfile(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const {
      specialization,
      qualification,
      experience,
      hospital,
      licenseNumber,
      consultationFee,
      availability,
    } = req.body;

    if (!specialization || !qualification || !licenseNumber || !hospital) {
      return res.status(400).json({
        success: false,
        message: 'Specialization, qualification, hospital, and license number are required',
      });
    }

    // Prevent duplicate doctor profile for the same user
    const existingUserDoc = await Doctor.findOne({ userId });
    if (existingUserDoc) {
      return res.status(409).json({
        success: false,
        message: 'Doctor profile already exists for this user account',
      });
    }

    // Check duplicate license number
    const existingLicense = await Doctor.findOne({
      licenseNumber: licenseNumber.trim(),
    });
    if (existingLicense) {
      return res.status(409).json({
        success: false,
        message: `Doctor with license number ${licenseNumber} is already registered`,
      });
    }

    const doctor = await Doctor.create({
      userId,
      specialization: specialization.trim(),
      qualification: qualification.trim(),
      experience: Number(experience) || 0,
      hospital: hospital.trim(),
      licenseNumber: licenseNumber.trim(),
      consultationFee: Number(consultationFee) || 0,
      availability: Array.isArray(availability) && availability.length > 0
        ? availability
        : ['Monday - Friday: 09:00 - 17:00'],
      verified: true,
    });

    const populated = await Doctor.findById(doctor._id).populate(
      'userId',
      'name email phone bloodType'
    );

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/doctors/profile
 * Retrieve current authenticated user's doctor profile
 */
async function getMyDoctorProfile(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const doctor = await Doctor.findOne({ userId }).populate(
      'userId',
      'name email phone bloodType'
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this user',
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/doctors/profile
 * Update authenticated user's doctor profile (IDOR protected)
 */
async function updateDoctorProfile(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this user',
      });
    }

    const {
      specialization,
      qualification,
      experience,
      hospital,
      licenseNumber,
      consultationFee,
      availability,
    } = req.body;

    // If changing license number, check uniqueness
    if (licenseNumber && licenseNumber.trim() !== doctor.licenseNumber) {
      const existingLicense = await Doctor.findOne({
        licenseNumber: licenseNumber.trim(),
        _id: { $ne: doctor._id },
      });
      if (existingLicense) {
        return res.status(409).json({
          success: false,
          message: `Doctor with license number ${licenseNumber} already exists`,
        });
      }
      doctor.licenseNumber = licenseNumber.trim();
    }

    if (specialization) doctor.specialization = specialization.trim();
    if (qualification) doctor.qualification = qualification.trim();
    if (experience !== undefined) doctor.experience = Number(experience);
    if (hospital) doctor.hospital = hospital.trim();
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (Array.isArray(availability)) doctor.availability = availability;

    await doctor.save();

    const populated = await Doctor.findById(doctor._id).populate(
      'userId',
      'name email phone bloodType'
    );

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/doctors
 * Directory listing with optional filters
 */
async function getAllDoctors(req, res, next) {
  try {
    const { specialization, search, hospital } = req.query;
    const filter = {};

    if (specialization && specialization !== 'All') {
      filter.specialization = new RegExp(String(specialization).trim(), 'i');
    }

    if (hospital) {
      filter.hospital = new RegExp(String(hospital).trim(), 'i');
    }

    if (search && String(search).trim()) {
      const term = String(search).trim();
      filter.$or = [
        { specialization: new RegExp(term, 'i') },
        { hospital: new RegExp(term, 'i') },
        { qualification: new RegExp(term, 'i') },
      ];
    }

    const doctors = await Doctor.find(filter)
      .populate('userId', 'name email phone')
      .sort({ experience: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/doctors/:id
 * Retrieve specific doctor by ID
 */
async function getDoctorById(req, res, next) {
  try {
    const { id } = req.params;
    let doctor = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(id).populate('userId', 'name email phone');
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ userId: id }).populate('userId', 'name email phone');
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createDoctorProfile,
  getMyDoctorProfile,
  updateDoctorProfile,
  getAllDoctors,
  getDoctorById,
};
