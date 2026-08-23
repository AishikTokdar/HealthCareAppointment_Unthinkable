const cron = require('node-cron');

function startKeepAliveJob() {
  cron.schedule('*/12 * * * *', async () => {
    const backendUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || 'https://healthcareappointment.onrender.com';
    const targetUrl = `${backendUrl.replace(/\/$/, '')}/api/v1/health`;

    try {
      const res = await fetch(targetUrl);
      if (res.ok) {
        console.log(`[Keep-Alive] Pinged ${targetUrl} successfully at ${new Date().toLocaleTimeString()}`);
      }
    } catch (err) {
      console.warn(`[Keep-Alive] Self-ping failed:`, err.message);
    }
  });
  console.log('Keep-alive background worker initialized (Pings /api/v1/health every 12 mins).');
}

module.exports = startKeepAliveJob;
