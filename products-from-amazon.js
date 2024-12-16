const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

// Configure OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Démarrage unique de Puppeteer
async function createBrowser() {
    console.log('Creating browser...');
    return await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 } });
}

async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Charger les cookies Amazon
async function loadCookies(page) {
    const cookies = JSON.parse(fs.readFileSync('./cookies/amazon.json', 'utf8'));
    await page.setCookie(...cookies);
    console.log('Cookies loaded');
}

// Fonction pour extraire les produits
async function extractProducts(page, url) {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const products = [];
    await autoScroll(page);
    const content = await page.content();
    const $ = cheerio.load(content);

    $('.s-widget-spacing-small').each((_, element) => {
        const productSource = $(element).find('a.a-link-normal.s-no-outline').attr('href')?.trim();
        const productImage = $(element).find('a.a-link-normal.s-no-outline img').attr('src')?.trim();
        const productTitle = $(element).find('a.a-link-normal.s-line-clamp-4.s-link-style.a-text-normal h2').text()?.trim();
        const productPrice = $(element).find('.a-row.a-size-base.a-color-secondary span.a-color-base').text()?.trim();

        if (productSource && productTitle) {
            products.push({
                productSource,
                productImage: productImage ? productImage.split('.').slice(0, -2).join('.') + '.' + productImage.split('.').slice(-1) : null,
                productTitle,
                productPrice: productPrice || Math.floor(Math.random() * 40) + 10 + '€'
            });
        }
    });

    return products;
}

// Extraction de la description et des images supplémentaires
async function extractProductDetails(page, productUrl) {
    try {
        await page.goto(`https://amazon.fr${productUrl}`, { waitUntil: 'networkidle2' });
        await delay(2000);
        const content = await page.content();
        const $ = cheerio.load(content);

        const description = $('#feature-bullets').text().trim().replace(/› Voir plus de détails|À propos de cet article|›/g, '').replace(/ +/g, ' ').replace(/:/g, ':<br>').replace(/\./g, '.<br>');
        const productImage2 = $('span#a-autoid-3-announce img').attr('src')?.trim();
        const productImage3 = $('span#a-autoid-4-announce img').attr('src')?.trim();
        const productImage4 = $('span#a-autoid-5-announce img').attr('src')?.trim();
        const productImage5 = $('span#a-autoid-6-announce img').attr('src')?.trim();

        return { description, productImage2, productImage3, productImage4, productImage5 };
    } catch (error) {
        console.error(`Error extracting product details from ${productUrl}:`, error.message);
        return { description: null, images: [] };
    }
}

// Défilement automatique
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            const distance = 300;
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
    await loadCookies(page);

    const content = JSON.parse(fs.readFileSync('./content.json', 'utf8'));
    let productsData = JSON.parse(fs.readFileSync('./products.json', 'utf8'));

    // Vider le tableau des produits existants
    productsData.products = [];

    for (const site of content.sites) {
        const slug = site.keyword.toLowerCase().replace(/ de/,'').replace(/ la/,'').replace(/ le/,'').replace(/l /,'').replace(/ /g, '-').replace(/é/g, 'e').replace(/ /g, '-').replace(/é/g, 'e').replace(/è/g, 'e').replace(/ê/g, 'e').replace(/à/g, '').replace(/[^\w-]+/g, '').replace(/---+/g, '-').replace(/--+/g, '-');

        if (!site.source) {
            console.log(`La source pour ${site.keyword} n'est pas définie. Passer à la boutique suivante.`);
            continue;
        }

        console.log(`-------- Processing site: ${site.keyword} --------`);

        const products = await extractProducts(page, site.source);

        for (const [index, product] of products.entries()) {
            console.log(`${site.keyword} - ${index + 1}/${products.length} `);

            let { description, productImage2, productImage3, productImage4, productImage5 } = await extractProductDetails(page, product.productSource);
             
            product.productTitle = await generateContent(`
                Simplifie le titre suivant en respectant les critères :\n
                - Max 56 caractères \n
                - Sans le mot Amazon, caractères spéciaux, ou mots anglais \n
                - Ne supprime pas ses caractéristiques ou détails importants.\n
                - Format : mot-clé principal au début, 1 majuscule\n
                Titre : ${product.productTitle}
                \n\n
                Réponds, uniquement avec le titre de rédigé rien d'autres !\n
                Voici le titre du produit mis à jour : \n
            `);

            const productSlug = await generateContent(`
                à partir du titre suivant : ${product.productTitle}, génère un slug en minuscules et sans caractères spéciaux : \n
                Simplifie le au maximum pour qu'il soit facile à lire et à mémoriser.\n
                Ne supprime pas ses caractéristiques ou détails importants.\n
                \n\n
                Réponds, uniquement avec le slug généré rien d'autres !\n
                Voici le slug du produit mis à jour : \n
            `);

            description = await generateContent(`
                Pour le titre suivant : ${product.productTitle}, \n
                et sa description Amazon : ${description} \n \n
                Rédige au au format HTML la section détails du produit. \n
                - N'intègre pas le titre du produit au début de la description \n
                - N'intègre pas de balises <head> ou <body> \n
                - Utilise des mots simples, clairs et concis \n
                - Utilise des phrases courtes et des paragraphes aérés \n
                - Utilise des sous-titres via les balises h2 et h3 pour structurer le texte \n
                - Explicite les caractéristiques principales du produit\n
                - Si tu n'as pas assez d'informations, invente des caractéristiques réalistes\n
                - Soit précis et informatif pour aider le client à comprendre le produit\n
                Suis la structure suivante : \n
                - Paragraphe d'introduction \n
                - Liste à puces des avantages principaux du produit \n
                - Tableau des caractéristiques du produit (minimum 8 caractéristiques)\n
                - 4 Questions/réponses listées (balise h4 pour la question et balise p pour la réponse) \n
                Réponds, uniquement avec la section détails rédigée rien d'autres !\n
                Voici les détails du produit rédigé au format HTML : \n
                \n\n
            `);
            
            const existingProductIndex = productsData.products.findIndex(p => p.slug === productSlug);

            if (existingProductIndex === -1) {
                if (description) {
                    productsData.products.push({
                        id: productsData.products.length + 1,
                        siteId: site.id,
                        ...product,
                        slug: productSlug,
                        description,
                        productImage2: productImage2 ? productImage2.split('.').slice(0, -2).join('.') + '.' + productImage2.split('.').slice(-1) : null,
                        productImage3: productImage3 ? productImage3.split('.').slice(0, -2).join('.') + '.' + productImage3.split('.').slice(-1) : null,
                        productImage4: productImage4 ? productImage4.split('.').slice(0, -2).join('.') + '.' + productImage4.split('.').slice(-1) : null,
                        productImage5: productImage5 ? productImage5.split('.').slice(0, -2).join('.') + '.' + productImage5.split('.').slice(-1) : null
                   
                    });
                } else {
                    console.warn(`${site.keyword} - ${index + 1}/Extraction error.`);
                }
            }

            fs.writeFileSync('./products.json', JSON.stringify(productsData, null, 2));
        }
    }

    await browser.close();
}

main().catch(console.error);