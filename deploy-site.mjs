import { NetlifyAPI } from 'netlify';
import { execSync } from 'child_process';
import path from 'path';
import { resolve, join } from 'path';
import dotenv from 'dotenv';
import content from './content.json' assert { type: 'json' };
import { google } from 'googleapis';
import fs from 'fs';
import { createWriteStream, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { SitemapStream } from 'sitemap';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;
const DOMAIN = process.env.DOMAIN;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN_WEBMASTER, GOOGLE_REFRESH_TOKEN_VERIFICATION, GOOGLE_SCOPE } = process.env;

const subdomains = [
  content.sites[0].slug,
    
    // Ajoutez autant de sous-domaines que nécessaire
];

const api = new NetlifyAPI(NETLIFY_API_TOKEN);

console.log('Initializing OAuth2 client...');
const oauth2ClientWebmaster = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

oauth2ClientWebmaster.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN_WEBMASTER });

const oauth2ClientVerification = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

oauth2ClientVerification.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN_VERIFICATION });

const webmasters = google.webmasters({
  version: 'v3',
  auth: oauth2ClientWebmaster
});

const siteVerification = google.siteVerification({
  version: 'v1',
  auth: oauth2ClientVerification
});


async function askVerifyToken(siteUrl) {
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
    console.error('Error asking site token:', error.message);
    console.error(error);
  }
}

