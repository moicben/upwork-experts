const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const OpenAI = require('openai');
const { createClient } = require('pexels');
const { argv } = require('process');
require('dotenv').config();

// Configurez votre clé API OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const client = createClient('TjDN5QoTIHZDUnsn72QTd8AUZZOa8ctXqmGdfiqU7dM2OoSwLdAchoa5');

// Fonction pour générer le contenu de la page d'accueil en utilisant l'API OpenAI
async function generateHomepageContent(keyword, description) {
    const prompt = `
    Pour la page d'accueil de ma boutique en ligne spécialisée pour : ${keyword} \n
    Description du produit : ${description} \n
    Tu vas devoir rédiger une série d'éléments de contenu précis. \n
    Chaque élément doit être unique et le plus singulier possible. \n
    Insiste sur la qualité Made in France et la pertinence de la boutique pour des acheteurs français. \n
    Voici la série d'éléments de contenu à rédiger : \n
    - Shop Name : Nom de la boutique en 2 mots clés \n
    - Hero Section : Titre accrocheur de quelques mots commençant par ${keyword} (6 ou 7 mots)\n
    - Hero Section : Description de 2 phrases courtes pour la Hero Section \n
    - Hero Image : 2 mots en rapport avec les produits de la boutique. \n
    - Titre accrocheur pour introduire la boutique en quelques mots.\n
    - Paragraphe d'introduction de la boutique attraytant de 3 phrases. \n
    - Titre accrocheur d'une phrase très courte pour la section à propos. \n
    - Paragraphe de 4 phrases pour la section à propos. \n
    - About Image : 2 mots en rapport avec la boutique.\n
    - Testimonial Autor 1 : Prénom et nom de famille français singulier  \n
    - Testimonial Content 1 : Commentaire long de 3 phrases d'un client \n
    - Testimonial Autor 2 : Prénom et nom de famille français singulier  \n
    - Testimonial Content 2 : Commentaire long de 3 phrases d'un client \n
    - Testimonial Autor 3 : Prénom et nom de famille français singulier  \n
    - Testimonial Content 3 : Commentaire long de 3 phrases d'un client \n
    - Titre de 3 à 5 mots pour la sectin contact. \n
    - Paragraphe de 2 phrases pour la section Contact \n
    - Footer Text : Texte de 2 phrases pour le footer \n
    - Couleur de fond foncé pour les boutons : Code héxadécimal \n
    - Court paragraphe SEO pour introduire les produits de la boutique \n
    \n
    Rédige uniquement les éléments de contenu demandés, rien d'autres \n
    N'inclus aucunes indications dans ta rédaction \n
    N'inclus aucunes balises HTML ou CSS \n
    N'inclus pas le nom des éléments de contenu \n
    Voici les éléments de contenu rédigés : \n
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Tu es un assistant français specialisé en rédaction de site e-commerce singulier et attrayant. ' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2000
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating homepage content:', error);
        throw error;
    }
}

// Fonction pour rechercher une image sur Pexels
async function searchImage(keywords) {
    const query = keywords;
    try {
        const response = await client.photos.search({
            query, per_page: 1,
            //orientation: 'landscape',
            per_page: 1,
        });

        if (response.photos.length > 0) {
            return response.photos[0].src.large;
        }
        return '';
    } catch (error) {
        console.error('Error searching image:', error);
        return '';
    }
}

// Fonction principale
async function main() {
    

    // Lire le fichier categories.json
    const categories = JSON.parse(fs.readFileSync('./data/castorama/categories.json', 'utf8'));

    for (let i = 0; i < categories.results.length; i++) {
        const category = categories.results[i];
        const contentFilePath = `./data/castorama/websites/${category.categorySlug}.json`;
        
        if (fs.existsSync(contentFilePath)) {
            console.log(`${i + 1}/${categories.results.length} - Already exists`);
            continue;
        }
        console.log(`${i + 1}/${categories.results.length} - ${category.categorySlug}`);

        try {
            // Générer le contenu de la page d'accueil
            const homepageContent = await generateHomepageContent(category.categoryKeyword, category.categoryDescription);

            // Parser le contenu généré et mettre à jour content.json
            const lines = homepageContent.split('\n').map(line => line.trim()).filter(line => line);
            const site = {
                keyword: category.categoryKeyword,
                keywordPlurial: category.categoryKeyword.replace(/ /, 's ').replace(/ss/, 's'),
                slug: category.categorySlug,
                source: category.categorySource,
                shopName: lines[0],
                heroTitle: lines[1],
                heroDescription: lines[2],
                heroImageKeywords: lines[3],
                introTitle: lines[4],
                introDescription: lines[5],
                aboutTitle: lines[6],
                aboutDescription: lines[7],
                aboutImageKeywords: lines[8],
                testimonial1: lines[9],
                author1: lines[10],
                testimonial2: lines[11],
                author2: lines[12],
                testimonial3: lines[13],
                author3: lines[14],
                contactTitle: lines[15],
                contactDescription: lines[16],
                footerText: lines[17],
                buttonColor: lines[18],
                productsDescription: lines[19],
                heroImageUrl: await searchImage(lines[3])
            };

            fs.writeFileSync(contentFilePath, JSON.stringify({ sites: [site] }, null, 2), 'utf8');
        } catch (error) {
            console.error(`Error processing category ${category.categorySlug}:`, error);
            continue;
        }
    }
}

main();