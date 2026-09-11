import { describe, it, expect, beforeEach } from 'vitest';

describe('F43 — Real-Time Infrastructure & Presence System Suite', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const presence = require('../../server/services/presenceService');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const realtime = require('../../server/services/realtimeService');

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
