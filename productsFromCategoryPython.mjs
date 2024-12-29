import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import pLimit from 'p-limit';
import dotenv from 'dotenv';
import { exec } from 'child_process';

dotenv.config();
puppeteer.use(StealthPlugin());

const limit = pLimit(2); // Limiter à 2 instances simultanées pour les produits
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function createBrowser() {
    return await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920x1080',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
            '--disable-features=IsolateOrigins,site-per-process'
        ],
        ignoreDefaultArgs: ['--disable-extensions']
    });
}

async function loadCookies(page) {
    const cookies = JSON.parse(fs.readFileSync('./cookies/manomano.json', 'utf8'));
    await page.setCookie(...cookies);
}

async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrollToBottom(page) {
    await page.evaluate(async () => {
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const distance = 400; // Distance to scroll in pixels
        let totalHeight = 0;
        const scrollHeight = document.body.scrollHeight;

        while (totalHeight < scrollHeight) {
            if (document.readyState !== 'complete') {
                return; // Exit if the page is navigating
            }
            window.scrollBy(0, distance);
            totalHeight += distance;
            await delay(150); // Adjust the delay to control scrolling speed
        }
    });
}

async function extractProducts(page, url, category) {
    await page.goto(url, { waitUntil: 'networkidle2' });

    //console.log("Starting extraction...");
    await scrollToBottom(page); // Scrolling smoothly to the bottom

    const content = await page.content();
    const $ = cheerio.load(content);

    const products = [];
    $('li.b9bdc658').each((_, element) => {
        let productSource = $(element).find('a').attr('href')?.trim();
        let productImage = $(element).find('img').attr('src')?.trim();
        let productTitle = $(element).find('p.ccb9d67a._17d3fa36.c83f0b12._23ee746f._4fd271c8.df59bc7a.cc6bbaee').text()?.trim();
        let productPrice = $(element).find('._5d34bd7a').text()?.trim() + "€"//+ $(element).find('.m-price__currency').text()?.trim();

        if (productSource && productTitle) {
            products.push({
                productSource,
                productImage,
                productTitle,
                productPrice
            });
        }
    });

    console.log(`${products.length} products`);
    return products;
}

async function extractProductDetails(page, url) {
    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        const content = await page.content();
        const $ = cheerio.load(content);

        const title = $('h1').text().trim() || 'N/A';
        const priceElement = $('span.ETmrsv');
        let price = priceElement.text().trim() || 'N/A';
        const originalPrice = price;
        price = price.replace('€', '').replace('\u20ac', '');
        try {
            price = parseFloat(price);
            price = price - price * 0.2;
            const decimalValues = [0.29, 0.49, 0.79, 0.99];
            const randomDecimal = decimalValues[Math.floor(Math.random() * decimalValues.length)];
            price = Math.floor(price) + randomDecimal;
        } catch (e) {
            price = originalPrice;
        }

        const descriptionElement = $('div.Ssfiu- o2c_dC yBr4ZN');
        let description = descriptionElement.html() || 'N/A';
        const description$ = cheerio.load(description);
        description$('img').remove();
        description$('a').removeAttr('href');
        description = description$.html();

        const imageUrls = [];
        $('ul.m-slider__list img').each((_, img) => {
            imageUrls.push($(img).attr('src'));
        });

        const reviews = [];
        $('div.jPgt-8').each((_, review) => {
            const reviewTitle = $(review).find('header.f3d7kV').text().trim();
            const reviewDescription = $(review).find('div.duBtRc.c1sdlQn').text().trim();
            if (reviewTitle && reviewDescription) {
                reviews.push({ title: reviewTitle, description: reviewDescription });
            }
        });

        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[\/'()]/g, '').replace(/---/g, '').replace(/--/g, '-');

        return {
            productSource: url,
            productTitle: title,
            productPrice: `${price}€` || 'N/A',
            productDescription: description,
            productImages: imageUrls,
            productReviews: reviews,
            slug: slug
        };
    } catch (error) {
        console.error(`Error fetching URL ${url}: ${error}`);
        return null;
    }
}

async function processCategory(category, index, total) {
    const browser = await createBrowser();
    const page = await browser.newPage();
    await loadCookies(page);

    const processedUrls = new Set();
    const url = category.categorySource; // Assuming the URL is stored in productDescription

    // Skip if the URL has already been processed
    if (processedUrls.has(url)) {
        console.log(`Skipping already processed URL: ${url}`);
        await browser.close();
        return;
    }

    console.log(`${index + 1}/${total} - ${category.categorySlug}`);

    const categoryFileName = `./data/products/${category.categorySlug}.json`;

    // Skip if the file already exists
    if (fs.existsSync(categoryFileName)) {
        console.log('File already exists');
        await browser.close();
        return;
    }

    // Ensure the directory exists
    const categoryDir = path.dirname(categoryFileName);
    if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
    }

    const products = await extractProducts(page, url, category);
    let productsData = { products: [] };

    productsData.products.push(...products);

    // Write product URLs to a JSON file named after the category
    fs.writeFileSync(categoryFileName, JSON.stringify(productsData, null, 2));

    // Execute the Python script to extract product details
    // exec(`python extract-product-page.py ${categoryFileName}`, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`Error executing Python script: ${error.message}`);
    //         return;
    //     }
    //     if (stderr) {
    //         console.error(`Python script stderr: ${stderr}`);
    //         return;
    //     }
    //     console.log(`${category.categorySlug} - Details extracted`);
    // });

    // Add the URL to the set of processed URLs
    processedUrls.add(url);

    await browser.close();
}

async function main() {
    const categories = JSON.parse(fs.readFileSync('./data/castorama/categories.json', 'utf8'));

    // Divide categories into 2 lots
    const lotSize = Math.ceil(categories.results.length / 2);
    const lots = [];
    for (let i = 0; i < 2; i++) {
        lots.push(categories.results.slice(i * lotSize, (i + 1) * lotSize));
    }

    // Process each lot in parallel using 2 instances
    await Promise.all(lots.map(lot => 
        Promise.all(lot.map((category, index) => limit(() => processCategory(category, index, categories.results.length))))
    ));
}

main().catch(console.error);