const { fork } = require('child_process');
const path = require('path');

function launchMultipleExecutions(scriptPath, numberOfExecutions) {
    for (let i = 0; i < numberOfExecutions; i++) {
        setTimeout(() => {
            const child = fork(scriptPath);

            child.on('message', (message) => {
                console.log(`Message from child ${i}:`, message);
            });

            child.on('error', (error) => {
                console.error(`Error from child ${i}:`, error);
            });

            child.on('exit', (code) => {
                console.log(`Child ${i} exited with code ${code}`);
            });
        }, i * 20000); // Différer chaque lancement de 10 secondes
    }
}

// Chemin vers le script à exécuter
const scriptPath = path.join(__dirname, process.argv[3]);

// Nombre d'exécutions simultanées
const numberOfExecutions = process.argv[2];

// Lancer les exécutions
launchMultipleExecutions(scriptPath, numberOfExecutions);