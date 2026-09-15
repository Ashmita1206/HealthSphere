import { describe, it, expect, beforeEach, vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const presence = require('../../server/services/presenceService');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PresenceService } = require('../../server/services/presenceService');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const realtime = require('../../server/services/realtimeService');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { registerRealtimeInfrastructureSocket } = require('../../server/sockets/realtimeInfrastructure.socket');

describe('F43 — Real-Time Infrastructure & Presence System Suite', () => {
  beforeEach(() => {
    presence.reset();
  });

  it('1. Presence Registration: registers online doctors and patients with metadata', () => {
    presence.setUserOnline('doc-42', 'doctor', 'socket-doc-1', { specialty: 'Cardiology' });
    presence.setUserOnline('pat-100', 'patient', 'socket-pat-1', { bloodGroup: 'O+' });

    expect(presence.isUserOnline('doc-42')).toBe(true);
    expect(presence.isUserOnline('pat-100')).toBe(true);
    expect(presence.isUserOnline('unknown-user')).toBe(false);

    const doctors = presence.getOnlineDoctors();
    expect(doctors.length).toBe(1);
    expect(doctors[0].doctorId).toBe('doc-42');
    expect(doctors[0].status).toBe('available');

    const patients = presence.getOnlinePatients();
    expect(patients.length).toBe(1);
    expect(patients[0].patientId).toBe('pat-100');
  });

  it('2. Doctor Clinical Status: toggles availability and consultation modes', () => {
    presence.setUserOnline('doc-55', 'doctor', 'socket-doc-55');
    expect(presence.getUserPresence('doc-55').status).toBe('available');

    presence.setDoctorStatus('doc-55', 'in_consultation');
    expect(presence.getUserPresence('doc-55').status).toBe('in_consultation');

    presence.setDoctorStatus('doc-55', 'busy');
    expect(presence.getUserPresence('doc-55').status).toBe('busy');
  });

  it('3. Multi-Device Tracking & Disconnect Handling: preserves presence until last tab closes', () => {
    // User opens 2 tabs
    presence.setUserOnline('pat-200', 'patient', 'socket-tab-1');
    presence.setUserOnline('pat-200', 'patient', 'socket-tab-2');

    expect(presence.getUserPresence('pat-200').activeConnections).toBe(2);

    // Closes tab 1
    const offlineStatus1 = presence.setUserOffline('socket-tab-1');
    expect(offlineStatus1.online).toBe(true);
    expect(presence.isUserOnline('pat-200')).toBe(true);
    expect(presence.getUserPresence('pat-200').activeConnections).toBe(1);

    // Closes tab 2 -> now fully offline
    const offlineStatus2 = presence.setUserOffline('socket-tab-2');
    expect(offlineStatus2.online).toBe(false);
    expect(presence.isUserOnline('pat-200')).toBe(false);
  });

  it('4. Heartbeat & Stale Session Reaper: evicts zombie connections', () => {
    presence.setUserOnline('pat-zombie', 'patient', 'socket-zombie');

    // Simulate expired heartbeat by backdating lastSeen
    const entry = presence.users.get('pat-zombie');
    entry.lastSeen = Date.now() - 60000; // 60s ago (> 45s threshold)

    const sweptCount = presence.sweepStaleSessions();
    expect(sweptCount).toBe(1);
    expect(presence.isUserOnline('pat-zombie')).toBe(false);
  });

  it('5. Room Management: organizes multi-party consultation sessions', () => {
    presence.joinRoom('consultation:room-99', 'pat-300');
    presence.joinRoom('consultation:room-99', 'doc-88');

    const participants = presence.getRoomParticipants('consultation:room-99');
    expect(participants).toContain('pat-300');
    expect(participants).toContain('doc-88');

    presence.leaveRoom('consultation:room-99', 'pat-300');
    const remaining = presence.getRoomParticipants('consultation:room-99');
    expect(remaining).toEqual(['doc-88']);
  });

  it('6. Realtime Service Helpers: provides WebRTC signaling and notification streaming', () => {
    expect(typeof realtime.broadcastConsultationSignal).toBe('function');
    expect(typeof realtime.streamLiveNotification).toBe('function');
    expect(realtime.presenceService).toBeDefined();

    // Returns false cleanly when ioInstance is not yet bound in unit tests without crashing
    const streamed = realtime.streamLiveNotification('pat-1', { title: 'Test Alert' });
    expect(typeof streamed).toBe('boolean');
  });
});

