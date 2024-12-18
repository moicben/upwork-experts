const fs = require('fs');
const path = require('path');

const productsDir = '/Users/bendo/Desktop/Documents/Clapier-Lapin/Tech/ecom/products';

fs.readdir(productsDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        const filePath = path.join(productsDir, file);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }

            if (!data) {
                console.warn(`File ${filePath} is empty. Skipping.`);
                return;
            }

            let productsData;
            try {
                productsData = JSON.parse(data);
            } catch (err) {
                console.error('Error parsing JSON:', err);
                return;
            }

            let updated = false;
            productsData.products = productsData.products.map(product => {
                if (product.productImage && !product.productImage.endsWith('.jpg')) {
                    product.productImage += '.jpg';
                    updated = true;
                }
                return product;
            });

            if (updated) {
                fs.writeFile(filePath, JSON.stringify(productsData, null, 2), 'utf8', err => {
                    if (err) {
                        console.error('Error writing file:', err);
                    } else {
                        console.log(`Updated product images in ${file}`);
                    }
                });
            }
        });
    });
});