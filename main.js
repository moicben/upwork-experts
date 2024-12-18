const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const scripts = [
    path.resolve(__dirname, 'website-from-keyword.js'),
    path.resolve(__dirname, 'products-from-amazon.js'),
    path.resolve(__dirname, 'deploy-site.mjs')
];

const contentFilePath = path.resolve(__dirname, 'content.json');

function updateContentJson(keyword) {
    return new Promise((resolve, reject) => {
        fs.readFile(contentFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading content.json:', err);
                return reject(err);
            }

            let content;
            try {
                content = JSON.parse(data);
            } catch (parseErr) {
                console.error('Error parsing content.json:', parseErr);
                return reject(parseErr);
            }

            content.sites[0].keyword = keyword;

            fs.writeFile(contentFilePath, JSON.stringify(content, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to content.json:', writeErr);
                    return reject(writeErr);
                }
                resolve();
            });
        });
    });
}

function runScript(script) {
    return new Promise((resolve, reject) => {
        exec(`node ${script}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing ${script}:`, error);
                return reject(error);
            }
            console.log(`Output of ${script}:`, stdout);
            console.error(`Errors from ${script}:`, stderr);
            resolve();
        });
    });
}

function runScriptsSequentially() {
    return runScript(scripts[0])
        .then(() => runScript(scripts[1]))
        .then(() => runScript(scripts[2]));
}

function processKeywords(keywords) {
    let promise = Promise.resolve();

    keywords.forEach(keyword => {
        promise = promise
            .then(() => updateContentJson(keyword))
            .then(() => runScriptsSequentially())
            .catch(err => console.error('Error processing keyword:', keyword, err));
    });

    promise.then(() => console.log('All keywords processed successfully.'));
}

const keywords = fs.readFileSync('./keywords.txt', 'utf8').split('\n').filter(Boolean);
processKeywords(keywords);