async function verifySite(siteUrl) {
    try {
        // Essayer toutes les 20 secondes pendant 2 minutes
        const maxTries = 6;
        let tries = 0;
        let verified = false;
        while (!verified && tries < maxTries) {
            console.log(`Verifying site ownership for: ${siteUrl}`);
            await siteVerification.webResource.insert({
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

async function submitSitemap(siteUrl, sitemapUrl) {
    try {
        console.log(`Submitting sitemap: ${sitemapUrl}`);
        // Envoyer le sitemap à Google Search Console
        await webmasters.sitemaps.submit({
          siteUrl,
          feedpath: sitemapUrl
        });
        console.log(`Sitemap submitted: ${sitemapUrl}`);
    }
    catch (error) {
        console.error('Error submitting sitemap:', error.message);
        console.error(error);
    }
}

async function addSite(site, siteUrl, sitemapUrl) {
  try {
    console.log(`Adding site to Google Search Console: ${siteUrl}`);
    // Ajouter le site à Google Search Console
    await webmasters.sites.add({ siteUrl });
    console.log(`Site added to Google Search Console: ${siteUrl}`);

    // Demander le jeton de vérification du site
    await askVerifyToken(siteUrl);

    // Lire les produits pour le site
    console.log(`Products for site ${site.slug}:`, products);

    // Générer le sitemap
    await generateSitemap();

    // Générez le fichier robots.txt
    await generateRobotsTxt();

    // Construire le projet Next.js
    await buildProject();

    // Déployer le répertoire actuel sur le site créé ou déjà existant
    await deploySite(site.id, site.name);

    // Attendre que le déploiement soit terminé
    await waitForDeployment(site.id);

    // Vérifier la propriété du site via le jeton publié
    await verifySite(siteUrl);

    // Envoyer le sitemap à Google Search Console
    await submitSitemap(siteUrl, sitemapUrl);

  } catch (error) {
    console.error('Error adding site ', error.message);
    console.error(error);
  }
}

async function updateSite(subdomain, siteUrl) {
  try {
    // Générer le sitemap
    await generateSitemap(subdomain);

    // Générez le fichier robots.txt
    await generateRobotsTxt(subdomain);

    // Construire le projet Next.js
    console.log('Building project...');
    await buildProject();

    // Déployer le répertoire actuel sur le site créé ou déjà existant
    await deploySite(site.id, site.name);

    console.log(`Sending sitemap to Google Search Console: ${siteUrl}`);
    // Envoyer le sitemap à Google Search Console
    await submitSitemap(siteUrl, sitemapUrl);

  } catch (error) {
    console.error('Error updating site ', error.message);
    console.error(error);
  }
}

async function createOrUpdateSite(subdomain) {
  try {
    const siteUrl = `https://${subdomain}.${DOMAIN}`;
    let site;

    // Vérifier si le site existe déjà
    const sites = await api.listSites();
    site = sites.find(s => s.ssl_url === siteUrl || s.url === siteUrl);

    if (site) {
        console.log(`Site already exists: ${site.ssl_url || site.url}`);

        await updateSite(subdomain, siteUrl);

    } else {

        // Créer le nouveau site sur Netlify
        site = await api.createSite({
            body: {
                name: `${subdomain}.${DOMAIN}`,
                custom_domain: `${subdomain}.${DOMAIN}`
            }
        });
        console.log(`Site created: ${site.ssl_url || site.url}`);

        // Lancer la création du site
        await addSite(site, siteUrl, `${siteUrl}/sitemap.xml`);
    }

  } catch (error) {
    console.error(`Error creating or updating site for ${subdomain}:`, error.message);
  }
}

async function generateSitemap(subdomain) {
  try {
    const sitemap = new SitemapStream({ hostname: `https://${subdomain}.${DOMAIN}` });
    const productsData = JSON.parse(fs.readFileSync(`./products/${subdomain}.json`, 'utf8'));


    // Add static pages
    sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    sitemap.write({ url: '/boutique', changefreq: 'weekly', priority: 0.8 });
    sitemap.write({ url: '/mentions-legales', changefreq: 'monthly', priority: 0.5 });
    sitemap.write({ url: '/politique-de-confidentialite', changefreq: 'monthly', priority: 0.5 });
    sitemap.write({ url: '/conditions-generales', changefreq: 'monthly', priority: 0.5 });


    // Vérification et conversion de l'objet en tableau
    const products = Array.isArray(productsData.products)
     ? productsData.products
     : Object.values(productsData.products);

      if (!Array.isArray(products)) {
          console.error("Erreur : 'products' n'est pas convertible en tableau.");
          return;
      }

    //console.log(`Products for site ${subdomain}:`, products);

    // Add dynamic product pages
    products.forEach(product => {
      sitemap.write({ url: `/produits/${product.slug}`, changefreq: 'weekly', priority: 0.7 });
    });

    sitemap.end();

    const sitemapPath = resolve('public/sitemap.xml');
    const writeStream = createWriteStream(sitemapPath);

    sitemap.pipe(writeStream).on('finish', () => {
      console.log('Sitemap generated at', sitemapPath);
    }).on('error', (err) => {
      console.error('Error generating sitemap:', err);
    });
  }
  catch (error) {
    console.error('Error generating sitemap:', error.message);
  }
  
}

async function generateRobotsTxt(subdomain) {
  try {
    const robotsTxt = `User-agent: *
    Allow: /
    Sitemap: https://${subdomain}.expert-francais.shop/sitemap.xml`;
    
    const robotsPath = resolve('public/robots.txt');
    writeFileSync(robotsPath, robotsTxt);
    console.log('Robots.txt generated at', robotsPath);

  } catch (error) {
    console.error('Error generating robots.txt:', error.message);
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

async function waitForDeployment(siteId) {
  try {
    console.log(`Waiting for deployment to complete for site ID: ${siteId}`);
    let deploymentCompleted = false;
    while (!deploymentCompleted) {
      const deploys = await api.listSiteDeploys({ site_id: siteId });
      const latestDeploy = deploys[0];
      if (latestDeploy.state === 'ready') {
        deploymentCompleted = true;
        console.log(`Deployment completed for site ID: ${siteId}`);
      } else {
        console.log(`Deployment not yet completed for site ID: ${siteId}. Waiting...`);
        await delay(10000); // Attendre 10 secondes avant de vérifier à nouveau
      }
    }
  } catch (error) {
    console.error(`Error waiting for deployment to complete:`, error.message);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createOrUpdateSites() {
  for (const subdomain of subdomains) {
    await createOrUpdateSite(subdomain);
    await delay(5000); // Ajoute un délai de 5 seconde entre les requêtes
  }
}

createOrUpdateSites();