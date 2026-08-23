const prisma = require('../../config/db');
const { generatePreVisitSummary } = require('../../services/llm');
const { createCalendarEvent, deleteCalendarEvent } = require('../../services/calendar');

const HOLD_DURATION_MS = 10 * 60 * 1000;
const MAX_ACTIVE_HOLDS = 3;
const MAX_ADVANCE_DAYS = 30;

async function holdSlot(patientId, doctorId, startsAtIso) {
  const startsAt = new Date(startsAtIso);
  const now = new Date();

  if (isNaN(startsAt.getTime()) || startsAt <= now) {
    const err = new Error('Slot must be in the future');
    err.statusCode = 400;
    throw err;
  }

  const maxDate = new Date(now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);
  if (startsAt > maxDate) {
    const err = new Error(`Appointments can only be booked up to ${MAX_ADVANCE_DAYS} days in advance`);
    err.statusCode = 400;
    throw err;
  }

  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId }
  });

  if (!doctor || !doctor.isActive || doctor.approvalStatus !== 'APPROVED') {
    const err = new Error('Doctor not found or inactive');
    err.statusCode = 404;
    throw err;
  }

  const leaveDate = new Date(startsAt);
  leaveDate.setHours(0, 0, 0, 0);

  const leave = await prisma.leaveDay.findFirst({
    where: { doctorId, date: leaveDate }
  });

  if (leave) {
    const err = new Error('Doctor is on leave on this date');
    err.statusCode = 400;
    throw err;
  }

  const activeHolds = await prisma.appointment.count({
    where: {
      patientId,
      status: 'PENDING',
      holdExpiresAt: { gt: now }
    }
  });

  if (activeHolds >= MAX_ACTIVE_HOLDS) {
    const err = new Error(`You already have ${activeHolds} active slot holds. Please complete or let existing holds expire before reserving more.`);
    err.statusCode = 429;
    throw err;
  }

  const endsAt = new Date(startsAt.getTime() + doctor.slotDuration * 60 * 1000);
  const holdExpiresAt = new Date(now.getTime() + HOLD_DURATION_MS);

  const result = await prisma.$transaction(async (tx) => {
    const existingAppt = await tx.appointment.findFirst({
      where: {
        doctorId,
        startsAt
      }
    });

    if (existingAppt) {
      if (existingAppt.status === 'CONFIRMED') {
        const err = new Error('Slot already booked');
        err.statusCode = 409;
        throw err;
      }

      if (existingAppt.status === 'PENDING' && existingAppt.holdExpiresAt && new Date(existingAppt.holdExpiresAt) > now) {
        if (existingAppt.patientId === patientId) {
          return tx.appointment.update({
            where: { id: existingAppt.id },
            data: {
              holdExpiresAt,
              endsAt
            }
          });
        }
        const err = new Error('Slot currently reserved by another patient');
        err.statusCode = 409;
        throw err;
      }

      return tx.appointment.update({
        where: { id: existingAppt.id },
        data: {
          patientId,
          status: 'PENDING',
          holdExpiresAt,
          endsAt,
          chatStatus: 'NOT_STARTED',
          patientLastSeen: null,
          doctorLastSeen: null,
          gcalEventId: null,
          gcalDoctorEventId: null
        }
      });
    }

    return tx.appointment.create({
      data: {
        patientId,
        doctorId,
        startsAt,
        endsAt,
        status: 'PENDING',
        holdExpiresAt
      }
    });
  });

  return { holdToken: result.id, expiresAt: result.holdExpiresAt };
}

