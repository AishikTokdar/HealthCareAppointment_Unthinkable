const { google } = require('googleapis');

function getOAuthClient(tokens = null) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  if (tokens) {
    oauth2Client.setCredentials(tokens);
  }

  return oauth2Client;
}

module.exports = {
  getOAuthClient
};
