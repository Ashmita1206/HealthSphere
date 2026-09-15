const MedicalImage = require('../models/MedicalImage');
const { medicalImagingService } = require('../services/medicalImagingService');

async function uploadScan(req, res, next) {
  try {
    const {
      patientId = req.user?.id || req.user?._id,
      modality = 'X-RAY',
      bodyPart = 'CHEST',
      imageUrl = 'https://images.unsplash.com/photo-1516549655169-df83a0774514',
      baselineImageId = null,
    } = req.body;

    const doctorId = req.user?.role === 'doctor' ? (req.user.id || req.user._id) : null;

    const scan = await medicalImagingService.processScan({
      patientId,
      doctorId,
      modality,
      bodyPart,
      imageUrl,
      baselineImageId,
    });

    res.status(201).json({ success: true, scan });
  } catch (error) {
    next(error);
  }
}

async function getScanDetails(req, res, next) {
  try {
    const { id } = req.params;
    const scan = await MedicalImage.findById(id).populate('patientId', 'name email').populate('verifiedBy', 'name');
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found' });
    res.json({ success: true, scan });
  } catch (error) {
    next(error);
  }
}

async function compareScans(req, res, next) {
  try {
    const { baselineScanId, followUpScanId } = req.body;
    if (!baselineScanId || !followUpScanId) {
      return res.status(400).json({ success: false, message: 'Both baselineScanId and followUpScanId are required' });
    }

    const comparison = await medicalImagingService.compareScans(baselineScanId, followUpScanId);
    res.json({ success: true, comparison });
  } catch (error) {
    next(error);
  }
}

async function getPatientScans(req, res, next) {
  try {
    const { patientId } = req.params;
    const { modality } = req.query;

    const filter = { patientId };
    if (modality) filter.modality = String(modality).toUpperCase();

    const scans = await MedicalImage.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: scans.length, scans });
  } catch (error) {
    next(error);
  }
}

async function verifyScan(req, res, next) {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const radiologistId = req.user?.id || req.user?._id;

    const scan = await medicalImagingService.verifyScan(id, radiologistId, notes || 'Verified by Radiologist');
    res.json({ success: true, scan });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadScan,
  getScanDetails,
  compareScans,
  getPatientScans,
  verifyScan,
};