async function confirmBooking(patientId, holdToken, symptoms) {
  const now = new Date();

  const appointment = await prisma.appointment.findUnique({
    where: { id: holdToken },
    include: {
      patient: true,
      doctor: {
        include: { user: true }
      }
    }
  });

  if (!appointment || appointment.patientId !== patientId) {
    const err = new Error('Invalid hold token');
    err.statusCode = 404;
    throw err;
  }

  if (appointment.status !== 'PENDING') {
    const err = new Error('Slot reservation timer expired or was cancelled. Please select a time slot again.');
    err.statusCode = 410;
    throw err;
  }

  if (!appointment.holdExpiresAt || new Date(appointment.holdExpiresAt) < now) {
    const err = new Error('Slot reservation timer expired. Please select a time slot again.');
    err.statusCode = 410;
    throw err;
  }

  const confirmed = await prisma.appointment.update({
    where: { id: holdToken },
    data: {
      status: 'CONFIRMED',
      holdExpiresAt: null
    }
  });

  await prisma.notification.create({
    data: {
      userId: patientId,
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

  setImmediate(async () => {
    try {
      const llmRes = await generatePreVisitSummary(symptoms);
      await prisma.symptomForm.upsert({
        where: { appointmentId: holdToken },
        create: {
          appointmentId: holdToken,
          rawSymptoms: symptoms,
          urgency: llmRes.data?.urgency || 'Medium',
          chiefComplaint: llmRes.data?.chiefComplaint || '',
          suggestedQs: llmRes.data?.suggestedQuestions || [],
          llmRawOutput: llmRes.raw,
          llmStatus: llmRes.status
        },
        update: {
          rawSymptoms: symptoms,
          urgency: llmRes.data?.urgency || 'Medium',
          chiefComplaint: llmRes.data?.chiefComplaint || '',
          suggestedQs: llmRes.data?.suggestedQuestions || [],
          llmRawOutput: llmRes.raw,
          llmStatus: llmRes.status
        }
      });

      const eventData = {
        summary: `Medical Appointment: ${appointment.doctor.user.name}`,
        description: `Doctor: ${appointment.doctor.user.name}\nSpecialisation: ${appointment.doctor.specialisation}\nSymptoms: ${symptoms}`,
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

  if (user.role === 'PATIENT' && appt.patientId !== user.userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  if (appt.status !== 'CONFIRMED') {
    const err = new Error(`Only confirmed appointments can be rescheduled. Current status: ${appt.status}`);
    err.statusCode = 400;
    throw err;
  }

  const newStartsAt = new Date(newStartsAtIso);
  const now = new Date();

  if (isNaN(newStartsAt.getTime()) || newStartsAt <= now) {
    const err = new Error('New slot date/time must be in the future');
    err.statusCode = 400;
    throw err;
  }

  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId: appt.doctorId,
      startsAt: newStartsAt,
      status: { in: ['CONFIRMED', 'PENDING'] },
      id: { not: appointmentId }
    }
  });

  if (conflict) {
    const err = new Error('The selected slot is already booked or reserved');
    err.statusCode = 409;
    throw err;
  }

  await prisma.appointment.deleteMany({
    where: {
      doctorId: appt.doctorId,
      startsAt: newStartsAt,
      status: 'CANCELLED',
      id: { not: appointmentId }
    }
  });

  const durationMs = appt.doctor.slotDuration * 60 * 1000;
  const newEndsAt = new Date(newStartsAt.getTime() + durationMs);

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      startsAt: newStartsAt,
      endsAt: newEndsAt,
      status: 'CONFIRMED'
    }
  });

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

  if (user.role === 'PATIENT' && appt.patientId !== user.userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  if (appt.status === 'CANCELLED' || appt.status === 'COMPLETED') {
    const err = new Error(`Appointment cannot be cancelled as it is already ${appt.status}`);
    err.statusCode = 400;
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
    data: { status: 'COMPLETED', chatStatus: 'CLOSED' }
  });
}

async function startChat(doctorUserId, appointmentId) {
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
    const err = new Error('Only confirmed appointments can initiate live chat');
    err.statusCode = 400;
    throw err;
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { chatStatus: 'ACTIVE' }
  });
}

async function closeChat(user, appointmentId) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true }
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

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { chatStatus: 'CLOSED' }
  });
}

async function chatHeartbeat(user, appointmentId) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      doctor: true,
      chatMessages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!appt) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  const updateData = {};
  if (user.role === 'PATIENT') {
    updateData.patientLastSeen = now;
  } else if (user.role === 'DOCTOR') {
    updateData.doctorLastSeen = now;
  }

  const updatedAppt = await prisma.appointment.update({
    where: { id: appointmentId },
    data: updateData
  });

  const PRESENCE_TIMEOUT_MS = 15 * 1000;
  const counterpartLastSeen = user.role === 'PATIENT' ? updatedAppt.doctorLastSeen : updatedAppt.patientLastSeen;
  const isCounterpartOnline = counterpartLastSeen
    ? (now.getTime() - new Date(counterpartLastSeen).getTime()) <= PRESENCE_TIMEOUT_MS
    : false;

  return {
    chatStatus: updatedAppt.chatStatus,
    isCounterpartOnline,
    messages: appt.chatMessages
  };
}

async function sendChatMessage(user, appointmentId, messageText) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true }
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

  if (appt.chatStatus !== 'ACTIVE') {
    const err = new Error('Chat session is not active');
    err.statusCode = 400;
    throw err;
  }

  return prisma.chatMessage.create({
    data: {
      appointmentId,
      senderId: user.userId,
      message: messageText
    },
    include: {
      sender: { select: { id: true, name: true, role: true } }
    }
  });
}

async function getChatMessages(user, appointmentId) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true }
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

  return prisma.chatMessage.findMany({
    where: { appointmentId },
    include: {
      sender: { select: { id: true, name: true, role: true } }
    },
    orderBy: { createdAt: 'asc' }
  });
}

async function aiRefineDoctorDraft(user, appointmentId, draftText) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true, symptomForm: true }
  });

  if (!appt || appt.doctor.userId !== user.userId) {
    const err = new Error('Appointment not found or unauthorized');
    err.statusCode = 403;
    throw err;
  }

  const { refineDoctorMessage } = require('../../services/llm');
  const refined = await refineDoctorMessage(
    draftText,
    appt.symptomForm?.rawSymptoms,
    appt.symptomForm?.chiefComplaint
  );

  return { refinedText: refined };
}

module.exports = {
  holdSlot,
  confirmBooking,
  getPatientAppointments,
  getAppointmentDetail,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment,
  startChat,
  closeChat,
  chatHeartbeat,
  sendChatMessage,
  getChatMessages,
  aiRefineDoctorDraft
};
