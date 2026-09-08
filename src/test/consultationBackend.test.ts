import { describe, it, expect, vi } from 'vitest';

interface Prescription {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface ConsultationMockDoc {
  _id: string;
  patientId: string;
  doctorId: string; // doctor doc ID
  doctorUserId: string; // doctor's user ID
  appointmentId?: string | null;
  meetingRoomId: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  doctorNotes: string;
  prescription: Prescription[];
  startedAt?: Date | null;
  endedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

describe('F11 Telemedicine Consultation Backend Suite', () => {
  const consultationDb = new Map<string, ConsultationMockDoc>();
  const timelineEvents: Array<{ userId: string; eventType: string; title: string }> = [];
  const notifications: Array<{ userId: string; title: string }> = [];

  const patientId = 'user-patient-1';
  const otherPatientId = 'user-patient-2';
  const doctorDocId = 'doctor-profile-1';
  const doctorUserId = 'user-doctor-1';
  const unrelatedUserId = 'user-unrelated';

  const resetState = () => {
    consultationDb.clear();
    timelineEvents.length = 0;
    notifications.length = 0;
  };

  function scheduleConsultation(
    callerUserId: string,
    doctorId: string,
    doctorUser: string,
    appointmentId?: string
  ) {
    if (!callerUserId) return { status: 401, error: 'Unauthorized' };
    if (!doctorId) return { status: 400, error: 'doctorId is required' };

    const consultationId = `consult-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const meetingRoomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const newConsultation: ConsultationMockDoc = {
      _id: consultationId,
      patientId: callerUserId,
      doctorId,
      doctorUserId: doctorUser,
      appointmentId: appointmentId || null,
      meetingRoomId,
      status: 'scheduled',
      doctorNotes: '',
      prescription: [],
      startedAt: null,
      endedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    consultationDb.set(consultationId, newConsultation);

    // Notifications
    notifications.push({ userId: doctorUser, title: 'New Consultation Request' });
    notifications.push({ userId: callerUserId, title: 'Consultation Scheduled' });

    return { status: 201, data: newConsultation };
  }

  function getConsultation(callerUserId: string, consultationId: string) {
    if (!callerUserId) return { status: 401, error: 'Unauthorized' };
    const consult = consultationDb.get(consultationId);
    if (!consult) return { status: 404, error: 'Consultation not found' };

    // IDOR Check: Caller must be patient or doctor
    const isParticipant =
      consult.patientId === callerUserId || consult.doctorUserId === callerUserId;
    if (!isParticipant) {
      return { status: 403, error: 'Unauthorized: You are not a participant' };
    }

    return { status: 200, data: consult };
  }

  function startConsultation(callerUserId: string, consultationId: string) {
    const consultRes = getConsultation(callerUserId, consultationId);
    if (consultRes.status !== 200) return consultRes;

    const consult = consultRes.data!;
    consult.status = 'active';
    consult.startedAt = new Date();
    consult.updatedAt = new Date();

    // Timeline event
    timelineEvents.push({
      userId: consult.patientId,
      eventType: 'appointment',
      title: 'Doctor consultation started',
    });

    // Notification
    notifications.push({
      userId: consult.patientId,
      title: 'Consultation Started',
    });

    return { status: 200, data: consult };
  }

  function endConsultation(callerUserId: string, consultationId: string) {
    const consultRes = getConsultation(callerUserId, consultationId);
    if (consultRes.status !== 200) return consultRes;

    const consult = consultRes.data!;
    consult.status = 'completed';
    consult.endedAt = new Date();
    consult.updatedAt = new Date();

    // Timeline event
    timelineEvents.push({
      userId: consult.patientId,
      eventType: 'appointment',
      title: 'Doctor consultation completed',
    });

    notifications.push({
      userId: consult.patientId,
      title: 'Consultation Completed',
    });

    return { status: 200, data: consult };
  }

  function addNotes(
    callerUserId: string,
    consultationId: string,
    doctorNotes: string,
    prescription: Prescription[]
  ) {
    if (!callerUserId) return { status: 401, error: 'Unauthorized' };
    const consult = consultationDb.get(consultationId);
    if (!consult) return { status: 404, error: 'Consultation not found' };

    // Only doctor can add notes
    if (consult.doctorUserId !== callerUserId) {
      return { status: 403, error: 'Only the consulting doctor can attach clinical notes' };
    }

    consult.doctorNotes = doctorNotes;
    consult.prescription = prescription;
    consult.updatedAt = new Date();

    notifications.push({
      userId: consult.patientId,
      title: 'Doctor Notes & Prescription Added',
    });

    return { status: 200, data: consult };
  }

  it('1. Schedules consultation with unique meetingRoomId and sends initial notifications', () => {
    resetState();
    const res = scheduleConsultation(patientId, doctorDocId, doctorUserId);

    expect(res.status).toBe(201);
    expect(res.data?.status).toBe('scheduled');
    expect(res.data?.meetingRoomId).toMatch(/^room-/);

    // Verify notifications for both patient and doctor
    expect(notifications.some((n) => n.userId === doctorUserId && n.title === 'New Consultation Request')).toBe(true);
    expect(notifications.some((n) => n.userId === patientId && n.title === 'Consultation Scheduled')).toBe(true);
  });

  it('2. IDOR Protection: Blocks unauthorized third parties from viewing consultation', () => {
    const scheduled = scheduleConsultation(patientId, doctorDocId, doctorUserId);
    const consultId = scheduled.data!._id;

    // Participant patient can view
    const patientView = getConsultation(patientId, consultId);
    expect(patientView.status).toBe(200);

    // Participant doctor can view
    const doctorView = getConsultation(doctorUserId, consultId);
    expect(doctorView.status).toBe(200);

    // Unrelated user is blocked
    const intruderView = getConsultation(unrelatedUserId, consultId);
    expect(intruderView.status).toBe(403);
    expect(intruderView.error).toMatch(/Unauthorized/i);
  });

  it('3. Starts consultation: transitions to active and triggers timeline event', () => {
    const scheduled = scheduleConsultation(patientId, doctorDocId, doctorUserId);
    const consultId = scheduled.data!._id;

    const startRes = startConsultation(doctorUserId, consultId);
    expect(startRes.status).toBe(200);
    expect(startRes.data?.status).toBe('active');
    expect(startRes.data?.startedAt).toBeDefined();

    // Verify timeline event
    const startTimeline = timelineEvents.find((e) => e.title === 'Doctor consultation started');
    expect(startTimeline).toBeDefined();
    expect(startTimeline?.userId).toBe(patientId);
  });

  it('4. Ends consultation: transitions to completed and records completion timeline event', () => {
    const scheduled = scheduleConsultation(patientId, doctorDocId, doctorUserId);
    const consultId = scheduled.data!._id;
    startConsultation(doctorUserId, consultId);

    const endRes = endConsultation(doctorUserId, consultId);
    expect(endRes.status).toBe(200);
    expect(endRes.data?.status).toBe('completed');
    expect(endRes.data?.endedAt).toBeDefined();

    // Verify timeline completion
    const endTimeline = timelineEvents.find((e) => e.title === 'Doctor consultation completed');
    expect(endTimeline).toBeDefined();
    expect(endTimeline?.userId).toBe(patientId);
  });

  it('5. Attaches doctor notes and prescriptions with strict doctor authorization', () => {
    const scheduled = scheduleConsultation(patientId, doctorDocId, doctorUserId);
    const consultId = scheduled.data!._id;

    // Patient cannot attach doctor notes
    const patientAttempt = addNotes(patientId, consultId, 'Self notes', []);
    expect(patientAttempt.status).toBe(403);
    expect(patientAttempt.error).toMatch(/Only the consulting doctor/i);

    // Doctor successfully attaches notes and prescription
    const doctorNotesRes = addNotes(
      doctorUserId,
      consultId,
      'Patient exhibits mild systolic elevation. Recommend lifestyle modifications.',
      [
        {
          medicineName: 'Amlodipine',
          dosage: '5mg',
          frequency: 'Once Daily',
          duration: '30 days',
          instructions: 'Take in the morning with water',
        },
      ]
    );

    expect(doctorNotesRes.status).toBe(200);
    expect(doctorNotesRes.data?.doctorNotes).toContain('systolic elevation');
    expect(doctorNotesRes.data?.prescription.length).toBe(1);
    expect(doctorNotesRes.data?.prescription[0].medicineName).toBe('Amlodipine');
  });
});
