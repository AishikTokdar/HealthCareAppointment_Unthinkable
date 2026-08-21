const calendarService = require('./calendar.service');

function handleGetAuthUrl(req, res, next) {
  try {
    const url = calendarService.getAuthUrl(req.user.userId);
    res.json({ url });
  } catch (err) {
    next(err);
  }
}

async function handleCallback(req, res, next) {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }
    const userId = state || (req.user ? req.user.userId : null);
    if (!userId) {
      return res.status(400).json({ error: 'Missing user context for OAuth state' });
    }

    await calendarService.handleCallback(code, userId);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/calendar-success`);
  } catch (err) {
    next(err);
  }
}

async function handleDisconnect(req, res, next) {
  try {
    const result = await calendarService.disconnect(req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleGetAuthUrl,
  handleCallback,
  handleDisconnect
};
