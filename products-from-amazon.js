const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const pLimit = require('p-limit');
require('dotenv').config();

const limit = pLimit(10); // Limite à 10 instances simultanées

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
    await page.evaluate(() => { window.scrollBy(0, 14000); });
    await delay(2000);

    const content = await page.content();
    const $ = cheerio.load(content);

    $('.s-widget-spacing-small').each((_, element) => {
        let productSource = $(element).find('a.a-link-normal.s-no-outline').attr('href')?.trim();
        let productImage = $(element).find('a.a-link-normal.s-no-outline img').attr('src')?.trim();
        let productTitle = $(element).find('a.a-link-normal.s-line-clamp-4.s-link-style.a-text-normal h2').text()?.trim();
        let productPrice = $(element).find('.a-row.a-size-base.a-color-secondary span.a-color-base').text()?.trim();

        if (productSource && productTitle) {
            products.push({
                productSource,
                productImage: productImage ? productImage.split('.').slice(0, -2).join('.') + '.' + productImage.split('.').slice(-1) : null,
                productTitle,
                productPrice: productPrice || Math.floor(Math.random() * 40) + 10 + '€'
            });
        }
    });
    console.log('Products extracted:', products.length);
    return products;
}

// Extraction de la description et des images supplémentaires
async function extractProductDetails(productUrl) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Désactiver le chargement des styles
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (request.resourceType() === 'stylesheet') {
            request.abort();
        } else {
            request.continue();
        }
    });

    try {
        await page.goto(`https://amazon.fr${productUrl}`, { waitUntil: 'networkidle2' });
        await delay(4000);

        let content = await page.content();
        let $ = cheerio.load(content);

        let description = $('#feature-bullets').text().trim();
        let productImage2 = $('span#a-autoid-3-announce img').attr('src')?.trim();
        let productImage3 = $('span#a-autoid-4-announce img').attr('src')?.trim();
        let productImage4 = $('span#a-autoid-5-announce img').attr('src')?.trim();
        let productImage5 = $('span#a-autoid-6-announce img').attr('src')?.trim();

        await page.evaluate(() => { window.scrollBy(0, 5400); });

        await delay(500);
        let reviewImages = [];
        $('div#cm_cr_carousel_images_section img').each((_, element) => {
            let reviewImage = $(element).attr('src')?.trim();
            reviewImage = reviewImage.split('.').slice(0, -2).join('.') + '.' + reviewImage.split('.').slice(-1);

            if (reviewImage) {
                reviewImages.push(reviewImage);
            }
        });

        await page.evaluate(() => { window.scrollBy(0, 400); });
        await delay(500);

        let reviews = [];
        $('span.cr-widget-FocalReviews .a-section.celwidget').each((index, element) => {
            if (index === 0) return;
            let review = $(element).html().trim();
            if (review) {
                let reviewText = $(element).find('span.review-text span').html().trim();
                let reviewerName = $(element).find('span.a-profile-name').text().trim();
                let reviewDate = $(element).find('span.review-date').text().trim();
                let reviewTitle = $(element).find('a.review-title span').text().trim();
                let reviewRating = $(element).find('i.review-rating span').text().trim();
                reviewerName = reviewerName.replace(/d'Amazon/g, 'anonyme').replace(/Amazon/g, '').replace(/Client anonymeClient anonyme/, 'Anonyme');
                reviewTitle = reviewTitle.replace(/5,0 sur 5 étoiles/g, '').replace(/4,0 sur 5 étoiles/g, '').replace(/3,0 sur 5 étoiles/g, '').replace(/2,0 sur 5 étoiles/g, '').replace(/1,0 sur 5 étoiles/g, '');

                reviewDate = reviewDate.replace(/en France/g, '').replace(/Avis laissé  le /g, '');
                reviewDate = reviewDate.split('2024')[0] + '2024';
                reviewDate = reviewDate.replace(/20232024/, '2024').replace(/20242023/, '2024').replace(/20222021/, '2024').replace(/20212020/, '2024').replace(/20192024/,'2024').replace(/20202024/,'2024').replace(/20212024/,'2024').replace(/20222024/,'2024').replace(/20232024/,'2024');

                reviewText = reviewText.replace(/d'Amazon/, '').replace(/Amazon/g, '').replace(/amazon/g, '');

                let ratingMatch = reviewRating.match(/(\d),0 sur 5/);
                if (ratingMatch) {
                    let rating = parseInt(ratingMatch[1], 10);
                    reviewRating = '⭐'.repeat(rating);
                } else {
                    reviewRating = '⭐⭐⭐⭐⭐';
                }

                let cleanedReview = `
                <article>
                    <span>${reviewerName}</span>
                    <li>${reviewRating}</li>
                </article>
                <div>
                    <h3>${reviewTitle}</h3>
                    <strong>${reviewDate}</strong>
                    <span>✔️ Achat vérifié</span>
                    <p>${reviewText}</p>
                </div>
                `;
                reviews.push(cleanedReview);
            }
        });

        return { description, productImage2, productImage3, productImage4, productImage5, reviewImages, reviews };
    } catch (error) {
        console.error(`Error extracting product details from ${productUrl}:`, error.message);
        return { description: null, images: [] };
    } finally {
        await browser.close();
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
        model: 'gpt-4o-mini',
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

    fs.writeFileSync('./products.json', JSON.stringify({ products: [] }, null, 2));

    const content = JSON.parse(fs.readFileSync('./content.json', 'utf8'));
    let productsData = { products: [] };

    for (const site of content.sites) {
        const slug = site.keyword.toLowerCase().replace(/ de/, '').replace(/ la/, '').replace(/ le/, '').replace(/l /, '').replace(/ /g, '-').replace(/é/g, 'e').replace(/ /g, '-').replace(/é/g, 'e').replace(/è/g, 'e').replace(/ê/g, 'e').replace(/à/g, '').replace(/[^\w-]+/g, '').replace(/---+/g, '-').replace(/--+/g, '-');

        if (!site.source) {
            console.log(`La source pour ${site.keyword} n'est pas définie. Passer à la boutique suivante.`);
            continue;
        }

        console.log(`-------- Processing site: ${site.keyword} --------`);

        const products = await extractProducts(page, site.source);

        const tasks = products.map((product, index) =>
            limit(async () => {
                console.log(`${site.keyword} - ${index + 1}/${products.length} `);

                let { description, productImage2, productImage3, productImage4, productImage5, reviewImages, reviews } = await extractProductDetails(product.productSource);


                //Formate des données extraites
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
                    à partir du titre suivant : ${product.productTitle}, \n
                    et da sa description Amazon : ${description} \n \n
                    Rédige au au format HTML la section détails du produit. \n
                    - N'intègre pas le titre du produit au début de la description \n
                    - N'intègre pas de balises <head> ou <body> \n
                    - Utilise des mots simples, clairs et concis \n
                    - Utilise des phrases courtes et des paragraphes aérés \n
                    - Utilise des sous-titres via les balises h2 et h3 pour structurer le texte \n
                    - Explicite les caractéristiques principales du produit\n
                    - Si tu n'as pas assez d'informations, invente des caractéristiques réalistes\n
                    - Ne laisse jamais "XX" ou "à compléter" dans le texte \n
                    Suis la structure suivante : \n
                    - Paragraphe d'introduction \n
                    - Liste à puces des avantages principaux du produit \n
                    - Tableau des caractéristiques du produit (minimum 8 caractéristiques)\n
                    - 4 Questions/réponses listées (balise h4 pour la question et balise p pour la réponse) \n
                    Réponds, uniquement avec la section détails rédigée rien d'autres !\n
                    Voici les détails du produit rédigé au format HTML : \n
                    \n\n
                `);

                description = description.replace(/```html/,'').replace(/```/,'')


                // Push les données dans le fichier JSON
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
                            productImage5: productImage5 ? productImage5.split('.').slice(0, -2).join('.') + '.' + productImage5.split('.').slice(-1) : null,
                            reviewImages: reviewImages,
                            reviews: reviews
                        });
                    } else {
                        console.warn(`${site.keyword} - ${index + 1}/Extraction error.`);
                    }
                }

                fs.writeFileSync('./products.json', JSON.stringify(productsData, null, 2));
            })
        );

        await Promise.all(tasks);
    }

    await browser.close();
}

main().catch(console.error);