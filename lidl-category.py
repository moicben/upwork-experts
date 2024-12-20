import requests
from bs4 import BeautifulSoup
import json
import time
import os
from dotenv import load_dotenv

load_dotenv()

def delay(seconds):
    time.sleep(seconds)

def extract_products_http(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')

    products = []
    for element in soup.select('.ods-tile'):
        product_source = element.select_one('a.ods-tile__link')['href'].strip() if element.select_one('a.ods-tile__link') else None
        product_image = element.select_one('.ods-image-gallery__image')['src'].strip() if element.select_one('.ods-image-gallery__image') else None
        product_title = element.select_one('.product-grid-box__title').text.strip() if element.select_one('.product-grid-box__title') else None
        product_price = (element.select_one('.m-price__price').text.strip() + element.select_one('.m-price__currency').text.strip()) if element.select_one('.m-price__price') and element.select_one('.m-price__currency') else None

        if product_source and product_title:
            products.append({
                'productSource': product_source,
                'productImage': product_image,
                'productTitle': product_title,
                'productPrice': product_price
            })
    print('Products extracted:', len(products))
    return products

def main():
    with open('./products.json', 'w') as f:
        json.dump({'products': []}, f, indent=2)

    with open('./categories.json', 'r') as f:
        categories = json.load(f)

    products_data = {'products': []}

    for category in categories['products']:
        url = category['productSource']  # Assuming the URL is stored in productDescription
        print(f'Processing category URL: {url}')

        products = extract_products_http(url)

        products_data['products'].extend(products)
        with open('./products.json', 'w') as f:
            json.dump(products_data, f, indent=2)

if __name__ == '__main__':
    main()
