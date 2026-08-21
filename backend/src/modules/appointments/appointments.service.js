const prisma = require('../../config/db');
const { generatePreVisitSummary } = require('../../services/llm');
const { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = require('../../services/calendar');

async function holdSlot(patientId, doctorId, startsAtIso) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId }
  });

  if (!doctor || !doctor.isActive || doctor.approvalStatus !== 'APPROVED') {
    const err = new Error('Doctor unavailable');
    err.statusCode = 404;
    throw err;
  }

  const startsAt = new Date(startsAtIso);

  if (isNaN(startsAt.getTime())) {
    const err = new Error('Invalid date format for startsAt');
    err.statusCode = 400;
    throw err;
  }

  if (startsAt.getTime() <= Date.now()) {
    const err = new Error('Cannot book a slot in the past');
    err.statusCode = 400;
    throw err;
  }

  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  if (startsAt.getTime() > thirtyDaysFromNow.getTime()) {
    const err = new Error('Cannot book more than 30 days in advance');
    err.statusCode = 400;
    throw err;
  }

  const endsAt = new Date(startsAt.getTime() + doctor.slotDuration * 60 * 1000);
  const holdExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.appointment.findFirst({
      where: {
        doctorId,
        startsAt,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          { status: 'CONFIRMED' },
          { holdExpiresAt: { gt: new Date() } }
        ]
      }
    });

    if (existing) {
      const err = new Error('This slot is no longer available');
      err.statusCode = 409;
      throw err;
    }

    const activeHolds = await tx.appointment.count({
      where: {
        patientId,
        status: 'PENDING',
        holdExpiresAt: { gt: new Date() }
      }
    });

    if (activeHolds >= 3) {
      const err = new Error('You already have 3 active holds. Please confirm or let them expire');
      err.statusCode = 429;
      throw err;
    }

    const appointment = await tx.appointment.create({
      data: {
        patientId,
        doctorId,
        startsAt,
        endsAt,
        status: 'PENDING',
        holdExpiresAt
      }
    });

    return { holdToken: appointment.id, expiresAt: holdExpiresAt };
  });
}

async function confirmBooking(patientId, holdToken, symptoms) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: holdToken },
    include: {
      patient: true,
      doctor: { include: { user: true } }
    }
  });

  if (!appointment || appointment.patientId !== patientId) {
    const err = new Error('Invalid or expired hold token');
    err.statusCode = 400;
    throw err;
  }

  if (appointment.status !== 'PENDING' || !appointment.holdExpiresAt || appointment.holdExpiresAt.getTime() < Date.now()) {
    const err = new Error('Hold has expired. Please select a slot again');
    err.statusCode = 409;
    throw err;
  }

  const confirmed = await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.update({
      where: { id: holdToken },
      data: {
        status: 'CONFIRMED',
        holdExpiresAt: null
      }
    });

    const symptomForm = await tx.symptomForm.create({
      data: {
        appointmentId: appt.id,
        rawSymptoms: symptoms,
        llmStatus: 'PENDING'
      }
    });

    await tx.notification.create({
      data: {
        userId: appointment.patientId,
        type: 'BOOKING_CONFIRM',
        payload: {
          patientName: appointment.patient.name,
          doctorName: appointment.doctor.user.name,
          specialisation: appointment.doctor.specialisation,
          startsAt: appointment.startsAt,
          endsAt: appointment.endsAt
        }
      }
    });

    return { appointment: appt, symptomForm };
  });

  setImmediate(async () => {
    try {
      const llmRes = await generatePreVisitSummary(symptoms);
      await prisma.symptomForm.update({
        where: { appointmentId: holdToken },
        data: {
          urgency: llmRes.data?.urgency || 'Medium',
          chiefComplaint: llmRes.data?.chiefComplaint || '',
          suggestedQs: llmRes.data?.suggestedQuestions || [],
          llmRawOutput: llmRes.raw,
          llmStatus: llmRes.status
        }
      });

      const eventData = {
        summary: `Medical Appointment: Dr. ${appointment.doctor.user.name}`,
        description: `Doctor: Dr. ${appointment.doctor.user.name}\nSpecialisation: ${appointment.doctor.specialisation}\nSymptoms: ${symptoms}`,
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt
      };

      if (appointment.patient.gcalTokens) {
        const pEventId = await createCalendarEvent(appointment.patient.gcalTokens, eventData);
        if (pEventId) {
          await prisma.appointment.update({
            where: { id: holdToken },
            data: { gcalEventId: pEventId }
          });
        }
      }

      if (appointment.doctor.user.gcalTokens) {
        const dEventId = await createCalendarEvent(appointment.doctor.user.gcalTokens, {
          ...eventData,
          summary: `Patient Visit: ${appointment.patient.name}`
        });
        if (dEventId) {
          await prisma.appointment.update({
            where: { id: holdToken },
            data: { gcalDoctorEventId: dEventId }
          });
        }
      }
    } catch (bgErr) {
      console.error('Post-confirmation async job error:', bgErr.message);
    }
  });

  return confirmed;
}

