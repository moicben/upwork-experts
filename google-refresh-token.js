const { google } = require('googleapis');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Change the scope to the one you needs
const SCOPES = ['https://www.googleapis.com/auth/siteverification'];
// const SCOPES = ['https://www.googleapis.com/auth/webmasters'];
// Them authenticate with Google, copy the code/paste the code in terminal, and get the refresh token

function getAccessToken() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  rl.question('Enter the code from that page here: ', (code) => {
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token', err);
        return;
      }
      oauth2Client.setCredentials(token);
      console.log('Refresh Token:', token.refresh_token);
      rl.close();
    });
  });
}

getAccessToken();