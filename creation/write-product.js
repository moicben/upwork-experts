const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();

// Configurez votre clé API OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Fonction pour extraire des données spécifiques d'une URL
async function extractProducts(url) {
    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 } }); 
    const page = await browser.newPage();
    await page.goto(url);

    const products = [];

    let hasNextPage = true;
    while (hasNextPage) {
        // Défilement jusqu'en bas de la page pour charger tous les produits
        await autoScroll(page);

        const content = await page.content();
        const $ = cheerio.load(content);

        // Exemple de sélecteurs CSS pour extraire des données spécifiques
        $('div#zg-right-col div#gridItemRoot').each((index, element) => {
            const productSource = $(element).find('a.a-link-normal.aok-block').attr('href').trim();
            let productImage = $(element).find('a.a-link-normal.aok-block img').attr('src').trim();
            const productTitle = $(element).find('a.a-link-normal > span > div').text().trim();
            const productPrice = $(element).find('span.a-color-secondary span.p13n-sc-price').text().trim();

            products.push({
                productSource: productSource,
                productImage: productImage,
                productTitle: productTitle,
                productPrice: productPrice
            });
        });

        // Cliquer sur le bouton de pagination
        hasNextPage = await clickPagination(page);
    }

    await browser.close();
    return products;
}

// Extraire la description du produit
async function extractProductDescription(productUrl) {
    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 } }); 
    const page = await browser.newPage();

    await page.goto(`https://amazon.fr${productUrl}`, { waitUntil: 'networkidle2' });

    const content = await page.content();
    const $ = cheerio.load(content);
    const description = $('#feature-bullets').text().trim();

    console.log('Description extraite :', description);
    return description;
}

// Fonction pour cliquer sur le bouton de pagination
async function clickPagination(page) {
    const nextButton = await page.$('li.a-last a');
    if (nextButton) {
        await nextButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        return true;
    }
    return false;
}

// Fonction pour faire défiler la page jusqu'en bas
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

// Fonction pour générer en utilisant l'API OpenAI
async function generateContent(prompt) {

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'Tu es un assistant français specialisé en rédaction de site e-commerce singulier et attrayant. ' },
            { role: 'user', content: prompt }
        ],
        max_tokens: 1000
    });

    return response.choices[0].message.content.trim();
}

// Fonction principale
async function main() {
    // Lire le fichier content.json
    const content = JSON.parse(fs.readFileSync('../content.json', 'utf8'));
    const site = content.sites[0]; // Limite l'affichage au premier site

    // Extraire les données de l'URL
    const products = await extractProducts(site.source);

    console.log('Processing website:', site);

    // Lire le fichier products.json
    const productsData = JSON.parse(fs.readFileSync('../products.json', 'utf8'));

    // Générer des descriptions de produits et mettre à jour products.json
    for (const [index, product] of products.entries()) {
        console.log(`Proccesing... ${index + 1}/${products.length}`); 

        // Préparation des données du produit
        product.productTitle = await generateContent(`
            Je vais te donner un titre produit Amazon à formater, suis les instructions suivantes pour le formate : \n
            Enlève la mention "Amazon" s'il y en a une \n
            Simplifie le titre et raccourci-le \n
            Place les mots clés les plus importants au début \n
            Le titre ne doit pas dépasser les 56 caractères \n
            N'inclus pas de mots anglais dans le titre \n
            N'inclus pas de caractères spéciaux dans le titre \n
            N'inclus pas de prix dans le titre \n
            Inclus seulement les informations essentielles \n
            N'inclus pas le nom de la marque \n
            Inclus uniquement une majuscule au début du titre, tout le reste en minucscule \n
            \n
            Voici le titre du produit Amazon à formater : ${product.productTitle}   
            \n
            Réponds, uniquement avec le titre de rédigé rien d'autres !\n
            Voici le titre du produit mis à jour : \n
            `);
        product.productImage = product.productImage.replace(/(\.[^.]*?)\.[^.]*?(\.\w+)$/, '$1$2');
        const slug = product.productTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const existingProductIndex = productsData.products.findIndex(p => p.slug === slug);

        // Naviguer vers l'URL du produit et extraire la description
        let productDescription = await extractProductDescription(product.productSource);
        productDescription = productDescription.replace(/› Voir plus de détails/, '');
        productDescription = productDescription.replace(/À propos de cet article/, '');
        productDescription = productDescription.replace(/›/, '');
        productDescription = productDescription.replace(/                     /g, '');
        productDescription = productDescription.replace(/     /g, '');
        productDescription = productDescription.replace(/:/g, ':<br>');
        productDescription = productDescription.replace(/\./g, '.<br>');


        // Ajouter le produit à products.json
        const newProduct = {
            id: existingProductIndex !== -1 ? productsData.products[existingProductIndex].id : productsData.products.length + 1,
            siteId: site.id,
            source: product.productSource,
            name: product.productTitle,
            description: productDescription,
            price: product.productPrice, // Générer un prix aléatoire pour l'exemple
            imageUrl: product.productImage,
            slug: slug,
        };

        if (existingProductIndex !== -1) {
            console.log(`Remplacement du produit ${index + 1}/${products.length}: ${product.productTitle}`);
            productsData.products[existingProductIndex] = newProduct;
        } else {
            console.log(`Ajout du produit ${index + 1}/${products.length}: ${product.productTitle}`);
            productsData.products.push(newProduct);
        }

        // Écrire les modifications dans products.json
    fs.writeFileSync('../products.json', JSON.stringify(productsData, null, 2), 'utf8');

    }

    console.log('Mise à jour de products.json terminée');
    
}

main();