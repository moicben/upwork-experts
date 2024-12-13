import { NetlifyAPI } from 'netlify';
import dotenv from 'dotenv';
import content from './content.json' assert { type: 'json' };

dotenv.config();

const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;

const api = new NetlifyAPI(NETLIFY_API_TOKEN);

async function listSites() {
    try {
        // Récupérer tous les sites de votre compte Netlify
        const sites = await api.listSites();

        // Afficher les sites dans la console
        sites.forEach(site => {
            console.log(`Site: ${site.name}, URL: ${site.url}`);
        });
    } catch (error) {
        console.error('Error listing sites:', error.message);
    }
}

listSites();