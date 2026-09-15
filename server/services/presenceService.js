/**
 * HealthSphere Real-Time Presence & Connection Lifecycle System
 * Tracks Doctor & Patient online statuses, consultation room presence,
 * heartbeat liveness, automatic stale session cleanup, and missed event replay.
 */

const logger = require('../utils/logger');

class PresenceService {
  constructor() {
    // Map: userId -> { userId, role, status, sockets: Set<socketId>, socketId, lastSeen, lastHeartbeat, connectedAt, metadata: {} }
    this.users = new Map();
    // Map: socketId -> userId
    this.socketToUser = new Map();
    // Map: roomName -> Set<userId>
    this.rooms = new Map();
    // Map: consultationId -> Set<userId>
    this.consultationRooms = new Map();
    // Map: room -> Map<userId, { name, timer }>
    this.typingIndicators = new Map();
    // Missed events buffer for connection recovery: userId -> Array<{ id, event, payload, timestamp }>
    this.eventBuffer = new Map();
    this.maxBufferedEvents = 50;
    // Heartbeat timeout threshold (45 seconds)
    this.HEARTBEAT_TIMEOUT_MS = 45000;
  }

  /**
   * Registers a user connection (HEAD style)
   */
  setUserOnline(userId, role = 'patient', socketId, metadata = {}) {
    if (!userId || !socketId) return null;

    const id = String(userId);
    this.socketToUser.set(socketId, id);

    if (!this.users.has(id)) {
      this.users.set(id, {
        userId: id,
        id,
        role,
        status: 'available',
        sockets: new Set([socketId]),
        socketId,
        lastSeen: Date.now(),
        lastHeartbeat: Date.now(),
        connectedAt: new Date(),
        metadata,
      });
      if (logger && typeof logger.info === 'function') {
        logger.info(`User came online: [${role}] ${id}`);
      }
    } else {
      const entry = this.users.get(id);
      entry.sockets.add(socketId);
      entry.socketId = socketId;
      entry.lastSeen = Date.now();
      entry.lastHeartbeat = Date.now();
      entry.metadata = { ...entry.metadata, ...metadata };
    }

    return this.getUserPresence(id);
  }

  /**
   * Registers a user connection (origin/main style)
   */
  registerConnection(socketId, user) {
    const userId = (user.id || user._id || user.userId).toString();
    this.socketToUser.set(socketId, userId);

    const existing = this.users.get(userId) || {};
    const sockets = existing.sockets || new Set();
    sockets.add(socketId);

    const state = {
      ...existing,
      userId,
      id: userId,
      socketId,
      sockets,
      name: user.name || 'Anonymous',
      role: user.role || 'patient',
      status: user.role === 'doctor' ? 'AVAILABLE' : 'ONLINE',
      lastSeen: Date.now(),
      lastHeartbeat: Date.now(),
      connectedAt: existing.connectedAt || new Date(),
      metadata: existing.metadata || {},
    };

    this.users.set(userId, state);
    return state;
  }

  /**
   * Removes a socket connection; marks offline if no active sockets remain
   */
  setUserOffline(socketId) {
    const userId = this.socketToUser.get(socketId);
    if (!userId) return null;

    this.socketToUser.delete(socketId);
    const entry = this.users.get(userId);

    if (entry) {
      if (entry.sockets) {
        entry.sockets.delete(socketId);
      }

      // Clean up rooms for this socket
      for (const [room, participants] of this.rooms.entries()) {
        if (participants.has(userId) && (!entry.sockets || entry.sockets.size === 0)) {
          participants.delete(userId);
          if (participants.size === 0) {
            this.rooms.delete(room);
          }
        }
      }

      for (const [roomId, members] of this.consultationRooms.entries()) {
        if (!entry.sockets || entry.sockets.size === 0) {
          members.delete(userId);
        }
      }

      if (!entry.sockets || entry.sockets.size === 0) {
        entry.status = 'OFFLINE';
        entry.disconnectedAt = new Date();
        this.users.delete(userId);
        if (logger && typeof logger.info === 'function') {
          logger.info(`User went offline: [${entry.role}] ${userId}`);
        }
        return { userId, role: entry.role, online: false, status: 'offline' };
      }
      return { userId, role: entry.role, online: true, status: entry.status };
    }

    return { userId, role: 'user', online: false };
  }

  /**
   * Removes connection (origin/main alias)
   */
  removeConnection(socketId) {
    const userId = this.socketToUser.get(socketId);
    if (!userId) return null;

    const userState = this.users.get(userId);
    if (userState && userState.socketId === socketId) {
      userState.status = 'OFFLINE';
      userState.disconnectedAt = new Date();
      for (const members of this.consultationRooms.values()) {
        members.delete(userId);
      }
    }
    this.setUserOffline(socketId);
    return userState || { status: 'OFFLINE' };
  }

