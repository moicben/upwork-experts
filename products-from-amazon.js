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
    //console.log(`Extracting products from ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    const products = [];

    // let hasNextPage = true;
    // while (hasNextPage) {
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

    //hasNextPage = await clickPagination(page);
    //}

    //console.log(`Extracted ${products.length} products.`);
    return products;
}

// Extraction de la description et des images supplémentaires
async function extractProductDetails(page, productUrl) {
    try {
        //console.log(`Extracting details from ${productUrl}...`);
        await page.goto(`https://amazon.fr${productUrl}`, { waitUntil: 'networkidle2' });

        // Délais de 2 secondes
        await delay(2000);

        const content = await page.content();
        const $ = cheerio.load(content);

        const description = $('#feature-bullets').text().trim().replace(/› Voir plus de détails|À propos de cet article|›/g, '').replace(/ +/g, ' ').replace(/:/g, ':<br>').replace(/\./g, '.<br>');
        const productImage2 = $('span#a-autoid-3-announce img').attr('src')?.trim();
        const productImage3 = $('span#a-autoid-4-announce img').attr('src')?.trim();

        return { description, productImage2, productImage3 };
    } catch (error) {
        console.error(`Error extracting product details from ${productUrl}:`, error.message);
        return { description: null, images: [] }; // Retourner null en cas d'erreur
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
    //console.log('Generating content with OpenAI...');
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
    });
    return response.choices[0].message.content.trim();
}

// Fonction principale
async function main() {
    //console.log('Starting main function...');
    const browser = await createBrowser();
    const page = await browser.newPage();
    
    // Charger les cookies
    await loadCookies(page);

    const content = JSON.parse(fs.readFileSync('./content.json', 'utf8'));

    for (const site of content.sites) {
        const slug = site.keyword.toLowerCase().replace(/ /g, '-').replace(/é/g, 'e').replace(/è/g, 'e').replace(/ê/g, 'e').replace(/à/g, 'e').replace(/[^\w-]+/g, '');
        const productsFilePath = path.join('./products', `${slug}.json`);

        // Vérifier si le fichier existe déjà
        if (fs.existsSync(productsFilePath)) {
            //console.log(`${productsFilePath} existe déjà. Passer à la boutique suivante.`);
            continue; // Passer à la boutique suivante
        }
        fs.writeFileSync(productsFilePath, "");

        // Vérifier si la source est définie
        if (!site.source) {
            console.log(`La source pour ${site.keyword} n'est pas définie. Passer à la boutique suivante.`);
            continue; // Passer à la boutique suivante
        }

        console.log(`-------- Processing site: ${site.keyword} --------`);

        const products = await extractProducts(page, site.source);
        //console.log(`${site.keyword} - ${products.length} produits extraits`);

        let productsData = { products: [] };

        for (const [index, product] of products.entries()) {
            console.log(`${site.keyword} - ${index + 1}/${products.length} `);

            // Extraire les détails du produit
            let { description, productImage2, productImage3 } = await extractProductDetails(page, product.productSource);
             
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
                        id: productsData.products.length + 1, // Générer un nouvel ID
                        siteId: site.id, // Utiliser l'ID du site actuel
                        ...product,
                        slug: productSlug,
                        description,
                        productImage2: productImage2 ? productImage2.split('.').slice(0, -2).join('.') + '.' + productImage2.split('.').slice(-1) : null,
                        productImage3: productImage3 ? productImage3.split('.').slice(0, -2).join('.') + '.' + productImage3.split('.').slice(-1) : null
                    });
                } else {
                    console.warn(`${site.keyword} - ${index + 1}/Extraction error.`);
                }
            }

            fs.writeFileSync(productsFilePath, JSON.stringify(productsData, null, 2));
            //console.log(`Mise à jour de ${productsFilePath} terminée.`);
        }
    }

    await browser.close();
}

main().catch(console.error);