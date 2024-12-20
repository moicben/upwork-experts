import json
import re

# Load the JSON data
with open('products.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Function to generate slug from product title
def generate_slug(title):
    slug = title.strip().lower()
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'[^a-z0-9\-]', '', slug)
    return slug

# Function to reformat product data
def reformat_product(product, product_id):
    return {
        "id": product_id,
        "productSource": "",  # Assuming no source URL available
        "productImage": product['images'][0] if product['images'] else None,
        "productTitle": product['title'],
        "productPrice": product['price'],
        "slug": generate_slug(product['title']),
        "description": product['description'],
        "productImage2": product['images'][1] if len(product['images']) > 1 else None,
        "productImage3": product['images'][2] if len(product['images']) > 2 else None,
        "productImage4": product['images'][3] if len(product['images']) > 3 else None,
        "productImage5": product['images'][4] if len(product['images']) > 4 else None,
        "reviewImages": product['images'][5:] if len(product['images']) > 5 else [],
        "reviews": []  # Assuming no reviews available
    }

# Reformat each product and update the JSON data
reformatted_products = []
for idx, product in enumerate(data['products']):
    reformatted_products.append(reformat_product(product, idx + 1))

# Create the new data structure
new_data = {
    "products": reformatted_products
}

# Save the updated JSON data back to the file
with open('products.json', 'w', encoding='utf-8') as file:
    json.dump(new_data, file, ensure_ascii=False, indent=2)