const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const siteVerification = google.siteVerification('v1');

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

google.options({ auth: oauth2Client });

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifySite(siteUrl) {
  try {
    // Essayer toutes les 20 secondes pendant 2 minutes
    const maxTries = 6;
    let tries = 0;
    let verified = false;
    while (!verified && tries < maxTries) {
      console.log(`Verifying site ownership for: ${siteUrl}`);
      const response = await siteVerification.webResource.insert({
        requestBody: {
          site: {
            type: 'SITE',
            identifier: siteUrl
          },
          verificationMethod: 'FILE'
        }
      });
      console.log(`Site ownership verified: ${siteUrl}`);
      verified = true;
      tries++;
      await delay(20000); // Attendre 20 secondes avant de vérifier à nouveau
    }
  } catch (error) {
    console.error('Error verifying site ownership:', error.message);
    console.error(error);
  }
}

module.exports = { verifySite };

// Pour tester la fonction
(async () => {
  const siteUrl = 'https://radiateur-electrique.expert-francais.shop/';
  await verifySite(siteUrl);
})();

