const prisma = require('../../config/db');

async function searchDoctors(specialisation) {
  const where = {
    approvalStatus: 'APPROVED',
    isActive: true,
    ...(specialisation && {
      specialisation: { contains: specialisation, mode: 'insensitive' }
    })
  };

  return prisma.doctorProfile.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true }
      }
    }
  });
}

async function getDoctorPublicProfile(doctorId) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true }
      }
    }
  });

  if (!doctor || !doctor.isActive || doctor.approvalStatus !== 'APPROVED') {
    const err = new Error('Doctor not available');
    err.statusCode = 404;
    throw err;
  }

  return doctor;
}

async function getDoctorSlots(doctorId, dateString) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId }
  });

  if (!doctor || !doctor.isActive || doctor.approvalStatus !== 'APPROVED') {
    const err = new Error('Doctor not found or inactive');
    err.statusCode = 404;
    throw err;
  }

  const queryDate = new Date(dateString);
  queryDate.setHours(0, 0, 0, 0);

  const leave = await prisma.leaveDay.findFirst({
    where: {
      doctorId,
      date: queryDate
    }
  });

  if (leave) {
    return { available: false, reason: 'Doctor is on leave on this date', slots: [] };
  }

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayName = daysOfWeek[queryDate.getDay()];

  if (dayName === 'SUN') {
    return { available: false, reason: 'Clinic is closed on Sunday', slots: [] };
  }

  const workingHours = doctor.workingHours || {};
  const daySchedule = workingHours[dayName] || { start: '09:00', end: '17:00' };

  if (!daySchedule.start || !daySchedule.end) {
    return { available: false, reason: 'Clinic is closed on this day', slots: [] };
  }

  const [startH, startM] = daySchedule.start.split(':').map(Number);
  const [endH, endM] = daySchedule.end.split(':').map(Number);

  const workStart = new Date(queryDate);
  workStart.setHours(startH, startM, 0, 0);

  const workEnd = new Date(queryDate);
  workEnd.setHours(endH, endM, 0, 0);

  const slotDurationMs = doctor.slotDuration * 60 * 1000;

  const startOfDay = new Date(queryDate);
  const endOfDay = new Date(queryDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      startsAt: { gte: startOfDay, lte: endOfDay },
      status: { in: ['CONFIRMED', 'PENDING'] }
    }
  });

  const slots = [];
  let currentMs = workStart.getTime();
  const endMs = workEnd.getTime();
  const nowMs = Date.now();

  while (currentMs + slotDurationMs <= endMs) {
    const slotStart = new Date(currentMs);
    const slotEnd = new Date(currentMs + slotDurationMs);

    const isBooked = existingAppointments.some(appt => {
      if (appt.status === 'CANCELLED') return false;
      if (appt.status === 'PENDING' && appt.holdExpiresAt && new Date(appt.holdExpiresAt).getTime() < nowMs) {
        return false;
      }
      return appt.startsAt.getTime() === slotStart.getTime();
    });

    slots.push({
      startsAt: slotStart.toISOString(),
      endsAt: slotEnd.toISOString(),
      available: !isBooked && slotStart.getTime() > nowMs
    });

    currentMs += slotDurationMs;
  }

  return { available: true, slots };
}

async function getDoctorAppointments(doctorUserId) {
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: doctorUserId }
  });

  if (!profile) {
    const err = new Error('Doctor profile not found');
    err.statusCode = 404;
    throw err;
  }

  return prisma.appointment.findMany({
    where: { doctorId: profile.id },
    include: {
      patient: { select: { id: true, name: true, email: true, phone: true } },
      symptomForm: true,
      visitNote: true
    },
    orderBy: { startsAt: 'asc' }
  });
}

module.exports = {
  searchDoctors,
  getDoctorPublicProfile,
  getDoctorSlots,
  getDoctorAppointments
};
