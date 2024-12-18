const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'products');

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        fs.stat(filePath, (err, stats) => {
            if (err) {
                return console.log('Unable to get file stats: ' + err);
            }

            if (stats.size === 0) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        return console.log('Unable to delete file: ' + err);
                    }
                    console.log(`Deleted empty file: ${file}`);
                });
            }
        });
    });
});