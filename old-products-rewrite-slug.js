const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, 'products');

fs.readdirSync(productsDir).forEach(file => {
    if (path.extname(file) === '.json') {
        const filePath = path.join(productsDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        content.products.forEach(product => {
            if (product.keyword) {
                product.slug = product.keyword.toLowerCase()
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
            } else {
                console.warn(`Product in file ${file} is missing 'keyword' property.`);
            }
        });

        const newFileName = `${content.products[0].slug}.json`;
        const newFilePath = path.join(productsDir, newFileName);

        fs.writeFileSync(newFilePath, JSON.stringify(content, null, 2), 'utf8');
        fs.unlinkSync(filePath); // Supprimer l'ancien fichier
    }
});