import { SitemapStream } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve } from 'path';

import content from './content.json' assert { type: 'json' };
import productsData from './products/old.json' assert { type: 'json' };

// Limite l'affichage au premier site
const site = content.sites[0]; 

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: `https://${site.slug}.expert-francais.shop` });

  // Add static pages
  sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
  sitemap.write({ url: '/boutique', changefreq: 'daily', priority: 0.8 });
  sitemap.write({ url: '/mentions-legales', changefreq: 'monthly', priority: 0.5 });
  sitemap.write({ url: '/politique-de-confidentialite', changefreq: 'monthly', priority: 0.5 });
  sitemap.write({ url: '/conditions-generales', changefreq: 'monthly', priority: 0.5 });

  // Add dynamic product pages
  productsData.products.forEach(product => {
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