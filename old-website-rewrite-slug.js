const fs = require('fs');
const path = require('path');

const contentPath = path.join(__dirname, 'content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

content.sites.forEach(site => {
    site.slug = site.keyword.toLowerCase()
        .replace(/ de/, '')
        .replace(/ la/, '')
        .replace(/ le/, '')
        .replace(/l /, '')
        .replace(/ /g, '-')
        .replace(/é/g, 'e')
        .replace(/è/g, 'e')
        .replace(/ê/g, 'e')
        .replace(/à/g, '')
        .replace(/[^\w-]+/g, '')
        .replace(/---+/g, '-')
        .replace(/--+/g, '-');
});

fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf8');