import { SitemapStream } from 'sitemap';
import { createWriteStream, writeFileSync } from 'fs';
import { resolve } from 'path';

import content from './content.json' assert { type: 'json' };
import productsData from './products/old.json' assert { type: 'json' };

// Limite l'affichage au premier site
const site = content.sites[0];

async function generateRobotsTxt() {
  const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://${site.slug}.expert-francais.shop/sitemap.xml`;

  const robotsPath = resolve('public/robots.txt');
  writeFileSync(robotsPath, robotsTxt);
  console.log('Robots.txt generated at', robotsPath);
}

await generateRobotsTxt();
