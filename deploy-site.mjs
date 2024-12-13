import { NetlifyAPI } from 'netlify';
import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import content from './content.json' assert { type: 'json' };

dotenv.config();

const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;
const DOMAIN = 'expert-francais.shop';

const subdomains = [
    content.sites[0].slug,
    // Ajoutez autant de sous-domaines que nécessaire
];

const api = new NetlifyAPI(NETLIFY_API_TOKEN);

async function createOrUpdateSite(subdomain) {
    try {
        const siteUrl = `https://${subdomain}.${DOMAIN}`;
        let site;

        // Vérifier si le site existe déjà
        const sites = await api.listSites();
        site = sites.find(s => s.ssl_url === siteUrl || s.url === siteUrl);

        if (site) {
            console.log(`Site already exists: ${site.ssl_url || site.url}`);
        } else {
            // Créer un nouveau site s'il n'existe pas
            site = await api.createSite({
                body: {
                    name: `${subdomain}.${DOMAIN}`,
                    custom_domain: `${subdomain}.${DOMAIN}`
                }
            });
            console.log(`Site created: ${site.ssl_url || site.url}`);
        }

        // Générer le sitemap
        generateSitemap();

        // Construire le projet Next.js
        buildProject();

        // Déployer le répertoire actuel sur le site créé ou existant
        await deploySite(site.id, site.name);
    } catch (error) {
        console.error(`Error creating or updating site for ${subdomain}:`, error.message);
    }
}

function generateSitemap() {
    try {
        // Exécuter la commande pour générer le sitemap
        execSync('npm run generate-sitemap', { stdio: 'inherit' });
        console.log('Sitemap generated successfully');
    } catch (error) {
        console.error('Error generating sitemap:', error.message);
        process.exit(1);
    }
}

function buildProject() {
    try {
        // Exécuter la commande de construction Next.js
        execSync('npm run build', { stdio: 'inherit' });
        console.log('Project built successfully');
    } catch (error) {
        console.error('Error building project:', error.message);
        process.exit(1);
    }
}

async function deploySite(siteId, siteName) {
    try {
        const outDir = path.resolve('./out'); // Répertoire de sortie après la construction
        // Utiliser netlify-cli pour déployer le répertoire de sortie
        execSync(`netlify deploy --prod --dir=${outDir} --site=${siteId}`, { stdio: 'inherit' });
        console.log(`Site deployed: https://${siteName}.netlify.app`);
    } catch (error) {
        console.error(`Error deploying site:`, error.message);
    }
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createOrUpdateSites() {
    for (const subdomain of subdomains) {
        await createOrUpdateSite(subdomain);
        await delay(1000); // Ajoute un délai de 1 seconde entre les requêtes
    }
}

createOrUpdateSites();