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

    await tx.notification.create({
      data: {
        userId: doctorProfile.userId,
        type: 'LEAVE_APPROVED',
        payload: {
          doctorName: doctorProfile.user.name,
          leaveDate: dateString,
          reason
        }
      }
    });

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
          type: 'LEAVE_APPROVED',
          payload: {
            isAdminSummary: true,
            doctorName: doctorProfile.user.name,
            specialisation: doctorProfile.specialisation,
            leaveDate: dateString,
            reason: reason || 'Directly scheduled by admin',
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

async function getPendingLeaveRequests() {
  return prisma.leaveRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      doctor: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function approveLeaveRequest(requestId) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: { doctor: { include: { user: true } } }
  });

  if (!request) {
    const err = new Error('Leave request not found');
    err.statusCode = 404;
    throw err;
  }

  if (request.status !== 'PENDING') {
    const err = new Error('Leave request is already processed');
    err.statusCode = 400;
    throw err;
  }

  const dateString = request.date.toISOString().split('T')[0];
  const leaveDate = new Date(request.date);
  leaveDate.setHours(0, 0, 0, 0);

  const startOfDay = new Date(leaveDate);
  const endOfDay = new Date(leaveDate);
  endOfDay.setHours(23, 59, 59, 999);

  const affectedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: request.doctorId,
      startsAt: { gte: startOfDay, lte: endOfDay },
      status: { in: ['CONFIRMED', 'PENDING'] }
    },
    include: { patient: true }
  });

  const result = await prisma.$transaction(async (tx) => {
    await tx.leaveRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' }
    });

    const leaveDay = await tx.leaveDay.upsert({
      where: { doctorId_date: { doctorId: request.doctorId, date: leaveDate } },
      create: { doctorId: request.doctorId, date: leaveDate, reason: request.reason },
      update: { reason: request.reason }
    });

    await tx.appointment.updateMany({
      where: {
        doctorId: request.doctorId,
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
            doctorName: request.doctor.user.name,
            startsAt: appt.startsAt,
            date: dateString
          }
        }
      });
    }

    await tx.notification.create({
      data: {
        userId: request.doctor.userId,
        type: 'LEAVE_APPROVED',
        payload: {
          doctorName: request.doctor.user.name,
          leaveDate: dateString,
          reason: request.reason
        }
      }
    });

    const adminUsers = await tx.user.findMany({ where: { role: 'ADMIN' } });
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
          type: 'LEAVE_APPROVED',
          payload: {
            isAdminSummary: true,
            doctorName: request.doctor.user.name,
            specialisation: request.doctor.specialisation,
            leaveDate: dateString,
            reason: request.reason || 'Requested by Doctor',
            cancelledCount: affectedAppointments.length,
            cancelledAppointments: cancelledDetails
          }
        }
      });
    }

    return leaveDay;
  });

  for (const appt of affectedAppointments) {
    if (appt.gcalEventId && appt.patient.gcalTokens) {
      await deleteCalendarEvent(appt.patient.gcalTokens, appt.gcalEventId);
    }
    if (appt.gcalDoctorEventId && request.doctor.user.gcalTokens) {
      await deleteCalendarEvent(request.doctor.user.gcalTokens, request.doctor.user.gcalDoctorEventId);
    }
  }

  return { request: result, affectedCount: affectedAppointments.length };
}

async function rejectLeaveRequest(requestId, reason) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: { doctor: { include: { user: true } } }
  });

  if (!request) {
    const err = new Error('Leave request not found');
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' }
  });

  const dateString = request.date.toISOString().split('T')[0];

  await prisma.notification.create({
    data: {
      userId: request.doctor.userId,
      type: 'LEAVE_REJECTED',
      payload: {
        doctorName: request.doctor.user.name,
        leaveDate: dateString,
        reason
      }
    }
  });

  return updated;
}

async function getAllDoctors() {
  return prisma.doctorProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true }
      },
      leaveDays: true,
      leaveRequests: true
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

  const pendingLeaveRequests = await prisma.leaveRequest.count({
    where: { status: 'PENDING' }
  });

  return {
    totalDoctors,
    pendingDoctors,
    totalPatients,
    appointmentsToday,
    queuedNotifications,
    pendingLeaveRequests
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
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getAllDoctors,
  getAdminStats,
  getNotificationLog
};