  /**
   * Record client heartbeat
   */
  recordHeartbeat(socketId) {
    const userId = this.socketToUser.get(socketId);
    if (!userId) return false;

    const entry = this.users.get(userId);
    if (entry) {
      entry.lastSeen = Date.now();
      entry.lastHeartbeat = Date.now();
      return true;
    }
    return false;
  }

  heartbeat(userId) {
    const state = this.users.get(userId.toString());
    if (state) {
      state.lastSeen = Date.now();
      state.lastHeartbeat = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Update clinical doctor status (available, busy, in_consultation)
   */
  setDoctorStatus(doctorId, status) {
    const id = String(doctorId);
    const entry = this.users.get(id);
    if (entry && entry.role === 'doctor') {
      entry.status = status;
      entry.lastSeen = Date.now();
      entry.lastHeartbeat = Date.now();
      return entry;
    }
    return null;
  }

  updateStatus(userId, status, metadata = {}) {
    const state = this.users.get(userId.toString());
    if (state) {
      state.status = status;
      state.metadata = { ...state.metadata, ...metadata };
      state.lastSeen = Date.now();
      state.lastHeartbeat = Date.now();
      return state;
    }
    return null;
  }

  isUserOnline(userId) {
    const entry = this.users.get(String(userId));
    if (!entry) return false;
    return entry.status !== 'OFFLINE' && entry.status !== 'offline';
  }

  getUserPresence(userId) {
    const entry = this.users.get(String(userId));
    if (!entry) {
      return { userId: String(userId), online: false, status: 'offline' };
    }
    return {
      userId: entry.userId,
      role: entry.role,
      online: entry.status !== 'OFFLINE' && entry.status !== 'offline',
      status: entry.status,
      lastSeen: entry.lastSeen,
      activeConnections: entry.sockets ? entry.sockets.size : 1,
      metadata: entry.metadata,
    };
  }

  getOnlineDoctors() {
    const doctors = [];
    for (const u of this.users.values()) {
      if (u.role === 'doctor' && u.status !== 'OFFLINE' && u.status !== 'offline') {
        doctors.push({
          ...u,
          doctorId: u.userId,
          userId: u.userId,
          status: u.status,
          online: true,
          metadata: u.metadata || {},
        });
      }
    }
    return doctors;
  }

  getOnlinePatients() {
    const patients = [];
    for (const u of this.users.values()) {
      if (u.role === 'patient' && u.status !== 'OFFLINE' && u.status !== 'offline') {
        patients.push({
          ...u,
          patientId: u.userId,
          userId: u.userId,
          status: u.status,
          online: true,
          metadata: u.metadata || {},
        });
      }
    }
    return patients;
  }

  joinRoom(roomName, userId) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName).add(String(userId));
    return Array.from(this.rooms.get(roomName));
  }

  leaveRoom(roomName, userId) {
    if (this.rooms.has(roomName)) {
      const set = this.rooms.get(roomName);
      set.delete(String(userId));
      if (set.size === 0) {
        this.rooms.delete(roomName);
      }
      return set.size;
    }
    return 0;
  }

  getRoomParticipants(roomName) {
    if (!this.rooms.has(roomName)) return [];
    return Array.from(this.rooms.get(roomName));
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

  sweepStaleSessions() {
    const now = Date.now();
    const staleUsers = [];

    for (const [userId, entry] of this.users.entries()) {
      const timeSinceLastSeen = now - (entry.lastSeen || entry.lastHeartbeat || now);
      if (timeSinceLastSeen > this.HEARTBEAT_TIMEOUT_MS) {
        staleUsers.push(userId);
      }
    }

    staleUsers.forEach((userId) => {
      const entry = this.users.get(userId);
      if (entry) {
        if (entry.sockets) {
          entry.sockets.forEach((sId) => this.socketToUser.delete(sId));
        }
        if (entry.socketId) {
          this.socketToUser.delete(entry.socketId);
        }
        this.users.delete(userId);
        if (logger && typeof logger.info === 'function') {
          logger.info(`Swept stale presence session: ${userId}`);
        }
      }
    });

    return staleUsers.length;
  }

  reset() {
    this.users.clear();
    this.socketToUser.clear();
    this.rooms.clear();
    this.consultationRooms.clear();
    this.typingIndicators.clear();
    this.eventBuffer.clear();
  }
}

const presenceService = new PresenceService();

module.exports = presenceService;
module.exports.presenceService = presenceService;
module.exports.PresenceService = PresenceService;
