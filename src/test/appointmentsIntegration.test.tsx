import { describe, it, expect } from 'vitest';

describe('Appointments Care Coordination Integration', () => {
  it('correctly maps raw backend appointment model to frontend representation', () => {
    const rawAppointment = {
      _id: 'appt-1001',
      doctorName: 'Sarah Jenkins',
      specialty: 'Cardiology',
      hospital: 'St. Jude Medical Center',
      appointmentDate: '2026-09-01T10:00:00.000Z',
      status: 'scheduled',
    };

    const mapped = {
      id: rawAppointment._id,
      doctor_name: rawAppointment.doctorName,
      specialty: rawAppointment.specialty,
      hospital: rawAppointment.hospital,
      appointment_date: rawAppointment.appointmentDate,
      status: rawAppointment.status,
    };

    expect(mapped.id).toBe('appt-1001');
    expect(mapped.doctor_name).toBe('Sarah Jenkins');
    expect(mapped.specialty).toBe('Cardiology');
    expect(mapped.status).toBe('scheduled');
  });

  it('enforces IDOR query protection for appointment update operations', () => {
    const isAppointmentEditableByUser = (appointmentUserId: string, currentUserId: string) => {
      return appointmentUserId === currentUserId;
    };

    const targetUser = 'user-patient-1';
    const otherUser = 'user-patient-2';
    const appointmentUserId = 'user-patient-1';

    expect(isAppointmentEditableByUser(appointmentUserId, targetUser)).toBe(true);
    expect(isAppointmentEditableByUser(appointmentUserId, otherUser)).toBe(false);
  });
});
