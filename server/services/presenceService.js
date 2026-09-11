/**
 * Enterprise Presence & Real-Time State Service
 */
class PresenceService {
  constructor() {
    // userId -> { socketId, role, status, lastHeartbeat, metadata }
    this.users = new Map();
    // socketId -> userId
    this.socketToUser = new Map();
    // consultationId -> Set<userId>
    this.consultationRooms = new Map();
    // typingState: room -> Map<userId, { name, timer }>
    this.typingIndicators = new Map();
    // Missed events buffer for connection recovery: userId -> Array<{ id, event, payload, timestamp }>
    this.eventBuffer = new Map();
    this.maxBufferedEvents = 50;
  }

  registerConnection(socketId, user) {
    const userId = (user.id || user._id).toString();
    this.socketToUser.set(socketId, userId);

    const existing = this.users.get(userId) || {};
    this.users.set(userId, {
      ...existing,
      userId,
      socketId,
      name: user.name || 'Anonymous',
      role: user.role || 'patient',
      status: user.role === 'doctor' ? 'AVAILABLE' : 'ONLINE',
      lastHeartbeat: Date.now(),
      connectedAt: existing.connectedAt || new Date(),
    });

    return this.users.get(userId);
  }

  removeConnection(socketId) {
    const userId = this.socketToUser.get(socketId);
    if (!userId) return null;

    this.socketToUser.delete(socketId);
    const userState = this.users.get(userId);

    if (userState && userState.socketId === socketId) {
      userState.status = 'OFFLINE';
      userState.disconnectedAt = new Date();
      // Remove from any active consultation rooms
      for (const [roomId, members] of this.consultationRooms.entries()) {
        members.delete(userId);
      }
    }

    return userState;
  }

  updateStatus(userId, status, metadata = {}) {
    const state = this.users.get(userId.toString());
    if (state) {
      state.status = status;
      state.metadata = { ...state.metadata, ...metadata };
      state.lastHeartbeat = Date.now();
      return state;
    }
    return null;
  }

  heartbeat(userId) {
    const state = this.users.get(userId.toString());
    if (state) {
      state.lastHeartbeat = Date.now();
      return true;
    }
    return false;
  }

  getOnlineDoctors() {
    const doctors = [];
    for (const u of this.users.values()) {
      if (u.role === 'doctor' && u.status !== 'OFFLINE') {
        doctors.push(u);
      }
    }
    return doctors;
  }

  getOnlinePatients() {
    const patients = [];
    for (const u of this.users.values()) {
      if (u.role === 'patient' && u.status !== 'OFFLINE') {
        patients.push(u);
      }
    }
    return patients;
  }

  joinConsultation(consultationId, userId) {
    if (!this.consultationRooms.has(consultationId)) {
      this.consultationRooms.set(consultationId, new Set());
    }
    this.consultationRooms.get(consultationId).add(userId.toString());
    return Array.from(this.consultationRooms.get(consultationId));
  }

  leaveConsultation(consultationId, userId) {
    if (this.consultationRooms.has(consultationId)) {
      this.consultationRooms.get(consultationId).delete(userId.toString());
      return Array.from(this.consultationRooms.get(consultationId));
    }
    return [];
  }

  bufferEventForUser(userId, event, payload) {
    const uid = userId.toString();
    if (!this.eventBuffer.has(uid)) {
      this.eventBuffer.set(uid, []);
    }
    const buffer = this.eventBuffer.get(uid);
    const eventItem = {
      id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      event,
      payload,
      timestamp: new Date().toISOString(),
    };
    buffer.push(eventItem);
    if (buffer.length > this.maxBufferedEvents) {
      buffer.shift();
    }
    return eventItem;
  }

  getMissedEvents(userId, lastEventId) {
    const buffer = this.eventBuffer.get(userId.toString()) || [];
    if (!lastEventId) return buffer;
    const index = buffer.findIndex((e) => e.id === lastEventId);
    if (index === -1) return buffer;
    return buffer.slice(index + 1);
  }

  clearMissedEvents(userId) {
    this.eventBuffer.delete(userId.toString());
  }
}

const presenceService = new PresenceService();

module.exports = {
  presenceService,
  PresenceService,
};
