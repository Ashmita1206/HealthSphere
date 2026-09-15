/**
 * HealthSphere Real-Time Collaboration Service
 * - Doctor & Staff Presence Tracker
 * - Concurrent Patient Chart Field Lock Manager
 * - Optimistic Concurrency & Conflict Detection
 */

const logger = require('../utils/logger');

// In-memory presence map: userId -> { userId, name, role, department, status, lastSeen, socketIds: Set }
const presenceRegistry = new Map();

// In-memory distributed chart locks: lockKey ("patientId:field") -> { patientId, field, lockedBy, lockedByName, userRole, lockedAt, expiresAt }
const chartLocksRegistry = new Map();

const LOCK_TTL_MS = 3 * 60 * 1000; // 3 minutes auto-expiry for chart field locks

/**
 * Register or update staff presence
 */
function setStaffPresence(userId, data = {}) {
  const current = presenceRegistry.get(userId) || {
    userId,
    name: data.name || 'Medical Specialist',
    role: data.role || 'doctor',
    department: data.department || 'Emergency Medicine',
    socketIds: new Set(),
  };

  const updated = {
    ...current,
    ...data,
    status: data.status || current.status || 'available',
    lastSeen: new Date(),
    socketIds: current.socketIds,
  };

  if (data.socketId) {
    updated.socketIds.add(data.socketId);
  }

  presenceRegistry.set(userId, updated);
  return serializePresence(updated);
}

/**
 * Remove socket from presence and update status if no sockets remain
 */
function removeStaffSocket(userId, socketId) {
  const presence = presenceRegistry.get(userId);
  if (!presence) return null;

  presence.socketIds.delete(socketId);
  if (presence.socketIds.size === 0) {
    presence.status = 'offline';
    presence.lastSeen = new Date();
  }
  return serializePresence(presence);
}

/**
 * Get list of active staff presence
 */
function getAllStaffPresence() {
  const list = [];
  const now = Date.now();

  for (const [userId, record] of presenceRegistry.entries()) {
    // If not seen in 15 minutes, mark offline
    if (now - new Date(record.lastSeen).getTime() > 15 * 60 * 1000) {
      record.status = 'offline';
    }
    list.push(serializePresence(record));
  }

  return list;
}

function serializePresence(record) {
  return {
    userId: record.userId,
    name: record.name,
    role: record.role,
    department: record.department,
    status: record.status,
    lastSeen: record.lastSeen,
    activeConnections: record.socketIds ? record.socketIds.size : 0,
  };
}

/**
 * Acquire field lock on a patient chart
 */
function acquireChartLock(patientId, field, user) {
  cleanExpiredLocks();
  const lockKey = `${patientId}:${field}`;
  const now = new Date();
  const existing = chartLocksRegistry.get(lockKey);

  if (existing) {
    // Check if current user already owns it
    if (existing.lockedBy === user.id || existing.lockedBy === user._id?.toString()) {
      // Renew lease
      existing.expiresAt = new Date(now.getTime() + LOCK_TTL_MS);
      return { success: true, acquired: true, lock: existing, renewed: true };
    }

    // Someone else has active lock
    if (new Date(existing.expiresAt).getTime() > now.getTime()) {
      return {
        success: false,
        acquired: false,
        message: `Field '${field}' is currently being edited by ${existing.lockedByName} (${existing.userRole})`,
        lock: existing,
      };
    }
  }

  const newLock = {
    patientId,
    field,
    lockedBy: user.id || user._id?.toString(),
    lockedByName: user.name || user.email || 'Healthcare Provider',
    userRole: user.role || 'doctor',
    lockedAt: now,
    expiresAt: new Date(now.getTime() + LOCK_TTL_MS),
  };

  chartLocksRegistry.set(lockKey, newLock);
  logger.info(`Chart lock acquired for [${lockKey}] by ${newLock.lockedByName}`);

  return { success: true, acquired: true, lock: newLock };
}

/**
 * Release field lock
 */
function releaseChartLock(patientId, field, userId) {
  const lockKey = `${patientId}:${field}`;
  const existing = chartLocksRegistry.get(lockKey);

  if (!existing) {
    return { success: true, released: false, message: 'No active lock found' };
  }

  if (existing.lockedBy !== userId && existing.lockedBy !== userId.toString()) {
    return { success: false, message: 'Cannot release lock held by another clinician' };
  }

  chartLocksRegistry.delete(lockKey);
  logger.info(`Chart lock released for [${lockKey}] by user ${userId}`);
  return { success: true, released: true, lockKey };
}

/**
 * Get all active locks for a patient
 */
function getPatientLocks(patientId) {
  cleanExpiredLocks();
  const locks = [];
  for (const [key, lock] of chartLocksRegistry.entries()) {
    if (key.startsWith(`${patientId}:`)) {
      locks.push(lock);
    }
  }
  return locks;
}

/**
 * Clean expired locks
 */
function cleanExpiredLocks() {
  const now = Date.now();
  for (const [key, lock] of chartLocksRegistry.entries()) {
    if (new Date(lock.expiresAt).getTime() <= now) {
      chartLocksRegistry.delete(key);
    }
  }
}

/**
 * Detect optimistic concurrency conflicts
 */
function detectConflict(clientVersion, serverVersion, clientPayload, serverPayload) {
  if (clientVersion === serverVersion) {
    return { hasConflict: false };
  }

  return {
    hasConflict: true,
    clientVersion,
    serverVersion,
    message: `Version conflict: Your edits are based on version ${clientVersion}, but version ${serverVersion} is already committed by another care team member.`,
    resolutionOptions: ['overwrite', 'merge', 'reload'],
  };
}

module.exports = {
  setStaffPresence,
  removeStaffSocket,
  getAllStaffPresence,
  acquireChartLock,
  releaseChartLock,
  getPatientLocks,
  detectConflict,
};
