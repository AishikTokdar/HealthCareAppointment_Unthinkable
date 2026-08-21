const cron = require('node-cron');
const prisma = require('../config/db');

function startMedicationReminderJob() {
  cron.schedule('0 * * * *', async () => {
    try {
      const dueReminders = await prisma.medicationReminder.findMany({
        where: {
          nextRemindAt: { lte: new Date() },
          doneAt: null
        },
        include: { patient: true }
      });

      for (const reminder of dueReminders) {
        await prisma.notification.create({
          data: {
            userId: reminder.patientId,
            type: 'MED_REMINDER',
            payload: {
              patientName: reminder.patient.name,
              drug: reminder.drug,
              dose: reminder.dose,
              frequency: reminder.frequency
            }
          }
        });

        let nextHours = 24;
        const freqLower = reminder.frequency.toLowerCase();
        if (freqLower.includes('twice')) nextHours = 12;
        else if (freqLower.includes('three') || freqLower.includes('8 hour')) nextHours = 8;
        else if (freqLower.includes('6 hour')) nextHours = 6;

        const newNext = new Date(Date.now() + nextHours * 60 * 60 * 1000);

        await prisma.medicationReminder.update({
          where: { id: reminder.id },
          data: { nextRemindAt: newNext }
        });
      }
    } catch (err) {
      console.error('Medication reminder job error:', err.message);
    }
  });
}

module.exports = startMedicationReminderJob;