async function getPatientAppointments(patientId) {
  return prisma.appointment.findMany({
    where: { patientId },
    include: {
      doctor: {
        include: {
          user: { select: { name: true, email: true, phone: true } }
        }
      },
      symptomForm: true,
      visitNote: true
    },
    orderBy: { startsAt: 'desc' }
  });
}

async function getAppointmentDetail(user, appointmentId) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { id: true, name: true, email: true, phone: true } },
      doctor: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } }
        }
      },
      symptomForm: true,
      visitNote: true
    }
  });

  if (!appt) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.role === 'PATIENT' && appt.patientId !== user.userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  if (user.role === 'DOCTOR' && appt.doctor.userId !== user.userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  return appt;
}

async function rescheduleAppointment(user, appointmentId, newStartsAtIso) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      doctor: { include: { user: true } }
    }
  });

  if (!appt) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  if (appt.status !== 'CONFIRMED') {
    const err = new Error('Only confirmed appointments can be rescheduled');
    err.statusCode = 400;
    throw err;
  }

  if (user.role === 'PATIENT' && appt.patientId !== user.userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  const newStartsAt = new Date(newStartsAtIso);

  if (isNaN(newStartsAt.getTime())) {
    const err = new Error('Invalid date format');
    err.statusCode = 400;
    throw err;
  }

  if (newStartsAt.getTime() <= Date.now()) {
    const err = new Error('Cannot reschedule to a past time');
    err.statusCode = 400;
    throw err;
  }

  const newEndsAt = new Date(newStartsAt.getTime() + appt.doctor.slotDuration * 60 * 1000);

  const updated = await prisma.$transaction(async (tx) => {
    const conflict = await tx.appointment.findFirst({
      where: {
        doctorId: appt.doctorId,
        startsAt: newStartsAt,
        status: { in: ['CONFIRMED', 'PENDING'] },
        id: { not: appointmentId }
      }
    });

    if (conflict) {
      const err = new Error('The selected new slot is not available');
      err.statusCode = 409;
      throw err;
    }

    return tx.appointment.update({
      where: { id: appointmentId },
      data: {
        startsAt: newStartsAt,
        endsAt: newEndsAt,
        status: 'CONFIRMED'
      }
    });
  });

  if (appt.gcalEventId && appt.patient.gcalTokens) {
    await updateCalendarEvent(appt.patient.gcalTokens, appt.gcalEventId, {
      summary: `Medical Appointment: Dr. ${appt.doctor.user.name}`,
      description: `Rescheduled appointment`,
      startsAt: newStartsAt,
      endsAt: newEndsAt
    });
  }

  if (appt.gcalDoctorEventId && appt.doctor.user.gcalTokens) {
    await updateCalendarEvent(appt.doctor.user.gcalTokens, appt.gcalDoctorEventId, {
      summary: `Patient Visit: ${appt.patient.name}`,
      description: `Rescheduled appointment`,
      startsAt: newStartsAt,
      endsAt: newEndsAt
    });
  }

  return updated;
}

async function cancelAppointment(user, appointmentId, reason) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      doctor: { include: { user: true } }
    }
  });

  if (!appt) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  if (appt.status === 'CANCELLED') {
    const err = new Error('Appointment is already cancelled');
    err.statusCode = 400;
    throw err;
  }

  if (appt.status === 'COMPLETED') {
    const err = new Error('Completed appointments cannot be cancelled');
    err.statusCode = 400;
    throw err;
  }

  if (user.role === 'PATIENT' && appt.patientId !== user.userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  const cancelled = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' }
  });

  await prisma.notification.create({
    data: {
      userId: appt.patientId,
      type: 'CANCELLATION',
      payload: {
        patientName: appt.patient.name,
        doctorName: appt.doctor.user.name,
        startsAt: appt.startsAt,
        reason: reason || 'Cancelled by user'
      }
    }
  });

  if (appt.gcalEventId && appt.patient.gcalTokens) {
    await deleteCalendarEvent(appt.patient.gcalTokens, appt.gcalEventId);
  }
  if (appt.gcalDoctorEventId && appt.doctor.user.gcalTokens) {
    await deleteCalendarEvent(appt.doctor.user.gcalTokens, appt.gcalDoctorEventId);
  }

  return cancelled;
}

async function completeAppointment(doctorUserId, appointmentId) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true }
  });

  if (!appt || appt.doctor.userId !== doctorUserId) {
    const err = new Error('Appointment not found or unauthorized');
    err.statusCode = 403;
    throw err;
  }

  if (appt.status !== 'CONFIRMED') {
    const err = new Error('Only confirmed appointments can be marked as completed');
    err.statusCode = 400;
    throw err;
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'COMPLETED' }
  });
}

module.exports = {
  holdSlot,
  confirmBooking,
  getPatientAppointments,
  getAppointmentDetail,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment
};
