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
import { exit } from 'process';

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

async function askVerificationToken(siteUrl, subdomain) {
  try {
    //console.log(`Requesting site verification token for: ${siteUrl}`);
    const tokenResponse = await siteVerification.webResource.getToken({
      verificationMethod: 'META',
      requestBody: {
        site: {
          identifier: siteUrl,
          type: 'SITE',
        },
      },
    });

    const metaTag = tokenResponse.data.token;
    
    // Déterminer le chemin du fichier index.html
    const indexPath = path.join(__dirname, `/data/builds/${subdomain}/index.html`);

    // Lire le fichier index.html
    let html = fs.readFileSync(indexPath, 'utf8');

    // Insérer le token de vérification META dans les balises <head>
    if (!html.includes(metaTag)) {
      const headIndex = html.indexOf('</head>');
      if (headIndex !== -1) {
        html = html.slice(0, headIndex) + metaTag + '\n' + html.slice(headIndex);
        fs.writeFileSync(indexPath, html, 'utf8');
        //console.log('Meta tag inserted successfully.');
      } else {
        console.error('No </head> tag found in the HTML file.');
      }
    } else {
      //console.log('Meta tag already exists in the HTML file.');
    }
  } catch (error) {
    console.error('Error asking site token:', error.message);
    console.error(error);
  }
}


async function verifySite(siteUrl) {
    try {
        // Essayer toutes les 20 secondes pendant 2 minutes
        const maxTries = 3;
        let tries = 0;
        let verified = false;
        while (!verified && tries < maxTries) {
            //console.log(`Verifying site ownership for: ${siteUrl}`);
            await siteVerification.webResource.insert({
            verificationMethod: 'META',
              requestBody: {
                site: {
                  identifier: siteUrl,
                  type: 'SITE',
                },
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
        //console.log(`Submitting sitemap: ${siteUrl}`);
        // Envoyer le sitemap à Google Search Console
        await webmasters.sitemaps.submit({
          siteUrl,
          feedpath: `${siteUrl}/sitemap.xml` 
        });
        //console.log(`Sitemap submitted: ${siteUrl}`);
    }
    catch (error) {
        console.error('Error submitting sitemap:', error.message);
        console.error(error);
    }
}

async function addSite(subdomain, siteUrl) {
  try {
    // Ajouter le site à Google Search Console
    await webmasters.sites.add({ siteUrl });

    // Demander le jeton de vérification du site
    await askVerificationToken(siteUrl, subdomain);

    // Déployer le répertoire actuel sur le site créé ou déjà existant
    await deploySite(subdomain);

    await delay(3500);

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

    // Demander le jeton de vérification du site
    await askVerificationToken(siteUrl, subdomain);

    // Déployer le répertoire actuel sur le site créé ou déjà existant
    await deploySite(subdomain);

    console.log(`Already exists`)

    await delay(3500);

    // Vérifier la propriété du site via le jeton publié
    await verifySite(siteUrl);

    // Envoyer le sitemap à Google Search Console
    await submitSitemap(siteUrl);

  } catch (error) {
    console.error('Error updating site ', error.message);
    console.error(error);
  }
}

async function createOrUpdateSite(subdomain) {
  try {
    console.log(`${subdomains.indexOf(subdomain) + 1}/${subdomains.length} - ${subdomain}`);

    const siteUrl = `https://${subdomain}.${DOMAIN}`;
    const simpleUrl = `${subdomain}.${DOMAIN}`;
    let site;

    // Vérifier si le fichier de produits contient au moins 3 produits
    const productsData = JSON.parse(fs.readFileSync('./products.json', 'utf8'));
    if (!productsData.products || productsData.products.length < 3) {
      console.error(`Products file must contain at least 3 products!`);
      return;
    }

    // Vérifier si le site existe déjà
    let sites = await api.listSites();

    // console.log("Valeur de simpleUrl: ", simpleUrl);
    site = sites.find(s => s.custom_domain === simpleUrl);

    // console.log("Tous les customs: ", sites.map(s => s.custom_domain));
    // console.log("Site trouvé: ", site);

    if (site) {
      console.log(`Already exists`);
      await updateSite(subdomain, siteUrl);
      
    } else {
      // Créer le nouveau site sur Netlify
      site = await api.createSite({
        body: {
          name: `${subdomain}.${DOMAIN}`,
          custom_domain: `${subdomain}.${DOMAIN}`
        }
      });
      console.log(`Site created`);
      
      // Lancer la création du site
      await addSite(subdomain, siteUrl);
    }

  } catch (error) {
    console.error(`Error creating or updating site for ${subdomain}:`, error.message);
  }
}

// Mettre à jour le JSON des partenaires
async function updatePartnersData() {
  try {
    //console.log('Updating partners data...');
    execSync('node C:/Users/bendo/Desktop/Documents/Clapier-Lapin/Tech/ecom/partners-from-netlify.js', { stdio: 'inherit' });
    //console.log('Partners data updated.');
  } catch (error) {
    console.error('Error updating partners data:', error.message);
  }
}

async function deploySite(subdomain) {
  try {
    const outDir = path.resolve(`./data/builds/${subdomain}`); // Répertoire de sortie après la construction
    // Utiliser netlify-cli pour déployer le répertoire de sortie
    execSync(`netlify deploy --prod --dir=${outDir} --site=${subdomain}.${DOMAIN} > NUL 2>&1`);
    console.log(`Deployed: https://${subdomain}.${DOMAIN}`);
    
    // Mettre à jour les données des partenaires après le déploiement
    await updatePartnersData();
  } catch (error) {
    console.error(`Error deploying site:`, error.message);
  }
}

async function createOrUpdateSites(startIndex = 0) {
  for (let i = startIndex; i < subdomains.length; i++) {
    const subdomain = subdomains[i];
    try {
      await createOrUpdateSite(subdomain);
      await delay(5000); // Attendez 5 secondes entre les sites
    } catch (error) {
      console.error(`Failed to process site ${subdomain}:`, error.message);
    }
  }
}
createOrUpdateSites(68);


// async function createOrUpdateSites() {
//   for (const subdomain of subdomains) {
//     try {
//       await createOrUpdateSite(subdomain);
//       await delay(5000); // Attendez 5 secondes entre les sites
//     } catch (error) {
//       console.error(`Failed to process site ${subdomain}:`, error.message);
//     }
//   }
// }

// createOrUpdateSites();
