import { NetlifyAPI } from 'netlify';

const NETLIFY_API_TOKEN = 'nfp_a5XErPtzsBUdRcZ1BFSiqPkxPk4h6L18babb';
const NETLIFY_TEAM_ID = 'YOUR_NETLIFY_TEAM_ID';

const siteIds = [
  'radiateur-electrique.expert-francais.shop',
  'old-francais',
  'expert-francais'
  // Ajoutez autant de site IDs que nécessaire
];

const api = new NetlifyAPI(NETLIFY_API_TOKEN);

async function deleteSite(siteId) {
  try {
    await api.deleteSite({ site_id: siteId });
    console.log(`Site deleted: ${siteId}`);
  } catch (error) {
    console.error(`Error deleting site ${siteId}:`, error.message);
  }
}

async function deleteSites() {
  for (const siteId of siteIds) {
    await deleteSite(siteId);
  }
}

deleteSites();