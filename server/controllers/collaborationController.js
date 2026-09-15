const CareTeamThread = require('../models/CareTeamThread');
const SharedClinicalNote = require('../models/SharedClinicalNote');
const realtimeService = require('../services/realtimeCollaborationService');
const logger = require('../utils/logger');

/**
 * Get all doctors & staff presence status
 */
async function getStaffPresence(req, res) {
  try {
    const list = realtimeService.getAllStaffPresence();
    return res.status(200).json({
      success: true,
      presenceList: list,
    });
  } catch (err) {
    logger.error('Error fetching staff presence', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch presence' });
  }
}

/**
 * Update current user presence
 */
async function updateMyPresence(req, res) {
  try {
    const { status, department } = req.body;
    const userId = req.user.id || req.user._id;

    const presence = realtimeService.setStaffPresence(userId.toString(), {
      name: req.user.name || req.user.email,
      role: req.user.role || 'doctor',
      department: department || 'Clinical Department',
      status: status || 'available',
    });

    return res.status(200).json({ success: true, presence });
  } catch (err) {
    logger.error('Error updating presence', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to update presence' });
  }
}

/**
 * Get care team threads
 */
async function getCareTeamThreads(req, res) {
  try {
    const { department, urgency, status } = req.query;
    const query = {};
    if (department) query.department = department;
    if (urgency) query.urgency = urgency;
    if (status) query.status = status;

    const threads = await CareTeamThread.find(query)
      .sort({ lastActivityAt: -1 })
      .limit(50);

    return res.status(200).json({ success: true, count: threads.length, threads });
  } catch (err) {
    logger.error('Error fetching care team threads', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch care team threads' });
  }
}

/**
 * Create a care team thread
 */
async function createCareTeamThread(req, res) {
  try {
    const { patientId, patientName, caseTitle, department, urgency, initialMessage } = req.body;
    const userId = req.user.id || req.user._id;
    const userName = req.user.name || req.user.email || 'Dr. Specialist';

    const members = [
      {
        userId,
        name: userName,
        role: req.user.role || 'doctor',
        department: department || 'General Medicine',
      },
    ];

    const messages = [];
    if (initialMessage) {
      messages.push({
        senderId: userId,
        senderName: userName,
        senderRole: req.user.role || 'doctor',
        content: initialMessage,
        urgency: urgency || 'routine',
        createdAt: new Date(),
      });
    }

    const thread = await CareTeamThread.create({
      patientId: patientId || null,
      patientName: patientName || 'General Ward Patient',
      caseTitle,
      department: department || 'Emergency Medicine',
      urgency: urgency || 'routine',
      members,
      messages,
      lastActivityAt: new Date(),
    });

    return res.status(201).json({ success: true, thread });
  } catch (err) {
    logger.error('Error creating care team thread', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to create care team thread' });
  }
}

/**
 * Post message to care team thread
 */
async function postThreadMessage(req, res) {
  try {
    const { threadId } = req.params;
    const { content, urgency } = req.body;
    const userId = req.user.id || req.user._id;
    const userName = req.user.name || req.user.email || 'Dr. Specialist';

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const thread = await CareTeamThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Care team thread not found' });
    }

    const newMessage = {
      senderId: userId,
      senderName: userName,
      senderRole: req.user.role || 'doctor',
      content: content.trim(),
      urgency: urgency || 'routine',
      createdAt: new Date(),
    };

    thread.messages.push(newMessage);
    thread.lastActivityAt = new Date();

    // Ensure user is in members
    const memberExists = thread.members.some((m) => m.userId && m.userId.toString() === userId.toString());
    if (!memberExists) {
      thread.members.push({
        userId,
        name: userName,
        role: req.user.role || 'doctor',
        department: thread.department,
      });
    }

    await thread.save();

    return res.status(201).json({ success: true, message: newMessage, thread });
  } catch (err) {
    logger.error('Error posting message to thread', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to post message' });
  }
}

/**
 * Get or create shared clinical note for a patient
 */
async function getSharedClinicalNote(req, res) {
  try {
    const { patientId } = req.params;
    const { category = 'SOAP' } = req.query;

    let note = await SharedClinicalNote.findOne({ patientId, category });

    if (!note) {
      note = await SharedClinicalNote.create({
        patientId: patientId !== 'global' ? patientId : null,
        title: `Collaborative ${category} Note`,
        category,
        subjective: 'Patient reports progressive mild dyspnea on exertion for 3 days.',
        objective: 'Vitals: BP 128/82 mmHg, HR 76 bpm, SpO2 98% room air. Clear lung sounds.',
        assessment: 'Atypical exertion fatigue; monitor cardiovascular markers and CBC.',
        plan: '1. Echocardiogram\n2. Basic metabolic panel\n3. Follow up in 48 hours',
        version: 1,
      });
    }

    const activeLocks = realtimeService.getPatientLocks(patientId);

    return res.status(200).json({
      success: true,
      note,
      activeLocks,
    });
  } catch (err) {
    logger.error('Error fetching shared clinical note', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to load shared note' });
  }
}

/**
 * Update shared clinical note with optimistic concurrency check
 */
async function updateSharedClinicalNote(req, res) {
  try {
    const { noteId } = req.params;
    const { baseVersion, subjective, objective, assessment, plan, rawContent, forceOverwrite } = req.body;
    const userId = req.user.id || req.user._id;
    const userName = req.user.name || req.user.email || 'Clinician';

    const note = await SharedClinicalNote.findById(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Clinical note not found' });
    }

    // Check version conflict
    if (!forceOverwrite && baseVersion !== undefined && baseVersion !== note.version) {
      const conflict = realtimeService.detectConflict(baseVersion, note.version);
      return res.status(409).json({
        success: false,
        conflict: true,
        currentVersion: note.version,
        serverNote: note,
        message: conflict.message,
      });
    }

    // Save historical revision
    note.revisions.push({
      version: note.version,
      modifiedBy: userId,
      modifierName: userName,
      content: JSON.stringify({
        subjective: note.subjective,
        objective: note.objective,
        assessment: note.assessment,
        plan: note.plan,
      }),
      timestamp: new Date(),
    });

    if (subjective !== undefined) note.subjective = subjective;
    if (objective !== undefined) note.objective = objective;
    if (assessment !== undefined) note.assessment = assessment;
    if (plan !== undefined) note.plan = plan;
    if (rawContent !== undefined) note.rawContent = rawContent;

    note.version += 1;
    await note.save();

    return res.status(200).json({
      success: true,
      note,
      version: note.version,
      message: 'Clinical note updated successfully',
    });
  } catch (err) {
    logger.error('Error updating shared note', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to save note' });
  }
}

/**
 * Acquire field lock
 */
async function acquireLock(req, res) {
  try {
    const { patientId, field } = req.body;
    if (!patientId || !field) {
      return res.status(400).json({ success: false, message: 'patientId and field are required' });
    }

    const result = realtimeService.acquireChartLock(patientId, field, req.user);
    if (!result.acquired) {
      return res.status(423).json(result); // 423 Locked
    }

    return res.status(200).json(result);
  } catch (err) {
    logger.error('Error acquiring chart lock', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to acquire lock' });
  }
}

/**
 * Release field lock
 */
async function releaseLock(req, res) {
  try {
    const { patientId, field } = req.body;
    const userId = (req.user.id || req.user._id).toString();

    const result = realtimeService.releaseChartLock(patientId, field, userId);
    return res.status(200).json(result);
  } catch (err) {
    logger.error('Error releasing chart lock', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to release lock' });
  }
}

module.exports = {
  getStaffPresence,
  updateMyPresence,
  getCareTeamThreads,
  createCareTeamThread,
  postThreadMessage,
  getSharedClinicalNote,
  updateSharedClinicalNote,
  acquireLock,
  releaseLock,
};
