/**
 * HealthSphere Real-Time Presence & Connection Lifecycle System
 * Tracks Doctor & Patient online statuses, consultation room presence,
 * heartbeat liveness, and automatic stale session cleanup.
 */

const logger = require('../utils/logger');

class PresenceService {
  constructor() {
    // Map: userId -> { role, status, sockets: Set<socketId>, lastSeen: timestamp, metadata: {} }
    this.users = new Map();
    // Map: socketId -> userId
    this.socketToUser = new Map();
    // Map: roomName -> Set<userId>
    this.rooms = new Map();
    // Heartbeat timeout threshold (45 seconds)
    this.HEARTBEAT_TIMEOUT_MS = 45000;
  }

  /**
   * Registers a user connection
   */
  setUserOnline(userId, role = 'patient', socketId, metadata = {}) {
    if (!userId || !socketId) return;

    const id = String(userId);
    this.socketToUser.set(socketId, id);

    if (!this.users.has(id)) {
      this.users.set(id, {
        userId: id,
        role,
        status: 'available',
        sockets: new Set([socketId]),
        lastSeen: Date.now(),
        metadata,
      });
      logger.info(`User came online: [${role}] ${id}`);
    } else {
      const entry = this.users.get(id);
      entry.sockets.add(socketId);
      entry.lastSeen = Date.now();
      entry.metadata = { ...entry.metadata, ...metadata };
    }

    return this.getUserPresence(id);
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
      entry.sockets.delete(socketId);

      // Clean up rooms for this socket
      for (const [room, participants] of this.rooms.entries()) {
        if (participants.has(userId) && entry.sockets.size === 0) {
          participants.delete(userId);
          if (participants.size === 0) {
            this.rooms.delete(room);
          }
        }
      }

      if (entry.sockets.size === 0) {
        this.users.delete(userId);
        logger.info(`User went offline: [${entry.role}] ${userId}`);
        return { userId, role: entry.role, online: false };
      }
    }

    return { userId, role: entry ? entry.role : 'user', online: true };
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
      return entry;
    }
    return null;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.users.has(String(userId));
  }

  /**
   * Get user presence details
   */
  getUserPresence(userId) {
    const entry = this.users.get(String(userId));
    if (!entry) {
      return { userId: String(userId), online: false, status: 'offline' };
    }
    return {
      userId: entry.userId,
      role: entry.role,
      online: true,
      status: entry.status,
      lastSeen: entry.lastSeen,
      activeConnections: entry.sockets.size,
      metadata: entry.metadata,
    };
  }

  /**
   * Get all active doctors
   */
  getOnlineDoctors() {
    const doctors = [];
    for (const entry of this.users.values()) {
      if (entry.role === 'doctor') {
        doctors.push({
          doctorId: entry.userId,
          status: entry.status,
          online: true,
          metadata: entry.metadata,
        });
      }
    }
    return doctors;
  }

  /**
   * Get all active patients
   */
  getOnlinePatients() {
    const patients = [];
    for (const entry of this.users.values()) {
      if (entry.role === 'patient') {
        patients.push({
          patientId: entry.userId,
          online: true,
          metadata: entry.metadata,
        });
      }
    }
    return patients;
  }

  /**
   * Room management
   */
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

  /**
   * Periodic sweep for dead sessions with missed heartbeats
   */
  sweepStaleSessions() {
    const now = Date.now();
    const staleUsers = [];

    for (const [userId, entry] of this.users.entries()) {
      if (now - entry.lastSeen > this.HEARTBEAT_TIMEOUT_MS) {
        staleUsers.push(userId);
      }
    }

    staleUsers.forEach((userId) => {
      const entry = this.users.get(userId);
      if (entry) {
        entry.sockets.forEach((sId) => this.socketToUser.delete(sId));
        this.users.delete(userId);
        logger.info(`Swept stale presence session: ${userId}`);
      }
    });

    return staleUsers.length;
  }

  /**
   * Clear all for testing
   */
  reset() {
    this.users.clear();
    this.socketToUser.clear();
    this.rooms.clear();
  }
}

const presenceService = new PresenceService();

module.exports = presenceService;
