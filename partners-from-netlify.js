const fetch = require('node-fetch');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;

if (!NETLIFY_API_TOKEN) {
    throw new Error('Netlify API token is not defined');
}

const fetchSites = async () => {
    try {
        //console.log('Fetching sites from Netlify...');
        const response = await fetch('https://api.netlify.com/api/v1/sites', {
            headers: {
                'Authorization': `Bearer ${NETLIFY_API_TOKEN}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const sites = await response.json();
        //console.log('Sites fetched:', sites);
        const partnersData = sites.map(site => ({
            name: site.name.replace(/-/g, ' ').replace(/expert francais shop/,'').replace(/\b\w/g, char => char.toUpperCase()),
            url: site.ssl_url || site.url
        }));
        fs.writeFileSync('partners.json', JSON.stringify(partnersData, null, 2));
        //console.log('partners.json has been saved.');
    } catch (error) {
        console.error('Error fetching sites from Netlify:', error.message);
    }
};

fetchSites();