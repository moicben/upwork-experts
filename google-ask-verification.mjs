import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN_VERIFICATION } = process.env;

console.log('Initializing OAuth2 client...');
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN_VERIFICATION });

const siteVerification = google.siteVerification({
  version: 'v1',
  auth: oauth2Client
});

async function verifySite(siteUrl) {
  try {
    console.log(`Requesting site verification token for: ${siteUrl}`);
    const res = await siteVerification.webResource.getToken({
      requestBody: {
        site: {
          type: 'SITE',
          identifier: siteUrl
        },
        verificationMethod: 'FILE'
      }
    });

    const token = res.data.token;
    console.log(`Verification token received: ${token}`);

    // Save the token file to the public directory of your site
    const tokenFilePath = path.join(__dirname, 'public', token);
    fs.writeFileSync(tokenFilePath, 'google-site-verification: ' + token);
    console.log(`Verification token file saved to: ${tokenFilePath}`);
  } catch (error) {
    console.error('Error verifying site ownership:', error.message);
    console.error(error);
  }
}

// Example usage
const siteUrl = 'https://apprentissage-proprete.expert-francais.shop';
verifySite(siteUrl).catch(error => {
  console.error('Unhandled error:', error.message);
  console.error(error);
});