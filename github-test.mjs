import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Définir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const parentDomain = 'radiateur-electrique.blog';
const builds = [
    { dir: 'accessoires-de-fitness-pas', branch: 'accessoires-de-fitness-pas', domain: `accessoires-de-fitness-pas.${parentDomain}` },
    { dir: 'abattants-et-lunettes-pour', branch: 'abattants-et-lunettes-pour', domain: `abattants-et-lunettes-pour.${parentDomain}` },
    // Ajoutez vos autres répertoires, branches et domaines ici
];

builds.forEach(build => {
    try {
        const buildPath = `${__dirname}/data/builds/${build.dir}`;
        
        // Check if the directory exists
        if (!existsSync(buildPath)) {
            throw new Error(`Directory ${buildPath} does not exist`);
        }

        // Navigate to the directory
        process.chdir(buildPath);

        // Initialize a new git repository if it is not already a git repository
        execSync('git init', { stdio: 'inherit' });

        // Check if the remote repository already exists
        try {
            execSync('git remote get-url origin', { stdio: 'inherit' });
            console.log(`Remote origin already exists for ${build.dir}`);
        } catch {
            // Add the remote repository if it does not exist
            execSync('git remote add origin https://github.com/moicben/ecom.git', { stdio: 'inherit' });
        }

        // Check if the branch exists locally
        try {
            execSync(`git rev-parse --verify ${build.branch}`, { stdio: 'inherit' });
            console.log(`Branch ${build.branch} already exists locally for ${build.dir}`);
        } catch {
            // Create the branch locally if it does not exist
            execSync(`git checkout -b ${build.branch}`, { stdio: 'inherit' });
            console.log(`Branch ${build.branch} created locally for ${build.dir}`);
        }

        // Add all files to the staging area
        execSync('git add .', { stdio: 'inherit' });

        // Check if there are changes to commit
        const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim();
        if (status) {
            // Commit the changes
            execSync(`git commit -m "Initial commit of ${build.dir} build"`, { stdio: 'inherit' });

            // Push the changes to the remote repository
            execSync(`git push -u origin ${build.branch}`, { stdio: 'inherit' });
        } else {
            console.log(`No changes to commit for ${build.dir}`);
        }

        // Add a CNAME file for the custom domain
        execSync(`echo ${build.domain} > CNAME`, { stdio: 'inherit' });
        execSync('git add CNAME', { stdio: 'inherit' });
        execSync('git commit -m "Add custom domain"', { stdio: 'inherit' });
        execSync(`git push origin ${build.branch}`, { stdio: 'inherit' });

        console.log(`Changes pushed successfully for ${build.dir} with domain ${build.domain}.`);
    } catch (error) {
        console.error(`Failed to push changes for ${build.dir}:`, error);
    }
});