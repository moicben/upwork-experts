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

const limit = pLimit(3);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function createBrowser() {
    return await puppeteer.launch({
        headless: true,
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
    $('.c8g1eWS').each((_, element) => {
        let productSource = $(element).attr('href')?.trim();
        let productImage = $(element).find('.ZlnC-h.XawlJL').attr('src')?.trim();
        let productTitle = $(element).find('p.WvF-eh.CTLl8W').text()?.trim();
        let productPrice = $(element).find('span.buI4_h.UtnDcP.c_um3Rl > span').text()?.trim() + $(element).find('.m-price__currency').text()?.trim();

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

async function main() {
    const browser = await createBrowser();
    const page = await browser.newPage();

    // Read cookies from lidl.json
    await loadCookies(page);

    const categories = JSON.parse(fs.readFileSync('./categories.json', 'utf8'));

    for (let i = 0; i < categories.results.length; i++) {
        const category = categories.results[i];
        const url = category.categorySource; // Assuming the URL is stored in productDescription
        console.log(`${i + 1}/${categories.results.length} - ${category.categorySlug}`);

        const categoryFileName = `./data/products/${category.categorySlug}.json`;

        // Skip if the file already exists
        if (fs.existsSync(categoryFileName)) {
            console.log('File already exists');
            continue;
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
        exec(`python extract-product-page.py ${categoryFileName}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Python script stderr: ${stderr}`);
                return;
            }
            //console.log(`${category.categorySlug} - Details extracted`);
        });
    }

    await browser.close();
}


main().catch(console.error);