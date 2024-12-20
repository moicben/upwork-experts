import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import pLimit from 'p-limit';
import dotenv from 'dotenv';

dotenv.config();
puppeteer.use(StealthPlugin());

const limit = pLimit(1);

async function createBrowser() {
    return await puppeteer.launch({ headless: true });
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractProducts(page, url) {
    const products = [];
    let hasNextPage = true;

    while (hasNextPage) {
        await page.goto(url, { waitUntil: 'networkidle2' });

        await page.evaluate(() => { window.scrollBy(0, 14000); });
        await delay(2000);

        const content = await page.content();
        const $ = cheerio.load(content);

        $('div.g').each((_, element) => {
            let productSource = $(element).find('a').attr('href')?.trim();
            let productTitle = $(element).find('h3').text()?.trim();
            let productDescription = $(element).find('.VwiC3b').text()?.trim();

            if (productSource && productTitle) {
                products.push({
                    productSource,
                    productTitle,
                    productDescription
                });
            }
        });

        console.log('Products extracted:', products.length);

        const nextPageLink = $('a#pnnext').attr('href');
        if (nextPageLink) {
            url = `https://www.google.com${nextPageLink}`;
        } else {
            hasNextPage = false;
        }
    }

    return products;
}

async function main() {
    const browser = await createBrowser();
    const page = await browser.newPage();

    fs.writeFileSync('./categories.json', JSON.stringify({ products: [] }, null, 2));

    const url = 'https://www.google.com/search?q=site:https://www.lidl.fr/h&num=100';
    const products = await extractProducts(page, url);

    fs.writeFileSync('./categories.json', JSON.stringify({ products }, null, 2));

    await browser.close();
}

main().catch(console.error);