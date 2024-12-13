const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();

// Configure OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Démarrage unique de Puppeteer
async function createBrowser() {
    return await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 } });
}

// Fonction pour extraire les produits
async function extractProducts(page, url) {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const products = [];
    let hasNextPage = true;

    while (hasNextPage) {
        await autoScroll(page);
        const content = await page.content();
        const $ = cheerio.load(content);

        $('div#zg-right-col div#gridItemRoot').each((_, element) => {
            const productSource = $(element).find('a.a-link-normal.aok-block').attr('href')?.trim();
            const productImage = $(element).find('a.a-link-normal.aok-block img').attr('src')?.trim();
            const productTitle = $(element).find('a.a-link-normal > span > div').text()?.trim();
            const productPrice = $(element).find('span.a-color-secondary span.p13n-sc-price').text()?.trim();

            if (productSource && productTitle) {
                products.push({
                    productSource,
                    productImage: productImage ? productImage.split('._')[0] : null,
                    productTitle,
                    productPrice: productPrice || 'Prix non disponible'
                });
            }
        });

        hasNextPage = await clickPagination(page);
    }
    return products;
}

// Extraction de la description
async function extractProductDescription(page, productUrl) {
    await page.goto(`https://amazon.fr${productUrl}`, { waitUntil: 'networkidle2' });
    const content = await page.content();
    const $ = cheerio.load(content);
    return $('#feature-bullets').text().trim().replace(/› Voir plus de détails|À propos de cet article|›/g, '').replace(/ +/g, ' ').replace(/:/g, ':<br>').replace(/\./g, '.<br>');
}

// Pagination
async function clickPagination(page) {
    const nextButton = await page.$('li.a-last a');
    if (nextButton) {
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            nextButton.click()
        ]);
        return true;
    }
    return false;
}

// Défilement automatique
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            const distance = 100;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                if (document.body.scrollHeight <= window.scrollY + window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

// Génération de contenu OpenAI
async function generateContent(prompt) {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
    });
    return response.choices[0].message.content.trim();
}

// Fonction principale
async function main() {
    const browser = await createBrowser();
    const page = await browser.newPage();
    const content = JSON.parse(fs.readFileSync('./content.json', 'utf8'));
    const site = content.sites[0];

    const products = await extractProducts(page, site.source);
    console.log(`Produits extraits : ${products.length}`);

    const productsData = JSON.parse(fs.readFileSync('./products.json', 'utf8'));

    await Promise.all(products.map(async (product, index) => {
        console.log(`Traitement du produit ${index + 1}/${products.length}`);

        product.productTitle = await generateContent(`
            Simplifie le titre suivant en respectant les critères :\n
            - Max 56 caractères \n
            - Sans marque, prix, caractères spéciaux, ou mots anglais \n
            - Format : mot-clé principal au début, 1 majuscule\n
            Titre : ${product.productTitle}
            \n\n
            Réponds, uniquement avec le titre de rédigé rien d'autres !\n
            Voici le titre du produit mis à jour : \n
        `);

        const slug = product.productTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const existingProductIndex = productsData.products.findIndex(p => p.slug === slug);

        if (existingProductIndex === -1) {
            const description = await extractProductDescription(page, product.productSource);
            productsData.products.push({
                ...product,
                slug,
                description
            });
        }
    }));

    fs.writeFileSync('./products.json', JSON.stringify(productsData, null, 2));
    console.log('Mise à jour de products.json terminée.');

    await browser.close();
}

main().catch(console.error);
