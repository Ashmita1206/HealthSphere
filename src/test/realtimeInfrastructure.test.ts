import { describe, it, expect, beforeEach, vi } from 'vitest';

const { PresenceService } = require('../../server/services/presenceService');
const { registerRealtimeInfrastructureSocket } = require('../../server/sockets/realtimeInfrastructure.socket');

describe('F38 — Real-Time Infrastructure', () => {
  let presence: any;

  beforeEach(() => {
    presence = new PresenceService();
  });

  describe('Doctor & Patient Presence Tracking', () => {
    it('registers doctor connection with AVAILABLE status', () => {
      const doctor = { id: 'doc-101', name: 'Dr. John Watson', role: 'doctor' };
      const state = presence.registerConnection('sock-1', doctor);

      expect(state.userId).toBe('doc-101');
      expect(state.role).toBe('doctor');
      expect(state.status).toBe('AVAILABLE');
      expect(state.socketId).toBe('sock-1');
    });

    it('registers patient connection with ONLINE status', () => {
      const patient = { id: 'pat-202', name: 'Sherlock Holmes', role: 'patient' };
      const state = presence.registerConnection('sock-2', patient);

      expect(state.userId).toBe('pat-202');
      expect(state.role).toBe('patient');
      expect(state.status).toBe('ONLINE');
    });

    it('updates doctor status to BUSY_IN_CONSULTATION and preserves metadata', () => {
      const doctor = { id: 'doc-101', name: 'Dr. John Watson', role: 'doctor' };
      presence.registerConnection('sock-1', doctor);

      const updated = presence.updateStatus('doc-101', 'BUSY_IN_CONSULTATION', {
        activeConsultationId: 'c-999',
      });

      expect(updated.status).toBe('BUSY_IN_CONSULTATION');
      expect(updated.metadata.activeConsultationId).toBe('c-999');
    });

    it('filters online doctors and patients', () => {
      presence.registerConnection('sock-1', { id: 'd1', role: 'doctor', name: 'Dr. A' });
      presence.registerConnection('sock-2', { id: 'd2', role: 'doctor', name: 'Dr. B' });
      presence.registerConnection('sock-3', { id: 'p1', role: 'patient', name: 'Patient X' });

      presence.updateStatus('d2', 'OFFLINE');

      const activeDocs = presence.getOnlineDoctors();
      expect(activeDocs).toHaveLength(1);
      expect(activeDocs[0].userId).toBe('d1');

      const activePatients = presence.getOnlinePatients();
      expect(activePatients).toHaveLength(1);
      expect(activePatients[0].userId).toBe('p1');
    });

    it('records heartbeat timestamps', () => {
      presence.registerConnection('sock-1', { id: 'u1', role: 'doctor' });
      const initial = presence.users.get('u1').lastHeartbeat;

      const ok = presence.heartbeat('u1');
      expect(ok).toBe(true);
      expect(presence.users.get('u1').lastHeartbeat).toBeGreaterThanOrEqual(initial);
    });

    it('cleans up presence and room memberships on socket disconnect', () => {
      presence.registerConnection('sock-1', { id: 'doc-1', role: 'doctor' });
      presence.joinConsultation('room-42', 'doc-1');

      const left = presence.removeConnection('sock-1');
      expect(left.status).toBe('OFFLINE');
      expect(presence.consultationRooms.get('room-42').has('doc-1')).toBe(false);
    });
  });

  describe('Consultation Room Orchestration', () => {
    it('manages consultation room participants', () => {
      presence.joinConsultation('room-1', 'user-A');
      presence.joinConsultation('room-1', 'user-B');

      let members = presence.joinConsultation('room-1', 'user-C');
      expect(members).toEqual(['user-A', 'user-B', 'user-C']);

      members = presence.leaveConsultation('room-1', 'user-B');
      expect(members).toEqual(['user-A', 'user-C']);
    });
  });

  describe('Connection Recovery & Missed Events Replay', () => {
    it('buffers events and replays missed events based on lastEventId', () => {
      const e1 = presence.bufferEventForUser('u100', 'notification:new', { text: 'Report Ready' });
      const e2 = presence.bufferEventForUser('u100', 'consultation:invite', { id: 'c-1' });
      const e3 = presence.bufferEventForUser('u100', 'chat:message', { text: 'Hello' });

      // Client reconnected claiming they saw e1
      const missed = presence.getMissedEvents('u100', e1.id);
      expect(missed).toHaveLength(2);
      expect(missed[0].id).toBe(e2.id);
      expect(missed[1].id).toBe(e3.id);

      // Client reconnected with unknown ID gets all buffered events
      const allMissed = presence.getMissedEvents('u100', null);
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
