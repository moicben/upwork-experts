import requests
from bs4 import BeautifulSoup
import json
import os
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed

def extract_product_details(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Extract the title of the product
    title = soup.find('h1').get_text(strip=True)
    print("Product Title:", title)

    # Extract the price of the product
    price = soup.find('div', class_='m-price__price').get_text(strip=True)
    currency = soup.find('div', class_='m-price__currency').get_text(strip=True)
    print("Product Price:", price + currency)

    # Extract the product description
    description = soup.find('div', class_='info__content--legacy-de-styles info__content').decode_contents()
    print("Product Description:", description)

    # Extract all image URLs
    image_list = soup.find('ul', class_='m-slider__list')
    images = image_list.find_all('img')
    image_urls = [img['src'] for img in images]

    print("Image URLs:")
    for url in image_urls:
        print(url)

    return {
        "title": title,
        "price": price + currency,
        "description": description,
        "images": image_urls
    }

def main():
    parser = argparse.ArgumentParser(description='Extract product details from Lidl website.')
    parser.add_argument('json_file', type=str, help='Path to the JSON file containing product URLs')
    args = parser.parse_args()

    json_file = args.json_file

    if not os.path.isfile(json_file):
        print(f"File {json_file} does not exist.")
        return

    with open(json_file, 'r') as f:
        products_data = json.load(f)
        detailed_products = []

        with ThreadPoolExecutor(max_workers=10) as executor:
            future_to_url = {executor.submit(extract_product_details, "https://www.lidl.fr" + product['productSource']): product for product in products_data['products']}
            for future in as_completed(future_to_url):
                product = future_to_url[future]
                try:
                    detailed_product = future.result()
                    detailed_products.append(detailed_product)
                except Exception as exc:
                    print(f"Error extracting details for {product['productSource']}: {exc}")

        # Update the existing JSON file with detailed product data
        products_data['products'] = detailed_products
        with open(json_file, 'w') as df:
            json.dump(products_data, df, indent=2)

if __name__ == "__main__":
    main()