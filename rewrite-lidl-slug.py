import json
import re
import requests
from bs4 import BeautifulSoup

# Load the JSON data
with open('categories.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Function to generate slug from product description
def generate_slug(description):
    # Extract the first part of the description before the colon or period
    match = re.match(r"([^:.\n]+)", description)
    if match:
        slug = match.group(1).strip().lower()
        # Replace spaces and special characters with hyphens
        slug = re.sub(r'\s+', '-', slug)
        slug = re.sub(r'[^a-z0-9\-]', '', slug)
        slug = re.sub(r'et-', '-', slug)
        slug = re.sub(r'pas-', '-', slug)
        slug = re.sub(r'de-', '-', slug)
        slug = re.sub(r'la-', '-', slug)
        slug = re.sub(r'le-', '-', slug)
        slug = re.sub(r'les-', '-', slug)
        slug = re.sub(r'un-', '-', slug)
        slug = re.sub(r'une-', '-', slug)
        slug = re.sub(r'du-', '-', slug)
        slug = re.sub(r'des-', '-', slug)
        slug = re.sub(r'au-', '-', slug)
        slug = re.sub(r'aux-', '-', slug)
        slug = re.sub(r'pour-', '-', slug)
        slug = re.sub(r'avec-', '-', slug)
        slug = re.sub(r'par-', '-', slug)
        slug = re.sub(r'plus-', '-', slug)
        slug = re.sub(r'moins-', '-', slug)
        slug = re.sub(r'que-', '-', slug)
        slug = re.sub(r'qui-', '-', slug)
        slug = re.sub(r'\---+', '-', slug)
        slug = re.sub(r'\--+', '-', slug)
        
        # Limit to maximum 4 words
        slug_parts = slug.split('-')[:4]
        return '-'.join(slug_parts)
    return None

# Generate slugs for each product and update the JSON data
for product in data['products']:
    description = product['productTitle']
    slug = generate_slug(description)
    if slug:
        product['slug'] = slug

# Save the updated JSON data back to the file
with open('categories.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=2)
    # URL of the page to scrape
    url = 'https://www.lidl.fr/h/visseuses-sans-fil-accessoires/h10018976?srsltid=AfmBOorpuxvqzyweJYklZSZeElazXhBITtBvhycWDHFHqIItrsRijNfM'

    # Send a GET request to the URL
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract the HTML content
        html_content = soup.prettify()
        
        # Print the HTML content
        print(html_content)
    else:
        print(f"Failed to retrieve the page. Status code: {response.status_code}")