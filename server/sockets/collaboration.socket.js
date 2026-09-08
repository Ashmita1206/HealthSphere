const jwt = require('jsonwebtoken');
const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const ConsultationMessage = require('../models/ConsultationMessage');
const timelineService = require('../services/timelineService');
const { createNotification } = require('../services/notificationService');
const logger = require('../utils/logger');
const { getJwtSecret } = require('../config/jwt.config');

// Track active participants per consultation room: { consultationId: Set<string (userId:role)> }
const activeRoomParticipants = new Map();

/**
 * Helper to authenticate socket connection
 */
function authenticateSocket(socket, next) {
  try {
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      '';
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;

    if (!token) {
      return next(new Error('Authentication required for real-time collaboration'));
    }

    const secret = getJwtSecret ? getJwtSecret() : (process.env.JWT_SECRET || 'healthsphere_secret');
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return next(new Error('Invalid token payload'));
    }

    socket.user = {
      id: userId.toString(),
      _id: userId.toString(),
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return next(new Error('Invalid or expired authentication token'));
  }
}

/**
 * Determine caller role in consultation
 */
async function getParticipantRole(userId, consultation) {
  if (consultation.patientId.toString() === userId.toString()) {
    return 'patient';
  }

  const doctorProfile = await Doctor.findOne({ userId });
  if (
    doctorProfile &&
    consultation.doctorId.toString() === doctorProfile._id.toString()
  ) {
    return 'doctor';
  }

  return null;
}

/**
 * Register collaboration socket handlers on a namespace or main io
 */
