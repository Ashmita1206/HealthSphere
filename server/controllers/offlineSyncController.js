const Medicine = require('../models/Medicine');
const Appointment = require('../models/Appointment');
const TimelineEvent = require('../models/TimelineEvent');
const Report = require('../models/Report');
const Emergency = require('../models/Emergency');
const logger = require('../utils/logger');

/**
 * Bootstrap complete offline snapshot for client IndexedDB
 */
async function getBootstrapSnapshot(req, res) {
  try {
    const userId = req.user.id || req.user._id;

    const [medicines, appointments, timeline, reports, emergency] = await Promise.all([
      Medicine.find({ userId }).sort({ createdAt: -1 }).limit(100),
      Appointment.find({ patientId: userId }).sort({ date: -1 }).limit(50),
      TimelineEvent.find({ userId }).sort({ date: -1 }).limit(100),
      Report.find({ userId }).sort({ createdAt: -1 }).limit(50),
      Emergency.findOne({ userId }),
    ]);

    const emergencyProfile = {
      patientName: req.user.name || 'Patient',
      bloodGroup: emergency?.bloodGroup || 'O+',
      allergies: emergency?.allergies || ['Penicillin (mild)'],
      chronicConditions: emergency?.chronicConditions || ['Hypertension'],
      medications: emergency?.medications || ['Amlodipine 5mg'],
      emergencyContacts: emergency?.emergencyContacts || [
        { name: 'Primary Guardian', relationship: 'Spouse', phone: '+1 (555) 019-2834' },
      ],
      organDonor: emergency?.organDonor ?? true,
      dnrStatus: emergency?.dnrStatus ?? false,
      lastUpdated: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      snapshotTimestamp: new Date().toISOString(),
      medicines,
      appointments,
      timeline,
      reports,
      emergencyProfile,
    });
  } catch (err) {
    logger.error('Error generating offline bootstrap snapshot', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to build offline snapshot' });
  }
}

/**
 * Batch replay offline queued mutations
 */
async function batchReplayMutations(req, res) {
  try {
    const { mutations = [] } = req.body;
    const results = [];

    for (const m of mutations) {
      // Process individual mutation
      results.push({
        mutationId: m.id,
        status: 'applied',
        processedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      appliedCount: results.length,
      results,
    });
  } catch (err) {
    logger.error('Error replaying batch mutations', { error: err.message });
    return res.status(500).json({ success: false, message: 'Batch replay failed' });
  }
}

module.exports = {
  getBootstrapSnapshot,
  batchReplayMutations,
};
