const prisma = require('../../config/db');
const { getOAuthClient } = require('../../config/gcal');

function getAuthUrl(userId) {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: userId
  });
}

async function handleCallback(code, userId) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  await prisma.user.update({
    where: { id: userId },
    data: { gcalTokens: tokens }
  });

  return { success: true };
}

async function disconnect(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { gcalTokens: null }
  });

  return { success: true };
}

module.exports = {
  getAuthUrl,
  handleCallback,
  disconnect
};
