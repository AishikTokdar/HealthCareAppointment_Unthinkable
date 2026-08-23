const cron = require('node-cron');

let activeCronTask = null;
let currentTargetUrl = null;

function resolveCloudUrlFromShell() {
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.RAILWAY_STATIC_URL) {
    return `https://${process.env.RAILWAY_STATIC_URL}`;
  }
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }
  return null;
}

function registerCloudKeepAlive(rawUrl) {
  if (!rawUrl) return;

  const urlObj = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  const hostname = urlObj.hostname.toLowerCase();

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return;
  }

  const pingUrl = `${urlObj.origin.replace(/\/$/, '')}/api/v1/health`;

  if (currentTargetUrl === pingUrl && activeCronTask) {
    return;
  }

  if (activeCronTask) {
    activeCronTask.stop();
  }

  currentTargetUrl = pingUrl;
  activeCronTask = cron.schedule('*/12 * * * *', async () => {
    try {
      const res = await fetch(pingUrl);
      if (res.ok) {
        console.log(`[Keep-Alive] Pinged ${pingUrl} successfully at ${new Date().toLocaleTimeString()}`);
      }
    } catch (err) {
      console.warn(`[Keep-Alive] Self-ping failed:`, err.message);
    }
  });

  console.log(`Keep-alive worker initialized dynamically for cloud host: ${pingUrl}`);
}

function startKeepAliveJob() {
  const shellUrl = resolveCloudUrlFromShell();
  if (shellUrl) {
    registerCloudKeepAlive(shellUrl);
  } else {
    console.log('Keep-alive worker idle (Awaiting cloud host detection or disabled for local development).');
  }
}

function expressKeepAliveMiddleware(req, res, next) {
  if (!currentTargetUrl) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (host) {
      registerCloudKeepAlive(`${proto}://${host}`);
    }
  }
  next();
}

module.exports = {
  startKeepAliveJob,
  expressKeepAliveMiddleware
};
