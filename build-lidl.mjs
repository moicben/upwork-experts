import { execSync } from 'child_process';
import path, { resolve } from 'path';
import dotenv from 'dotenv';
import fs from 'fs-extra'; // Utilisation de fs-extra pour des opérations de répertoire plus faciles
import { createWriteStream } from 'fs';
import { SitemapStream } from 'sitemap';
import pLimit from 'p-limit';

dotenv.config();

const DOMAIN = process.env.DOMAIN;
const CONCURRENCY_LIMIT = 1; // Limite de concurrence pour les builds

// Génération de fichier robots.txt
async function generateRobotsTxt(subdomain) {
  try {
    const robotsTxt = `User-agent: *
    Allow: /
    Sitemap: https://${subdomain}.${DOMAIN}/sitemap.xml`;

    const robotsDir = resolve(`./data/builds/${subdomain}/public`);
    if (!fs.existsSync(robotsDir)) {
      fs.mkdirSync(robotsDir, { recursive: true });
    }
    const robotsPath = resolve(robotsDir, 'robots.txt');
    fs.writeFileSync(robotsPath, robotsTxt);
    //console.log(`Robots.txt generated for ${subdomain}`);
  } catch (error) {
    console.error(`Error generating robots.txt for ${subdomain}:`, error.message);
  }
}

// Génération du sitemap
async function generateSitemap(subdomain) {
  try {
    const sitemap = new SitemapStream({ hostname: `https://${subdomain}.${DOMAIN}` });
    const productsData = JSON.parse(fs.readFileSync(`./data/products/${subdomain}.json`, 'utf8'));
    const products = Array.isArray(productsData.products) ? productsData.products : Object.values(productsData.products);

    sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    products.forEach(product => {
      sitemap.write({ url: `/produits/${product.slug}`, changefreq: 'weekly', priority: 0.7 });
    });

    sitemap.end();
    const sitemapDir = resolve(`./data/builds/${subdomain}/public`);
    if (!fs.existsSync(sitemapDir)) {
      fs.mkdirSync(sitemapDir, { recursive: true });
    }
    const sitemapPath = resolve(sitemapDir, 'sitemap.xml');
    const writeStream = createWriteStream(sitemapPath);

    sitemap.pipe(writeStream).on('finish', () => {
      //console.log(`Sitemap generated for ${subdomain}`);
    });
  } catch (error) {
    console.error(`Error generating sitemap for ${subdomain}:`, error.message);
  }
}

// Fonction pour remplacer le contenu de content.json
async function switchData(subdomain) {
  try {
    const contentSourcePath = resolve(`./data/websites/${subdomain}.json`);
    const contentDestinationPath = resolve('./content.json');
    const contentData = fs.readFileSync(contentSourcePath, 'utf8');
    fs.writeFileSync(contentDestinationPath, contentData);

    const productsSourcePath = resolve(`./data/products/${subdomain}.json`);
    const productsDestinationPath = resolve('./products.json');
    const productsData = fs.readFileSync(productsSourcePath, 'utf8');
    fs.writeFileSync(productsDestinationPath, productsData);

    console.log(`Content switched for ${subdomain}`);
  } catch (error) {
    console.error(`Error switching content for ${subdomain}:`, error.message);
  }
}

// Construire le projet (Next.js)
async function buildProject(subdomain, index, total) {
  try {
    const buildDir = resolve(`./data/builds/${subdomain}`);
    const tempBuildDir = resolve(`./out`); // Répertoire de construction par défaut de Next.js

    // Vérifiez si le répertoire de construction existe déjà
    if (fs.existsSync(buildDir)) {
      console.log(`${index + 1}/${total} - ${subdomain} - already exists`);
      return;
    }

    // Assurez-vous que le répertoire de construction existe
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    // Appel de la fonction switchData
    await switchData(subdomain);

    // Exécutez la commande de construction
    execSync(`npm run build`, { stdio: 'inherit' });

    // Déplacez les fichiers construits vers le répertoire souhaité
    fs.copySync(tempBuildDir, buildDir);
    console.log(`${index + 1}/${total} - ${subdomain}`);
  } catch (error) {
    console.error(`${index + 1}/${total} - Error: ${subdomain}:`, error.message);
    process.exit(1);
  }
}

// Processus principal pour chaque sous-domaine
async function processSite(subdomain, index, total) {
  try {
    await buildProject(subdomain, index, total);
    await generateRobotsTxt(subdomain);
    await generateSitemap(subdomain);
  } catch (error) {
    console.error(`${index + 1}/${total} - Error processing: ${subdomain}:`, error.message);
  }
}

// Orchestration parallèle avec limite de concurrence
async function buildAllSites() {
  const limit = pLimit(CONCURRENCY_LIMIT);
  const websiteFiles = fs.readdirSync('./data/websites');
  const subdomains = websiteFiles.map(file => path.basename(file, '.json'));
  const total = subdomains.length;
  const tasks = subdomains.map((subdomain, index) => limit(() => processSite(subdomain, index, total)));
  await Promise.all(tasks);
  console.log('All sites built.');
}

async function main() {
  try {
    await buildAllSites();
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main().catch(console.error);