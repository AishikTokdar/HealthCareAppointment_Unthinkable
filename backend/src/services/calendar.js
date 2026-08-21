const { google } = require('googleapis');
const { getOAuthClient } = require('../config/gcal');

async function createCalendarEvent(userGcalTokens, eventDetails) {
  if (!userGcalTokens) return null;
  try {
    const oauth2Client = getOAuthClient(userGcalTokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: { dateTime: new Date(eventDetails.startsAt).toISOString() },
        end: { dateTime: new Date(eventDetails.endsAt).toISOString() }
      }
    });

    return response.data.id;
  } catch (err) {
    console.error('Google Calendar event creation error:', err.message);
    return null;
  }
}

async function updateCalendarEvent(userGcalTokens, eventId, eventDetails) {
  if (!userGcalTokens || !eventId) return null;
  try {
    const oauth2Client = getOAuthClient(userGcalTokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: { dateTime: new Date(eventDetails.startsAt).toISOString() },
        end: { dateTime: new Date(eventDetails.endsAt).toISOString() }
      }
    });
    return true;
  } catch (err) {
    console.error('Google Calendar event update error:', err.message);
    return false;
  }
}

async function deleteCalendarEvent(userGcalTokens, eventId) {
  if (!userGcalTokens || !eventId) return null;
  try {
    const oauth2Client = getOAuthClient(userGcalTokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    });
    return true;
  } catch (err) {
    console.error('Google Calendar event delete error:', err.message);
    return false;
  }
}

module.exports = {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
};
