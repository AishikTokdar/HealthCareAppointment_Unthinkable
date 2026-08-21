const cron = require('node-cron');
const prisma = require('../config/db');

function startHoldExpiryJob() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      await prisma.appointment.updateMany({
        where: {
          status: 'PENDING',
          holdExpiresAt: { lte: new Date() }
        },
        data: {
          status: 'CANCELLED'
        }
      });
    } catch (err) {
      console.error('Hold expiry job error:', err.message);
    }
  });
}

module.exports = startHoldExpiryJob;
