const cron = require('node-cron');
const prisma = require('../config/db');

function startAppointmentReminderJob() {
  cron.schedule('0 8 * * *', async () => {
    try {
      const tomorrowStart = new Date();
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setHours(23, 59, 59, 999);

      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          status: 'CONFIRMED',
          startsAt: {
            gte: tomorrowStart,
            lte: tomorrowEnd
          }
        },
        include: {
          patient: true,
          doctor: { include: { user: true } }
        }
      });

      for (const appt of upcomingAppointments) {
        await prisma.notification.create({
          data: {
            userId: appt.patientId,
            type: 'APPOINTMENT_REMINDER',
            payload: {
              patientName: appt.patient.name,
              doctorName: appt.doctor.user.name,
              startsAt: appt.startsAt
            }
          }
        });
      }
    } catch (err) {
      console.error('Appointment reminder job error:', err.message);
    }
  });
}

module.exports = startAppointmentReminderJob;
