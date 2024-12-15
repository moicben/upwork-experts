import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN_WEBMASTER,
});

const webmasters = google.webmasters({ version: 'v3', auth: oauth2Client });

async function getCrawlStats(siteUrl) {
  try {
    const response = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: '2024-12-13', // Remplacez par la date de début souhaitée
        endDate: '2024-12-14',   // Remplacez par la date de fin souhaitée
        dimensions: ['page'],
        searchType: 'web',
      },
    });

    console.log('Crawl Stats:', response.data);
  } catch (error) {
    console.error('Error fetching crawl stats:', error.message);
  }
}

getCrawlStats('https://test.expert-francais.shop/');