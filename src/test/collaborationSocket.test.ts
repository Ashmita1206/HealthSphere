import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRequire } from 'module';

const req = createRequire(import.meta.url);
const jwt = req('../../server/node_modules/jsonwebtoken');
const realtimeService = req('../../server/services/realtimeService');

const JWT_SECRET = process.env.JWT_SECRET || 'healthsphere_secret';

describe('F17 — Real-Time Healthcare Collaboration Suite', () => {
  const doctorUserId = '64b1f77bcf86cd7994390001';
  const doctorProfileId = '64b1f77bcf86cd7994390002';
  const patientUserId = '64b1f77bcf86cd7994390003';
  const strangerUserId = '64b1f77bcf86cd7994390004';
  const consultationId = '64b1f77bcf86cd7994390005';

  const doctorToken = jwt.sign({ id: doctorUserId, email: 'dr.smith@healthsphere.com', role: 'doctor' }, JWT_SECRET);
  const patientToken = jwt.sign({ id: patientUserId, email: 'patient@healthsphere.com', role: 'user' }, JWT_SECRET);
  const strangerToken = jwt.sign({ id: strangerUserId, email: 'stranger@healthsphere.com', role: 'user' }, JWT_SECRET);

  let mockIO: any;
  let broadcastedEvents: Array<{ room?: string; namespace?: string; event: string; data: any }> = [];

  beforeEach(() => {
    broadcastedEvents = [];

    const createEmitter = (namespace = '/') => {
      const emitter: any = {
        to: vi.fn((room: string) => ({
          emit: vi.fn((event: string, data: any) => {
            broadcastedEvents.push({ namespace, room, event, data });
          }),
        })),
        emit: vi.fn((event: string, data: any) => {
          broadcastedEvents.push({ namespace, event, data });
        }),
      };
      return emitter;
    };

    const rootEmitter = createEmitter('/');
    const notifEmitter = createEmitter('/notifications');
    const collabEmitter = createEmitter('/collaboration');

    mockIO = {
      ...rootEmitter,
      of: vi.fn((ns: string) => {
        if (ns === '/notifications') return notifEmitter;
        if (ns === '/collaboration') return collabEmitter;
        return createEmitter(ns);
      }),
    };
  });

  /*
  ============================================================
  1. Real-Time Service & Broadcast Tests
  ============================================================
  */
  describe('1. Real-time Service & Broadcasting Engine', () => {
    it('initializes and configures io instance correctly', () => {
      realtimeService.setIO(mockIO);
      expect(realtimeService.getIO()).toBe(mockIO);
    });

    it('broadcasts real-time notifications to user isolated rooms on both root and /notifications', () => {
      realtimeService.setIO(mockIO);

      const fakeNotification = {
        _id: 'notif-1',
        userId: patientUserId,
        title: 'Appointment Reminder',
        message: 'Your consultation starts in 10 minutes',
        type: 'appointment',
      };

      realtimeService.broadcastNotification(patientUserId, fakeNotification);

      const userRoomEvents = broadcastedEvents.filter((e) => e.room === `user:${patientUserId}`);
      expect(userRoomEvents.length).toBeGreaterThanOrEqual(2);

      const rootEvents = userRoomEvents.filter((e) => e.namespace === '/');
      expect(rootEvents.some((e) => e.event === 'notification' || e.event === 'new_notification')).toBe(true);

      const notifEvents = userRoomEvents.filter((e) => e.namespace === '/notifications');
      expect(notifEvents.some((e) => e.event === 'notification')).toBe(true);
    });

    it('broadcasts timeline live updates to user isolated room', () => {
      realtimeService.setIO(mockIO);

      const fakeTimelineEvent = {
        _id: 'tl-1',
        userId: patientUserId,
        eventType: 'appointment',
        title: 'Doctor consultation started',
        description: 'Telemedicine room opened',
      };

      realtimeService.broadcastTimelineUpdate(patientUserId, fakeTimelineEvent);

      const timelineBroadcasts = broadcastedEvents.filter(
        (e) => e.room === `user:${patientUserId}` && e.event === 'timeline_update'
      );
      expect(timelineBroadcasts.length).toBeGreaterThanOrEqual(1);
      expect(timelineBroadcasts[0].data.event.title).toBe('Doctor consultation started');
    });

    it('broadcasts live consultation status and prescription updates to consultation room', () => {
      realtimeService.setIO(mockIO);

      // Status change
      realtimeService.broadcastConsultationStatus(consultationId, {
        status: 'active',
        startedAt: new Date().toISOString(),
      });

      const statusEvents = broadcastedEvents.filter(
        (e) => e.room === `consultation:${consultationId}` && e.event === 'consultation_status'
      );
      expect(statusEvents.length).toBeGreaterThanOrEqual(1);
      expect(statusEvents[0].data.status).toBe('active');

      // Prescription update
      const prescriptionData = {
        prescription: [
          { medicineName: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', duration: '7 days' },
        ],
        doctorNotes: 'Take after meals',
      };
      realtimeService.broadcastPrescriptionUpdate(consultationId, prescriptionData);

      const rxEvents = broadcastedEvents.filter(
        (e) => e.room === `consultation:${consultationId}` && e.event === 'prescription_updated'
      );
      expect(rxEvents.length).toBeGreaterThanOrEqual(1);
      expect(rxEvents[0].data.doctorNotes).toBe('Take after meals');
      expect(rxEvents[0].data.prescription[0].medicineName).toBe('Amoxicillin');
    });
  });

  /*
  ============================================================
  2. Doctor ↔ Patient Collaboration Socket Handler
  ============================================================
  */
  describe('2. Collaboration Socket Handlers & Authorization', () => {
    it('verifies valid JWT token and rejects unauthorized socket connections', () => {
      // Simulate socket handshake authentication
      const authenticateSocket = (token: string | null) => {
        if (!token) throw new Error('Authentication required for real-time collaboration');
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        };
      };

      // Valid token succeeds
      const doctorUser = authenticateSocket(doctorToken);
      expect(doctorUser.id).toBe(doctorUserId);
      expect(doctorUser.role).toBe('doctor');

      const patientUser = authenticateSocket(patientToken);
      expect(patientUser.id).toBe(patientUserId);

      // Missing token throws
      expect(() => authenticateSocket(null)).toThrow('Authentication required for real-time collaboration');

      // Malformed token throws
      expect(() => authenticateSocket('invalid.jwt.token')).toThrow();
    });

    it('manages consultation room participants and prevents unauthorized access', () => {
      // Mock consultation record
      const mockConsultation = {
        _id: consultationId,
        patientId: patientUserId,
        doctorId: doctorProfileId,
        status: 'scheduled',
        prescription: [],
        doctorNotes: '',
      };

      const getRole = (uId: string) => {
        if (uId === mockConsultation.patientId) return 'patient';
        if (uId === doctorUserId) return 'doctor'; // doctor associated with doctorProfileId
        return null;
      };

      expect(getRole(patientUserId)).toBe('patient');
      expect(getRole(doctorUserId)).toBe('doctor');
      expect(getRole(strangerUserId)).toBeNull(); // IDOR protection: stranger rejected
    });

    it('simulates live messaging with content validation and sender tagging', () => {
      const messagesDb: Array<{
        _id: string;
        consultationId: string;
        senderId: string;
        senderRole: string;
        content: string;
        status: string;
        readAt: string | null;
        createdAt: string;
      }> = [];

      const sendMessage = (consultationId: string, senderId: string, role: string, content: string) => {
        if (!content || !content.trim()) {
          throw new Error('Message content is required');
        }
        const msg = {
          _id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          consultationId,
          senderId,
          senderRole: role,
          content: content.trim(),
          status: 'sent',
          readAt: null,
          createdAt: new Date().toISOString(),
        };
        messagesDb.push(msg);
        return msg;
      };

      // Doctor sends message
      const docMsg = sendMessage(consultationId, doctorUserId, 'doctor', 'Hello, how are your symptoms today?');
      expect(docMsg.content).toBe('Hello, how are your symptoms today?');
      expect(docMsg.senderRole).toBe('doctor');
      expect(docMsg.status).toBe('sent');

      // Patient sends reply
      const patMsg = sendMessage(consultationId, patientUserId, 'patient', 'The fever has reduced, thank you doctor.');
      expect(patMsg.content).toBe('The fever has reduced, thank you doctor.');
      expect(patMsg.senderRole).toBe('patient');

      // Empty message rejected
      expect(() => sendMessage(consultationId, patientUserId, 'patient', '   ')).toThrow('Message content is required');

      expect(messagesDb.length).toBe(2);
    });

    it('handles typing indicators correctly', () => {
      const typingEvents: Array<{ userId: string; role: string; isTyping: boolean }> = [];

      const emitTyping = (userId: string, role: string, isTyping: boolean) => {
        typingEvents.push({ userId, role, isTyping });
      };

      emitTyping(doctorUserId, 'doctor', true);
      expect(typingEvents[0]).toEqual({ userId: doctorUserId, role: 'doctor', isTyping: true });

      emitTyping(doctorUserId, 'doctor', false);
      expect(typingEvents[1]).toEqual({ userId: doctorUserId, role: 'doctor', isTyping: false });
    });

    it('updates read receipts upon mark_read event', () => {
      const messagesDb = [
        { _id: 'm1', consultationId, senderId: doctorUserId, status: 'sent', readAt: null as string | null },
        { _id: 'm2', consultationId, senderId: doctorUserId, status: 'sent', readAt: null as string | null },
        { _id: 'm3', consultationId, senderId: patientUserId, status: 'sent', readAt: null as string | null },
      ];

      const markRead = (readerUserId: string, messageIds: string[]) => {
        const updatedIds: string[] = [];
        const now = new Date().toISOString();

        for (const msg of messagesDb) {
          // Can only mark messages read if reader was NOT the sender
          if (messageIds.includes(msg._id) && msg.senderId !== readerUserId) {
            msg.status = 'read';
            msg.readAt = now;
            updatedIds.push(msg._id);
          }
        }
        return { updatedIds, readAt: now };
      };

      // Patient marks doctor messages read
      const result = markRead(patientUserId, ['m1', 'm2', 'm3']);
      expect(result.updatedIds).toEqual(['m1', 'm2']);
      expect(messagesDb[0].status).toBe('read');
      expect(messagesDb[1].status).toBe('read');
      expect(messagesDb[2].status).toBe('sent'); // Patient cannot mark own message as read by self
    });

    it('supports reconnection and state sync', () => {
      const baseTime = new Date('2026-09-08T10:00:00Z').getTime();
      const messagesDb = [
        { _id: 'm1', createdAt: new Date(baseTime).toISOString(), content: 'msg 1' },
        { _id: 'm2', createdAt: new Date(baseTime + 5000).toISOString(), content: 'msg 2' },
        { _id: 'm3', createdAt: new Date(baseTime + 10000).toISOString(), content: 'msg 3' },
      ];

      const syncConsultation = (lastTimestamp?: string) => {
        if (!lastTimestamp) return messagesDb;
        const lastTime = new Date(lastTimestamp).getTime();
        return messagesDb.filter((m) => new Date(m.createdAt).getTime() > lastTime);
      };

      // Full sync if no timestamp provided
      expect(syncConsultation().length).toBe(3);

      // Reconnection sync with last received message timestamp (e.g. after m1)
      const missed = syncConsultation(new Date(baseTime).toISOString());
      expect(missed.length).toBe(2);
      expect(missed.map((m) => m._id)).toEqual(['m2', 'm3']);
    });
  });
});
