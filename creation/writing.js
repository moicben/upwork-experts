const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const openai = require('openai');

// Fonction pour extraire des données spécifiques d'une URL
async function extractData(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Exemple de sélecteurs CSS pour extraire des données spécifiques
    const category = $('#zg > div > div > div:nth-child(2) > div > div > div:last-child > div:nth-child(2) > div:nth-child(1)').text().trim();
    const parent = $('#zg > div > div > div:nth-child(2) > div > div > div:last-child > div:first-child').text().trim();

    return {
        category: category,
        parent: parent
    };
}

// Fonction pour générer le contenu de la page d'accueil en utilisant l'API OpenAI
async function generateHomepageContent(data) {
    const prompt = `
    Pour la page d'accueil de ma boutique en ligne spécialisée pour les produits : ${data.category} ${data.parent} \n
    Tu vas devoir rédiger une série d'éléments de contenu précis. \n
    Chaque élément doit être unique et le plus singulier possible. \n
    Insiste sur la qualité Made in France et la pertinence de la boutique pour des acheteurs français. \n
    Voici la série d'éléments de contenu à rédiger : \n
    - Shop Name : Nom de la boutique en 2 mots clés \n
    - Hero Section : Titre accrocheur de quelques mots \n
    - Hero Section : Description de 2 phrases courtes pour la Hero Section \n
    - Hero Image : 3 mots clés pour décrire l'image de fond de la Hero Section \n
    - Intro Section : Titre accrocheur de quelques mots \n
    - Intro Section : Paragraphe de 3 phrases pour la Intro Section \n
    - About Section : Titre accrocheur de quelques mots \n
    - About Section : Paragraphe de 4 phrases pour la About Section \n
    - About Image : 3 mots clés pour décrire l'image de la About Section \n
    - Testimonial Autor 1 : Prénom et nom de famille français singulier  \n
    - Testimonial Content 1 : Commentaire de 3 phrases d'un client \n
    - Testimonial Autor 2 : Prénom et nom de famille français singulier  \n
    - Testimonial Content 2 : Commentaire de 3 phrases d'un client \n
    - Testimonial Autor 3 : Prénom et nom de famille français singulier  \n
    - Testimonial Content 3 : Commentaire de 3 phrases d'un client \n
    - Contact Title : Titre accrocheur pour la section Contact \n
    - Contact Description : Paragraphe de 2 phrases pour la section Contact \n
    - Footer Text : Texte de 2 phrases pour le footer \n
    `;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
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
    const data = await extractData(site.source);

    console.log('Processing website:', data);

    // Générer le contenu de la page d'accueil
    const homepageContent = await generateHomepageContent(data);

    // Parser le contenu généré et mettre à jour content.json
    const lines = homepageContent.split('\n').map(line => line.trim()).filter(line => line);
    site.shopName = lines[0].replace('Shop Name : ', '');
    site.heroTitle = lines[1].replace('Hero Section : ', '');
    site.heroDescription = lines[2].replace('Hero Section : ', '');
    site.heroImage = lines[3].replace('Hero Image : ', '');
    site.introTitle = lines[4].replace('Intro Section : ', '');
    site.introDescription = lines[5].replace('Intro Section : ', '');
    site.aboutTitle = lines[6].replace('About Section : ', '');
    site.aboutDescription = lines[7].replace('About Section : ', '');
    site.aboutImage = lines[8].replace('About Image : ', '');
    site.testimonial1 = lines[9].replace('Testimonial Autor 1 : ', '');
    site.author1 = lines[10].replace('Testimonial Content 1 : ', '');
    site.testimonial2 = lines[11].replace('Testimonial Autor 2 : ', '');
    site.author2 = lines[12].replace('Testimonial Content 2 : ', '');
    site.testimonial3 = lines[13].replace('Testimonial Autor 3 : ', '');
    site.author3 = lines[14].replace('Testimonial Content 3 : ', '');
    site.contactTitle = lines[15].replace('Contact Title : ', '');
    site.contactDescription = lines[16].replace('Contact Description : ', '');
    site.footerText = lines[17].replace('Footer Text : ', '');

    // Écrire les modifications dans content.json
    fs.writeFileSync('content.json', JSON.stringify(content, null, 2), 'utf8');
}

main();