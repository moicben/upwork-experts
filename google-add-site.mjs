import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN, GOOGLE_SCOPE } = process.env;

console.log('Initializing OAuth2 client...');
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

const webmasters = google.webmasters({
  version: 'v3',
  auth: oauth2Client
});

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
          type: 'INET_DOMAIN',
          identifier: siteUrl
        },
        verificationMethod: 'FILE'
      }
    });

    const token = res.data.token;
    console.log(`Verification token received: ${token}`);

    // Save the token file to the root directory of your site
    const tokenFilePath = path.join(__dirname, 'public', token);
    fs.writeFileSync(tokenFilePath, 'google-site-verification: ' + token);
    console.log(`Verification token file saved to: ${tokenFilePath}`);

    console.log(`Verifying site ownership for: ${siteUrl}`);
    await siteVerification.webResource.insert({
      requestBody: {
        site: {
          type: 'INET_DOMAIN',
          identifier: siteUrl
        },
        verificationMethod: 'FILE'
      }
    });
    console.log(`Site ownership verified: ${siteUrl}`);
  } catch (error) {
    console.error('Error verifying site ownership:', error.message);
    console.error(error);
  }
}

async function addSiteAndSubmitSitemap(siteUrl, sitemapUrl) {
  try {
    console.log(`Adding site to Google Search Console: ${siteUrl}`);
    // Ajouter le site à Google Search Console
    await webmasters.sites.add({ siteUrl });
    console.log(`Site added to Google Search Console: ${siteUrl}`);

    // Vérifier la propriété du site
    await verifySite(siteUrl);

    console.log(`Submitting sitemap: ${sitemapUrl}`);
    // Envoyer le sitemap à Google Search Console
    await webmasters.sitemaps.submit({
      siteUrl,
      feedpath: sitemapUrl
    });
    console.log(`Sitemap submitted: ${sitemapUrl}`);
  } catch (error) {
    console.error('Error adding site or submitting sitemap:', error.message);
    console.error(error);
  }
}

const siteUrl = 'https://apprentissage-proprete.expert-francais.shop';
const sitemapUrl = `${siteUrl}/sitemap.xml`;

addSiteAndSubmitSitemap(siteUrl, sitemapUrl).catch(error => {
  console.error('Unhandled error:', error.message);
  console.error(error);
});