import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { OAuth2 } = google.auth;
const siteVerification = google.siteVerification('v1');

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN_VERIFICATION } = process.env;

const oauth2Client = new OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN_VERIFICATION });

google.options({ auth: oauth2Client });

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function insertMetaTag(filePath, metaTag) {
  try {
    let html = fs.readFileSync(filePath, 'utf8');
    if (!html.includes(metaTag)) {
      const headIndex = html.indexOf('</head>');
      if (headIndex !== -1) {
        html = html.slice(0, headIndex) + metaTag + '\n' + html.slice(headIndex);
        fs.writeFileSync(filePath, html, 'utf8');
        console.log('Meta tag inserted successfully.');
      } else {
        console.error('No </head> tag found in the HTML file.');
      }
    } else {
      console.log('Meta tag already exists in the HTML file.');
    }
  } catch (error) {
    console.error('Error inserting meta tag:', error.message);
  }
}

async function verifySite(siteUrl, htmlFilePath) {
  try {
    // Obtenir le token de vérification meta
    const tokenResponse = await siteVerification.webResource.getToken({
      requestBody: {
        site: {
          type: 'SITE',
          identifier: siteUrl
        }
      }
    });
    const verificationToken = tokenResponse.data.token;

    console.log(`Verification token obtained: ${verificationToken}`);

    const metaTag = verificationToken;

    // Insérer le token de vérification meta dans les balises <head>
    await insertMetaTag(htmlFilePath, metaTag);

    // Vérifier la propriété du site
    const response = await siteVerification.webResource.insert({
      verificationMethod: 'META',
      requestBody: {
        site: {
          type: 'SITE',
          identifier: siteUrl
        },
        token: verificationToken
      }
    });
    console.log(`Site ownership verified: ${siteUrl}`);
  } catch (error) {
    console.error('Error verifying site ownership:', error.message);
    console.error(error);
  }
}

const siteUrl = 'https://pantalons-enfant-jeans-et.expert-francais.shop/';
const htmlFilePath = path.join(__dirname, 'path/to/your/index.html'); // Remplacez par le chemin de votre fichier HTML
await verifySite(siteUrl, htmlFilePath);