function attachCollaborationHandlers(socketNamespace) {
  socketNamespace.use(authenticateSocket);

  socketNamespace.on('connection', (socket) => {
    const userId = socket.user.id;
    const userRoom = `user:${userId}`;
    socket.join(userRoom);

    logger.info('Collaboration socket connected', { socketId: socket.id, userId });

    socket.emit('authenticated', {
      success: true,
      userId,
      connectedAt: new Date().toISOString(),
    });

    /*
    ====================================================
    JOIN CONSULTATION
    ====================================================
    */
    socket.on('join_consultation', async ({ consultationId }) => {
      try {
        if (!consultationId) {
          return socket.emit('collaboration_error', { message: 'consultationId is required' });
        }

        const consultation = await Consultation.findById(consultationId)
          .populate('patientId', 'name email phone')
          .populate({
            path: 'doctorId',
            populate: { path: 'userId', select: 'name email phone' },
          });

        if (!consultation) {
          return socket.emit('collaboration_error', { message: 'Consultation not found' });
        }

        const role = await getParticipantRole(userId, consultation);
        if (!role) {
          return socket.emit('collaboration_error', {
            message: 'Unauthorized: You are not a participant in this consultation',
          });
        }

        const roomName = `consultation:${consultationId}`;
        socket.join(roomName);
        socket.currentConsultationId = consultationId;
        socket.userRole = role;

        // Track active room participants
        if (!activeRoomParticipants.has(consultationId)) {
          activeRoomParticipants.set(consultationId, new Set());
        }
        activeRoomParticipants.get(consultationId).add(`${userId}:${role}`);

        const participantsList = Array.from(activeRoomParticipants.get(consultationId)).map((p) => {
          const [uId, uRole] = p.split(':');
          return { userId: uId, role: uRole };
        });

        // Notify caller of successful join and current consultation state
        socket.emit('joined_consultation', {
          consultationId,
          role,
          status: consultation.status,
          prescription: consultation.prescription || [],
          doctorNotes: consultation.doctorNotes || '',
          startedAt: consultation.startedAt,
          endedAt: consultation.endedAt,
          participants: participantsList,
        });

        // Broadcast to room that participant joined
        socket.to(roomName).emit('participant_joined', {
          userId,
          role,
          timestamp: new Date().toISOString(),
          participants: participantsList,
        });

        logger.info('User joined consultation room', { consultationId, userId, role });
      } catch (err) {
        logger.error('Failed to join consultation room', { error: err.message, consultationId });
        socket.emit('collaboration_error', { message: err.message || 'Unable to join consultation' });
      }
    });

    /*
    ====================================================
    RECONNECT / SYNC CONSULTATION (Reconnection Support)
    ====================================================
    */
    socket.on('sync_consultation', async ({ consultationId, lastMessageTimestamp }) => {
      try {
        if (!consultationId) {
          return socket.emit('collaboration_error', { message: 'consultationId is required' });
        }

        const consultation = await Consultation.findById(consultationId);
        if (!consultation) {
          return socket.emit('collaboration_error', { message: 'Consultation not found' });
        }

        const role = await getParticipantRole(userId, consultation);
        if (!role) {
          return socket.emit('collaboration_error', { message: 'Unauthorized for consultation sync' });
        }

        const roomName = `consultation:${consultationId}`;
        socket.join(roomName);
        socket.currentConsultationId = consultationId;
        socket.userRole = role;

        // Fetch missed messages
        const query = { consultationId };
        if (lastMessageTimestamp) {
          query.createdAt = { $gt: new Date(lastMessageTimestamp) };
        }

        const missedMessages = await ConsultationMessage.find(query)
          .sort({ createdAt: 1 })
          .populate('senderId', 'name email');

        const activeParticipants = activeRoomParticipants.get(consultationId) || new Set();
        activeParticipants.add(`${userId}:${role}`);
        activeRoomParticipants.set(consultationId, activeParticipants);

        socket.emit('consultation_synced', {
          consultationId,
          status: consultation.status,
          prescription: consultation.prescription,
          doctorNotes: consultation.doctorNotes,
          startedAt: consultation.startedAt,
          endedAt: consultation.endedAt,
          missedMessages,
          onlineParticipants: Array.from(activeParticipants).map((p) => {
            const [uId, uRole] = p.split(':');
            return { userId: uId, role: uRole };
          }),
        });
      } catch (err) {
        logger.error('Failed to sync consultation state', { error: err.message, consultationId });
        socket.emit('collaboration_error', { message: 'Failed to sync consultation' });
      }
    });

    /*
    ====================================================
    DOCTOR ↔ PATIENT LIVE MESSAGING
    ====================================================
    */
    socket.on('send_message', async ({ consultationId, content, attachments = [] }) => {
      try {
        if (!consultationId || !content || !String(content).trim()) {
          return socket.emit('collaboration_error', {
            message: 'consultationId and non-empty content are required',
          });
        }

        const consultation = await Consultation.findById(consultationId);
        if (!consultation) {
          return socket.emit('collaboration_error', { message: 'Consultation not found' });
        }

        const role = await getParticipantRole(userId, consultation);
        if (!role) {
          return socket.emit('collaboration_error', { message: 'Unauthorized sender' });
        }

        const messageDoc = await ConsultationMessage.create({
          consultationId,
          senderId: userId,
          senderRole: role,
          content: String(content).trim(),
          attachments,
          status: 'sent',
        });

        const populatedMessage = await ConsultationMessage.findById(messageDoc._id).populate(
          'senderId',
          'name email'
        );

        const roomName = `consultation:${consultationId}`;
        socketNamespace.to(roomName).emit('new_message', populatedMessage);

        // Notify other participant if they are not in the room
        const targetUserId =
          role === 'doctor'
            ? consultation.patientId.toString()
            : (await Doctor.findById(consultation.doctorId))?.userId?.toString();

        if (targetUserId) {
          await createNotification({
            userId: targetUserId,
            title: `New message from ${role === 'doctor' ? 'Physician' : 'Patient'}`,
            message: String(content).slice(0, 80),
            type: 'consultation',
            route: `/consultations/${consultationId}`,
          });
        }
      } catch (err) {
        logger.error('Send message error', { error: err.message, consultationId });
        socket.emit('collaboration_error', { message: 'Unable to send message' });
      }
    });

    /*
    ====================================================
    TYPING INDICATORS
    ====================================================
    */
    socket.on('typing', ({ consultationId, isTyping }) => {
      if (!consultationId) return;
      const roomName = `consultation:${consultationId}`;
      socket.to(roomName).emit('user_typing', {
        userId,
        role: socket.userRole || 'participant',
        isTyping: Boolean(isTyping),
      });
    });

    /*
    ====================================================
    READ RECEIPTS
    ====================================================
    */
    socket.on('mark_read', async ({ consultationId, messageIds = [] }) => {
      try {
        if (!consultationId || !Array.isArray(messageIds) || messageIds.length === 0) return;

        const now = new Date();
        await ConsultationMessage.updateMany(
          {
            _id: { $in: messageIds },
            consultationId,
            senderId: { $ne: userId },
            status: { $ne: 'read' },
          },
          {
            $set: { status: 'read', readAt: now },
          }
        );

        const roomName = `consultation:${consultationId}`;
        socket.to(roomName).emit('messages_read', {
          consultationId,
          messageIds,
          readBy: userId,
          readAt: now.toISOString(),
        });
      } catch (err) {
        logger.warn('Mark read error', { error: err.message });
      }
    });

    /*
    ====================================================
    LIVE CONSULTATION STATUS
    ====================================================
    */
    socket.on('update_status', async ({ consultationId, status }) => {
      try {
        if (!consultationId || !['scheduled', 'active', 'completed', 'cancelled'].includes(status)) {
          return socket.emit('collaboration_error', { message: 'Valid status is required' });
        }

        const consultation = await Consultation.findById(consultationId);
        if (!consultation) {
          return socket.emit('collaboration_error', { message: 'Consultation not found' });
        }

        const role = await getParticipantRole(userId, consultation);
        if (!role) {
          return socket.emit('collaboration_error', { message: 'Unauthorized to change status' });
        }

        consultation.status = status;
        if (status === 'active' && !consultation.startedAt) {
          consultation.startedAt = new Date();
        }
        if (status === 'completed' && !consultation.endedAt) {
          consultation.endedAt = new Date();
        }
        await consultation.save();

        const roomName = `consultation:${consultationId}`;
        socketNamespace.to(roomName).emit('consultation_status', {
          consultationId,
          status,
          startedAt: consultation.startedAt,
          endedAt: consultation.endedAt,
          updatedBy: userId,
          role,
        });

        // Update Timeline
        if (status === 'active' || status === 'completed') {
          await timelineService.createEvent({
            userId: consultation.patientId,
            eventType: 'appointment',
            title: `Consultation ${status === 'active' ? 'Started' : 'Completed'}`,
            description: `Live telemedicine session was marked ${status}.`,
            relatedId: consultation._id,
          });
        }
      } catch (err) {
        logger.error('Update status error', { error: err.message, consultationId });
        socket.emit('collaboration_error', { message: 'Unable to update status' });
      }
    });

    /*
    ====================================================
    PRESCRIPTION UPDATES IN REAL TIME
    ====================================================
    */
    socket.on('update_prescription', async ({ consultationId, prescription, doctorNotes }) => {
      try {
        if (!consultationId) {
          return socket.emit('collaboration_error', { message: 'consultationId is required' });
        }

        const consultation = await Consultation.findById(consultationId);
        if (!consultation) {
          return socket.emit('collaboration_error', { message: 'Consultation not found' });
        }

        const role = await getParticipantRole(userId, consultation);
        if (role !== 'doctor') {
          return socket.emit('collaboration_error', {
            message: 'Unauthorized: Only the doctor can update prescription and clinical notes',
          });
        }

        if (Array.isArray(prescription)) {
          consultation.prescription = prescription.map((p) => ({
            medicineName: String(p.medicineName || '').trim(),
            dosage: String(p.dosage || '').trim(),
            frequency: String(p.frequency || '').trim(),
            duration: String(p.duration || '').trim(),
            instructions: String(p.instructions || '').trim(),
          }));
        }

        if (doctorNotes !== undefined) {
          consultation.doctorNotes = String(doctorNotes).trim();
        }

        await consultation.save();

        const roomName = `consultation:${consultationId}`;
        const updatePayload = {
          consultationId,
          prescription: consultation.prescription,
          doctorNotes: consultation.doctorNotes,
          updatedAt: new Date().toISOString(),
        };

        socketNamespace.to(roomName).emit('prescription_updated', updatePayload);

        // Notify patient & update timeline
        await createNotification({
          userId: consultation.patientId,
          title: 'Live Prescription Updated',
          message: 'Your physician just updated your digital prescription in real time.',
          type: 'medication',
          priority: 'high',
          route: `/consultations/${consultationId}`,
        });

        await timelineService.createEvent({
          userId: consultation.patientId,
          eventType: 'medication',
          title: 'Prescription Updated Live',
          description: `Doctor updated prescription with ${consultation.prescription.length} medicines.`,
          relatedId: consultation._id,
        });
      } catch (err) {
        logger.error('Update prescription error', { error: err.message, consultationId });
        socket.emit('collaboration_error', { message: 'Failed to update prescription' });
      }
    });

    /*
    ====================================================
    LEAVE CONSULTATION
    ====================================================
    */
    socket.on('leave_consultation', ({ consultationId }) => {
      const cId = consultationId || socket.currentConsultationId;
      if (!cId) return;

      const roomName = `consultation:${cId}`;
      socket.leave(roomName);

      if (activeRoomParticipants.has(cId)) {
        activeRoomParticipants.get(cId).delete(`${userId}:${socket.userRole}`);
      }

      socket.to(roomName).emit('participant_left', {
        userId,
        role: socket.userRole,
        timestamp: new Date().toISOString(),
      });

      socket.currentConsultationId = null;
    });

    /*
    ====================================================
    DISCONNECT HANDLER
    ====================================================
    */
    socket.on('disconnect', () => {
      if (socket.currentConsultationId) {
        const cId = socket.currentConsultationId;
        const roomName = `consultation:${cId}`;

        if (activeRoomParticipants.has(cId)) {
          activeRoomParticipants.get(cId).delete(`${userId}:${socket.userRole}`);
        }

        socket.to(roomName).emit('participant_disconnected', {
          userId,
          role: socket.userRole,
          disconnectedAt: new Date().toISOString(),
        });
      }

      logger.info('Collaboration socket disconnected', { socketId: socket.id, userId });
    });
  });
}

/**
 * Main register function for collaboration socket
 */
function registerCollaborationSocket(io) {
  // Attach handlers to root io
  attachCollaborationHandlers(io);

  // Attach handlers to /collaboration namespace
  const collabNamespace = io.of('/collaboration');
  attachCollaborationHandlers(collabNamespace);

  return collabNamespace;
}

module.exports = registerCollaborationSocket;
module.exports.activeRoomParticipants = activeRoomParticipants;
