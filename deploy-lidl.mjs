import { NetlifyAPI } from 'netlify';
import { execSync } from 'child_process';
import path from 'path';
import { resolve, join } from 'path';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import fs from 'fs-extra';
import { createWriteStream, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { SitemapStream } from 'sitemap';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;
const DOMAIN = process.env.DOMAIN;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN_WEBMASTER, GOOGLE_REFRESH_TOKEN_VERIFICATION, GOOGLE_SCOPE } = process.env;

const content = JSON.parse(fs.readFileSync('./categories.json', 'utf8'));

const buildDirPath = './data/builds';
const subdomains = fs.readdirSync(buildDirPath).filter(file => fs.statSync(path.join(buildDirPath, file)).isDirectory()).sort();


const api = new NetlifyAPI(NETLIFY_API_TOKEN);

//console.log('Initializing OAuth2 client...');
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

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function submitSitemap(siteUrl) {
    try {
        console.log(`Submitting sitemap: ${siteUrl}`);
        // Envoyer le sitemap à Google Search Console
        await webmasters.sitemaps.submit({
          siteUrl,
          feedpath: `${siteUrl}/sitemap.xml` 
        });
        console.log(`Sitemap submitted: ${siteUrl}`);
    }
    catch (error) {
        console.error('Error submitting sitemap:', error.message);
        console.error(error);
    }
}

async function addSite(subdomain, siteUrl) {
  try {
    console.log(`Adding site to Google Search Console: ${siteUrl}`);
    // Ajouter le site à Google Search Console
    await webmasters.sites.add({ siteUrl });
    console.log(`Site added to Google Search Console: ${siteUrl}`);

    // Demander le jeton de vérification du site
    await askVerifyToken(siteUrl);

    // Construire le projet Next.js
    //await switchBuild(subdomain);

    // Déployer le répertoire actuel sur le site créé ou déjà existant
    await deploySite(subdomain);

    await delay(20000); // Attendre 10 secondes avant de vérifier la propriété du site

    // Vérifier la propriété du site via le jeton publié
    await verifySite(siteUrl);

    // Envoyer le sitemap à Google Search Console
    await submitSitemap(siteUrl);

  } catch (error) {
    console.error('Error adding site ', error.message);
    console.error(error);
  }
}

async function updateSite(subdomain, siteUrl) {
  try {
    // Construire le projet Next.js
    //await switchBuild(subdomain);

    // Déployer le répertoire actuel sur le site créé ou déjà existant
    await deploySite(subdomain);

    console.log(`Sending sitemap to Google Search Console: ${siteUrl}`);
    // Envoyer le sitemap à Google Search Console
    await submitSitemap(siteUrl);

  } catch (error) {
    console.error('Error updating site ', error.message);
    console.error(error);
  }
}

async function createOrUpdateSite(subdomain) {
  try {
    //console.log(`Creating or updating site for: ${subdomain}`);
    const siteUrl = `https://${subdomain}.${DOMAIN}`;
    let site;

    // Vérifier si le fichier de produits contient au moins 3 produits
    // const productsData = JSON.parse(fs.readFileSync('./products.json', 'utf8'));
    // if (!productsData.products || productsData.products.length < 3) {
    //   //console.error(`Products file must contain at least 3 products!`);
    //   return;
    // }

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
      await addSite(subdomain, siteUrl);
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

async function switchBuild(subdomain) {
  try {
    const buildDir = resolve(`./data/builds/${subdomain}`);
    const tempBuildDir = resolve(`./out`); // Répertoire de construction par défaut de Next.js

    // Vérifiez si le répertoire de construction existe
    if (fs.existsSync(buildDir)) {
      // Supprimez d'abord le répertoire de sortie s'il existe déjà pour éviter les conflits
      if (fs.existsSync(tempBuildDir)) {
        await fs.remove(tempBuildDir);
      }

      // Copiez le contenu du répertoire de construction vers le répertoire de sortie
      await fs.copy(buildDir, tempBuildDir);
      console.log('Build copied to:', tempBuildDir);
    } else {
      console.error(`Build directory not found: ${buildDir}`);
    }
  } catch (error) {
    console.error('Error switching build:', error.message);
  }
}

async function deploySite(subdomain) {
  try {
    const outDir = path.resolve(`./data/builds/${subdomain}`); // Répertoire de sortie après la construction
    // Utiliser netlify-cli pour déployer le répertoire de sortie
    execSync(`netlify deploy --prod --dir=${outDir} --site=${subdomain}.${DOMAIN}`, { stdio: 'inherit' });
    console.log(`Site deployed: https://${subdomain}.netlify.app`);
  } catch (error) {
    console.error(`Error deploying site:`, error.message);
  }
}


async function createOrUpdateSites() {
  const promises = subdomains.map(async subdomain => {
    try {
      await createOrUpdateSite(subdomain);
      await delay(5000); // Attendez 5 secondes entre les sites
    } catch (error) {
      console.error(`Failed to process site ${subdomain}:`, error.message);
    }
  });

  await Promise.all(promises);
}


createOrUpdateSites();