describe('F38 — Real-Time Infrastructure', () => {
  let instancePresence: any;

  beforeEach(() => {
    instancePresence = new PresenceService();
  });

  describe('Doctor & Patient Presence Tracking', () => {
    it('registers doctor connection with AVAILABLE status', () => {
      const doctor = { id: 'doc-101', name: 'Dr. John Watson', role: 'doctor' };
      const state = instancePresence.registerConnection('sock-1', doctor);

      expect(state.userId).toBe('doc-101');
      expect(state.role).toBe('doctor');
      expect(state.status).toBe('AVAILABLE');
      expect(state.socketId).toBe('sock-1');
    });

    it('registers patient connection with ONLINE status', () => {
      const patient = { id: 'pat-202', name: 'Sherlock Holmes', role: 'patient' };
      const state = instancePresence.registerConnection('sock-2', patient);

      expect(state.userId).toBe('pat-202');
      expect(state.role).toBe('patient');
      expect(state.status).toBe('ONLINE');
    });

    it('updates doctor status to BUSY_IN_CONSULTATION and preserves metadata', () => {
      const doctor = { id: 'doc-101', name: 'Dr. John Watson', role: 'doctor' };
      instancePresence.registerConnection('sock-1', doctor);

      const updated = instancePresence.updateStatus('doc-101', 'BUSY_IN_CONSULTATION', {
        activeConsultationId: 'c-999',
      });

      expect(updated.status).toBe('BUSY_IN_CONSULTATION');
      expect(updated.metadata.activeConsultationId).toBe('c-999');
    });

    it('filters online doctors and patients', () => {
      instancePresence.registerConnection('sock-1', { id: 'd1', role: 'doctor', name: 'Dr. A' });
      instancePresence.registerConnection('sock-2', { id: 'd2', role: 'doctor', name: 'Dr. B' });
      instancePresence.registerConnection('sock-3', { id: 'p1', role: 'patient', name: 'Patient X' });

      instancePresence.updateStatus('d2', 'OFFLINE');

      const activeDocs = instancePresence.getOnlineDoctors();
      expect(activeDocs).toHaveLength(1);
      expect(activeDocs[0].userId).toBe('d1');

      const activePatients = instancePresence.getOnlinePatients();
      expect(activePatients).toHaveLength(1);
      expect(activePatients[0].userId).toBe('p1');
    });

    it('records heartbeat timestamps', () => {
      instancePresence.registerConnection('sock-1', { id: 'u1', role: 'doctor' });
      const initial = instancePresence.users.get('u1').lastHeartbeat;

      const ok = instancePresence.heartbeat('u1');
      expect(ok).toBe(true);
      expect(instancePresence.users.get('u1').lastHeartbeat).toBeGreaterThanOrEqual(initial);
    });

    it('cleans up presence and room memberships on socket disconnect', () => {
      instancePresence.registerConnection('sock-1', { id: 'doc-1', role: 'doctor' });
      instancePresence.joinConsultation('room-42', 'doc-1');

      const left = instancePresence.removeConnection('sock-1');
      expect(left.status).toBe('OFFLINE');
      expect(instancePresence.consultationRooms.get('room-42').has('doc-1')).toBe(false);
    });
  });

  describe('Consultation Room Orchestration', () => {
    it('manages consultation room participants', () => {
      instancePresence.joinConsultation('room-1', 'user-A');
      instancePresence.joinConsultation('room-1', 'user-B');

      let members = instancePresence.joinConsultation('room-1', 'user-C');
      expect(members).toEqual(['user-A', 'user-B', 'user-C']);

      members = instancePresence.leaveConsultation('room-1', 'user-B');
      expect(members).toEqual(['user-A', 'user-C']);
    });
  });

  describe('Connection Recovery & Missed Events Replay', () => {
    it('buffers events and replays missed events based on lastEventId', () => {
      const e1 = instancePresence.bufferEventForUser('u100', 'notification:new', { text: 'Report Ready' });
      const e2 = instancePresence.bufferEventForUser('u100', 'consultation:invite', { id: 'c-1' });
      const e3 = instancePresence.bufferEventForUser('u100', 'chat:message', { text: 'Hello' });

      // Client reconnected claiming they saw e1
      const missed = instancePresence.getMissedEvents('u100', e1.id);
      expect(missed).toHaveLength(2);
      expect(missed[0].id).toBe(e2.id);
      expect(missed[1].id).toBe(e3.id);

      // Client reconnected with unknown ID gets all buffered events
      const allMissed = instancePresence.getMissedEvents('u100', null);
      expect(allMissed).toHaveLength(3);
    });
  });

  describe('Socket Handler Registration', () => {
    it('registers realtime infrastructure middleware and connection listeners', () => {
      const mockIo = {
        use: vi.fn(),
        on: vi.fn(),
      };

      registerRealtimeInfrastructureSocket(mockIo);
      expect(mockIo.use).toHaveBeenCalled();
      expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });
  });
});
