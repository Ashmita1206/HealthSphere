const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { protect } = require('../middlewares/authMiddleware');

const SEED_DOCTORS = [
  {
    doctorId: 'DOC-882101',
    fullName: 'Dr. Sarah Jenkins, MD',
    email: 'sarah.jenkins@stjude-health.org',
    phone: '+1 (555) 234-5678',
    specialization: 'Cardiology',
    hospital: 'St. Jude Heart & Vascular Institute',
    experience: 14,
    qualification: 'MD, FACC, Harvard Medical School',
    licenseNumber: 'MED-CA-99281',
    availability: ['Monday - Thursday: 08:30 - 16:30', 'Friday: 09:00 - 13:00'],
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    verified: true,
  },
  {
    doctorId: 'DOC-882102',
    fullName: 'Dr. Rajesh Sharma, MBBS, MD',
    email: 'r.sharma@metropolitan-health.org',
    phone: '+1 (555) 345-6789',
    specialization: 'Internal Medicine',
    hospital: 'Metropolitan General Hospital',
    experience: 18,
    qualification: 'MD - General Medicine, Johns Hopkins Fellow',
    licenseNumber: 'MED-NY-41208',
    availability: ['Monday - Friday: 09:00 - 17:00'],
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    verified: true,
  },
  {
    doctorId: 'DOC-882103',
    fullName: 'Dr. Elena Rostova, MD, PhD',
    email: 'elena.rostova@neurolife-center.org',
    phone: '+1 (555) 456-7890',
    specialization: 'Neurology',
    hospital: 'NeuroLife Brain & Spine Center',
    experience: 11,
    qualification: 'MD, PhD - Clinical Neurology, Oxford University',
    licenseNumber: 'MED-MA-60312',
    availability: ['Tuesday - Saturday: 10:00 - 18:00'],
    profileImage: 'https://images.unsplash.com/photo-1594824813579-99435b62b1a1?auto=format&fit=crop&q=80&w=300',
    verified: true,
  },
  {
    doctorId: 'DOC-882104',
    fullName: 'Dr. Marcus Vance, MD',
    email: 'm.vance@childrens-hope.org',
    phone: '+1 (555) 567-8901',
    specialization: 'Pediatrics',
    hospital: "Hope Children's Health Center",
    experience: 9,
    qualification: 'MD, Board Certified Pediatrician, Stanford',
    licenseNumber: 'MED-CA-81920',
    availability: ['Monday - Friday: 08:00 - 15:30'],
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    verified: true,
  },
  {
    doctorId: 'DOC-882105',
    fullName: 'Dr. Priya Patel, MD, FACE',
    email: 'priya.patel@endocrine-care.org',
    phone: '+1 (555) 678-9012',
    specialization: 'Endocrinology',
    hospital: 'Pacific Diabetes & Endocrine Center',
    experience: 15,
    qualification: 'MD, FACE, Columbia University',
    licenseNumber: 'MED-WA-37149',
    availability: ['Monday, Wednesday, Friday: 09:00 - 17:00'],
    profileImage: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=300',
    verified: true,
  },
];

// All routes are protected
router.use(protect);

/**
 * GET /api/doctors
 * List all doctors with optional search and specialization filters
 */
router.get('/', async (req, res, next) => {
  try {
    const count = await Doctor.countDocuments();
    if (count === 0) {
      await Doctor.insertMany(SEED_DOCTORS);
    }

    const { search, specialization } = req.query;
    const query = {};

    if (specialization && specialization !== 'All') {
      query.specialization = new RegExp(String(specialization).trim(), 'i');
    }

    if (search && String(search).trim()) {
      const term = String(search).trim();
      query.$or = [
        { fullName: new RegExp(term, 'i') },
        { specialization: new RegExp(term, 'i') },
        { hospital: new RegExp(term, 'i') },
        { qualification: new RegExp(term, 'i') },
      ];
    }

    const doctors = await Doctor.find(query).sort({ verified: -1, experience: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/doctors/:id
 * Retrieve single doctor by ID or doctorId
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    let doctor = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(id);
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ doctorId: id });
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
});

/**
 * POST /api/doctors
 * Create new doctor profile
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      specialization,
      hospital,
      experience,
      qualification,
      licenseNumber,
      availability,
      profileImage,
      doctorId,
    } = req.body;

    if (!fullName || !email || !specialization || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'fullName, email, specialization, and licenseNumber are required',
      });
    }

    // Check duplicate licenseNumber
    const existing = await Doctor.findOne({ licenseNumber: licenseNumber.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Doctor with license number ${licenseNumber} already exists`,
      });
    }

    const generatedDoctorId = doctorId || `DOC-${Date.now().toString().slice(-6)}`;

    const newDoctor = await Doctor.create({
      userId: req.user?._id || null,
      doctorId: generatedDoctorId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      specialization: specialization.trim(),
      hospital: hospital?.trim() || '',
      experience: Number(experience) || 0,
      qualification: qualification?.trim() || '',
      licenseNumber: licenseNumber.trim(),
      availability: Array.isArray(availability) && availability.length > 0 ? availability : ['Monday - Friday: 09:00 - 17:00'],
      profileImage: profileImage || '',
      verified: true,
    });

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      data: newDoctor,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/doctors/:id
 * Update doctor profile
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { doctorId: id };

    const updated = await Doctor.findOneAndUpdate(filter, { $set: req.body }, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/doctors/:id
 * Delete doctor profile
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { doctorId: id };

    const deleted = await Doctor.findOneAndDelete(filter);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor removed successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
