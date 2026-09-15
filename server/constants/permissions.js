/**
 * HealthSphere Role-Based Access Control (RBAC) Permissions Matrix
 */

const PERMISSIONS = {
  // Patient Permissions
  READ_OWN_RECORDS: 'record:read:own',
  WRITE_OWN_RECORDS: 'record:write:own',
  SHARE_RECORDS: 'record:share',
  EXPORT_HEALTH_DATA: 'data:export',
  MANAGE_OWN_SESSIONS: 'security:sessions:own',

  // Clinical / Doctor Permissions
  READ_PATIENT_RECORDS: 'patient:read',
  WRITE_PATIENT_RECORDS: 'patient:write',
  PRESCRIBE_MEDICATION: 'medication:prescribe',
  INITIATE_CONSULTATION: 'consultation:initiate',
  SIGN_MEDICAL_REPORT: 'report:sign',

  // Emergency Responders
  EMERGENCY_BREAK_GLASS: 'emergency:break_glass',
  ACCESS_EMERGENCY_VITALS: 'vitals:emergency_read',

  // System & Compliance Admin
  VIEW_AUDIT_LOGS: 'audit:view',
  MANAGE_USERS: 'users:manage',
  MANAGE_SECURITY_POLICIES: 'security:policies:manage',
  REVOKE_ALL_SESSIONS: 'security:sessions:global_revoke',
};

const ROLE_PERMISSIONS = {
  patient: [
    PERMISSIONS.READ_OWN_RECORDS,
    PERMISSIONS.WRITE_OWN_RECORDS,
    PERMISSIONS.SHARE_RECORDS,
    PERMISSIONS.EXPORT_HEALTH_DATA,
    PERMISSIONS.MANAGE_OWN_SESSIONS,
  ],
  doctor: [
    PERMISSIONS.READ_OWN_RECORDS,
    PERMISSIONS.WRITE_OWN_RECORDS,
    PERMISSIONS.READ_PATIENT_RECORDS,
    PERMISSIONS.WRITE_PATIENT_RECORDS,
    PERMISSIONS.PRESCRIBE_MEDICATION,
    PERMISSIONS.INITIATE_CONSULTATION,
    PERMISSIONS.SIGN_MEDICAL_REPORT,
    PERMISSIONS.EMERGENCY_BREAK_GLASS,
    PERMISSIONS.MANAGE_OWN_SESSIONS,
  ],
  nurse: [
    PERMISSIONS.READ_PATIENT_RECORDS,
    PERMISSIONS.WRITE_PATIENT_RECORDS,
    PERMISSIONS.ACCESS_EMERGENCY_VITALS,
    PERMISSIONS.MANAGE_OWN_SESSIONS,
  ],
  paramedic: [
    PERMISSIONS.EMERGENCY_BREAK_GLASS,
    PERMISSIONS.ACCESS_EMERGENCY_VITALS,
    PERMISSIONS.READ_PATIENT_RECORDS,
    PERMISSIONS.MANAGE_OWN_SESSIONS,
  ],
  admin: Object.values(PERMISSIONS),
};

function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const userPerms = ROLE_PERMISSIONS[role] || [];
  return userPerms.includes(permission);
}

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
};
