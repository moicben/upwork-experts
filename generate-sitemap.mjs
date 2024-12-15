import { SitemapStream } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve, join } from 'path';
import content from './content.json' assert { type: 'json' };
import fs from 'fs';
import path from 'path'; // Assurez-vous d'importer 'path'

// Sélectionner le site en fonction de l'environnement
const site = content.sites.find(site => site.slug === process.env.SITE_SLUG);

function getProductsForSite(siteSlug) {
  try {
    const filePath = path.join(__dirname, 'products', `${siteSlug}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (!fileContent) {
      console.warn(`File ${filePath} is empty. Skipping.`);
      return [];
    }
    const productsData = JSON.parse(fileContent);
    return productsData.products;
  } catch (error) {
    console.error(`Error loading products for site ${siteSlug}:`, error);
    return [];
  }
}

async function generateSitemap() {
  const hostname = isLocalhost ? 'http://localhost' : `https://${site.slug}.${process.env.DOMAIN}`;
  const sitemap = new SitemapStream({ hostname });

  // Add static pages
  sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
  sitemap.write({ url: '/boutique', changefreq: 'weekly', priority: 0.8 });
  sitemap.write({ url: '/mentions-legales', changefreq: 'monthly', priority: 0.5 });
  sitemap.write({ url: '/politique-de-confidentialite', changefreq: 'monthly', priority: 0.5 });
  sitemap.write({ url: '/conditions-generales', changefreq: 'monthly', priority: 0.5 });

  // Read products for the site
  const products = getProductsForSite(site.slug);

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

await generateSitemap();