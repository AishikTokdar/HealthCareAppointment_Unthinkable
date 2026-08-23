const cron = require('node-cron');
const prisma = require('../config/db');
const { sendNotification } = require('../services/mailer');

function startNotificationWorker() {
  cron.schedule('*/2 * * * *', async () => {
    try {
      const pendingNotifications = await prisma.notification.findMany({
        where: {
          status: { in: ['QUEUED', 'FAILED'] },
          attempts: { lt: 3 },
          nextRetryAt: { lte: new Date() }
        },
        include: { user: true },
        take: 10
      });

      for (const notification of pendingNotifications) {
        try {
          const recipientEmail = notification.user?.email || 'patient@clinic.com';
          await sendNotification(notification, recipientEmail);
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              attempts: notification.attempts + 1
            }
          });
        } catch (err) {
          const nextAttempts = notification.attempts + 1;
          const nextRetry = new Date(Date.now() + nextAttempts * 5 * 60 * 1000);
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'FAILED',
              attempts: nextAttempts,
              nextRetryAt: nextRetry
            }
          });
        }
      }
    } catch (err) {
      console.error('Notification worker error:', err.message);
    }
  });
}

module.exports = startNotificationWorker;
