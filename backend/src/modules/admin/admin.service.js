const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const { deleteCalendarEvent } = require('../../services/calendar');

async function getPendingDoctors() {
  return prisma.doctorProfile.findMany({
    where: { approvalStatus: 'PENDING' },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, createdAt: true }
      }
    }
  });
}

async function approveDoctor(doctorId) {
  const profile = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    include: { user: true }
  });

  if (!profile) {
    const err = new Error('Doctor profile not found');
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.doctorProfile.update({
    where: { id: doctorId },
    data: { approvalStatus: 'APPROVED' }
  });

  await prisma.notification.create({
    data: {
      userId: profile.userId,
      type: 'DOCTOR_APPROVED',
      payload: { doctorName: profile.user.name }
    }
  });

  return updated;
}

async function rejectDoctor(doctorId, reason) {
  const profile = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    include: { user: true }
  });

  if (!profile) {
    const err = new Error('Doctor profile not found');
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.doctorProfile.update({
    where: { id: doctorId },
    data: { approvalStatus: 'REJECTED' }
  });

  await prisma.notification.create({
    data: {
      userId: profile.userId,
      type: 'DOCTOR_REJECTED',
      payload: { doctorName: profile.user.name, reason }
    }
  });

  return updated;
}

async function createDoctorDirectly(data) {
  const { email, password, name, phone, specialisation, slotDuration, workingHours, bio } = data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone,
        role: 'DOCTOR'
      }
    });

    const profile = await tx.doctorProfile.create({
      data: {
        userId: user.id,
        specialisation,
        slotDuration: parseInt(slotDuration, 10) || 30,
        workingHours: workingHours || {
          MON: { start: '09:00', end: '17:00' },
          TUE: { start: '09:00', end: '17:00' },
          WED: { start: '09:00', end: '17:00' },
          THU: { start: '09:00', end: '17:00' },
          FRI: { start: '09:00', end: '17:00' },
          SAT: { start: '09:00', end: '17:00' }
        },
        bio,
        approvalStatus: 'APPROVED'
      }
    });

    return { user, profile };
  });
}

async function updateDoctorProfile(doctorId, data) {
  const { specialisation, slotDuration, workingHours, bio, isActive } = data;
  return prisma.doctorProfile.update({
    where: { id: doctorId },
    data: {
      ...(specialisation && { specialisation }),
      ...(slotDuration && { slotDuration: parseInt(slotDuration, 10) }),
      ...(workingHours && { workingHours }),
      ...(bio !== undefined && { bio }),
      ...(isActive !== undefined && { isActive })
    }
  });
}

async function addDoctorLeave(doctorId, dateString, reason) {
  const leaveDate = new Date(dateString);
  leaveDate.setHours(0, 0, 0, 0);

  const startOfDay = new Date(leaveDate);
  const endOfDay = new Date(leaveDate);
  endOfDay.setHours(23, 59, 59, 999);

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    include: { user: true }
  });

  if (!doctorProfile) {
    const err = new Error('Doctor profile not found');
    err.statusCode = 404;
    throw err;
  }

  const affectedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      startsAt: { gte: startOfDay, lte: endOfDay },
      status: { in: ['CONFIRMED', 'PENDING'] }
    },
    include: { patient: true }
  });

  const result = await prisma.$transaction(async (tx) => {
    const leave = await tx.leaveDay.create({
      data: {
        doctorId,
        date: leaveDate,
        reason
      }
    });

    await tx.appointment.updateMany({
      where: {
        doctorId,
        startsAt: { gte: startOfDay, lte: endOfDay },
        status: { in: ['CONFIRMED', 'PENDING'] }
      },
      data: { status: 'CANCELLED' }
    });

    for (const appt of affectedAppointments) {
      await tx.notification.create({
        data: {
          userId: appt.patientId,
          type: 'LEAVE_CONFLICT',
          payload: {
            patientName: appt.patient.name,
            doctorName: doctorProfile.user.name,
            startsAt: appt.startsAt,
            date: dateString
          }
        }
      });
    }

    const adminUsers = await tx.user.findMany({
      where: { role: 'ADMIN' }
    });

    const cancelledDetails = affectedAppointments.map(appt => ({
      patientName: appt.patient.name,
      patientEmail: appt.patient.email,
      patientPhone: appt.patient.phone || 'N/A',
      startsAt: appt.startsAt
    }));

    for (const admin of adminUsers) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          type: 'LEAVE_CONFLICT',
          payload: {
            isAdminSummary: true,
            doctorName: doctorProfile.user.name,
            specialisation: doctorProfile.specialisation,
            leaveDate: dateString,
            reason: reason || 'Not specified',
            cancelledCount: affectedAppointments.length,
            cancelledAppointments: cancelledDetails
          }
        }
      });
    }

    return leave;
  });

  for (const appt of affectedAppointments) {
    if (appt.gcalEventId && appt.patient.gcalTokens) {
      await deleteCalendarEvent(appt.patient.gcalTokens, appt.gcalEventId);
    }
    if (appt.gcalDoctorEventId && doctorProfile.user.gcalTokens) {
      await deleteCalendarEvent(doctorProfile.user.gcalTokens, doctorProfile.user.gcalDoctorEventId);
    }
  }

  return { leave: result, affectedCount: affectedAppointments.length };
}

async function removeDoctorLeave(doctorId, leaveId) {
  return prisma.leaveDay.delete({
    where: { id: leaveId }
  });
}

async function getAllDoctors() {
  return prisma.doctorProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true }
      },
      leaveDays: true
    }
  });
}

async function getAdminStats() {
  const totalDoctors = await prisma.doctorProfile.count({ where: { approvalStatus: 'APPROVED' } });
  const pendingDoctors = await prisma.doctorProfile.count({ where: { approvalStatus: 'PENDING' } });
  const totalPatients = await prisma.user.count({ where: { role: 'PATIENT' } });
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const appointmentsToday = await prisma.appointment.count({
    where: { startsAt: { gte: todayStart, lte: todayEnd } }
  });

  const queuedNotifications = await prisma.notification.count({
    where: { status: 'QUEUED' }
  });

  return {
    totalDoctors,
    pendingDoctors,
    totalPatients,
    appointmentsToday,
    queuedNotifications
  };
}

async function getNotificationLog() {
  return prisma.notification.findMany({
    include: {
      user: { select: { name: true, email: true, role: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}

module.exports = {
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  createDoctorDirectly,
  updateDoctorProfile,
  addDoctorLeave,
  removeDoctorLeave,
  getAllDoctors,
  getAdminStats,
  getNotificationLog
};
