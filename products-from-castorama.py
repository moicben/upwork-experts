import requests
from bs4 import BeautifulSoup
import json
import os
import time
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor

load_dotenv()

def load_cookies():
    with open('./cookies/manomano.json', 'r', encoding='utf8') as f:
        cookies = json.load(f)
    return {cookie['name']: cookie['value'] for cookie in cookies}

def scroll_to_bottom(session, url):
    response = session.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    return soup

def extract_products(session, url, category):
    soup = scroll_to_bottom(session, url)

    domain = 'https://www.castorama.fr'

    products = []
    for element in soup.select('li.b9bdc658'):
        product_source = domain + element.select_one('a')['href'].strip() if element.select_one('a') else None
        product_image = element.select_one('img')['src'].strip() if element.select_one('img') else None
        product_title = element.select_one('p.ccb9d67a._17d3fa36.c83f0b12._23ee746f._4fd271c8.df59bc7a.cc6bbaee').text.strip() if element.select_one('p.ccb9d67a._17d3fa36.c83f0b12._23ee746f._4fd271c8.df59bc7a.cc6bbaee') else None
        product_price = element.select_one('._5d34bd7a').text.strip() if element.select_one('._5d34bd7a') else None

        if product_source and product_title:
            products.append({
                'productSource': product_source,
                'productImage': product_image,
                'productTitle': product_title,
                'productPrice': product_price
            })

    print(f"{len(products)} products")
    return products

def extract_product_details(session, url):
    try:
        print(f"Fetching URL: {url}")
        response = session.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        title = soup.select_one('h1').text.strip() if soup.select_one('h1') else 'N/A'
        price_element = soup.select_one('span.ETmrsv')
        price = price_element.text.strip() if price_element else 'N/A'
        original_price = price
        price = price.replace('€', '').replace('\u20ac', '')
        try:
            price = float(price)
            price = price - price * 0.2
            decimal_values = [0.29, 0.49, 0.79, 0.99]
            random_decimal = decimal_values[int(time.time()) % len(decimal_values)]
            price = int(price) + random_decimal
        except ValueError:
            price = original_price

        description_element = soup.select_one('div.Ssfiu- o2c_dC yBr4ZN')
        description = description_element.decode_contents() if description_element else 'N/A'
        description_soup = BeautifulSoup(description, 'html.parser')
        for img in description_soup.find_all('img'):
            img.decompose()
        for a in description_soup.find_all('a'):
            a.attrs.pop('href', None)
        description = str(description_soup)

        image_urls = [img['src'] for img in soup.select('ul.m-slider__list img')]

        reviews = []
        for review in soup.select('div.jPgt-8'):
            review_title = review.select_one('header.f3d7kV').text.strip() if review.select_one('header.f3d7kV') else None
            review_description = review.select_one('div.duBtRc.c1sdlQn').text.strip() if review.select_one('div.duBtRc.c1sdlQn') else None
            if review_title and review_description:
                reviews.append({'title': review_title, 'description': review_description})

        slug = title.lower().replace(' ', '-').replace('/', '').replace("'", '').replace('(', '').replace(')', '').replace('---', '').replace('--', '-')

        return {
            'productSource': url,
            'productTitle': title,
            'productPrice': f"{price}€" if price != 'N/A' else 'N/A',
            'productDescription': description,
            'productImages': image_urls,
            'productReviews': reviews,
            'slug': slug
        }
    except Exception as error:
        print(f"Error fetching URL {url}: {error}")
        return None

def process_category(category, index, total, processed_urls):
    session = requests.Session()
    session.cookies.update(load_cookies())

    url = category['categorySource']

    if url in processed_urls:
        print(f"Skipping already processed URL: {url}")
        return

    print(f"{index + 1}/{total} - {category['categorySlug']}")

    category_file_name = f"./data/castorama/products/{category['categorySlug']}.json"

    if os.path.exists(category_file_name):
        print('File already exists')
        return

    os.makedirs(os.path.dirname(category_file_name), exist_ok=True)

    products = extract_products(session, url, category)
    products_data = {'products': []}

    for product in products:
        product_details = extract_product_details(session, product['productSource'])
        if product_details:
            products_data['products'].append(product_details)

    with open(category_file_name, 'w', encoding='utf8') as f:
        json.dump(products_data, f, indent=2)

    processed_urls.add(url)

def main():
    with open('./data/castorama/categories.json', 'r', encoding='utf8') as f:
        categories = json.load(f)

    lot_size = (len(categories['results']) + 2) // 3  # Adjusted to ensure all categories are included
    lots = [categories['results'][i * lot_size:(i + 1) * lot_size] for i in range(3)]

    processed_urls = set()

    with ThreadPoolExecutor(max_workers=3) as executor:
        for lot in lots:
            for index, category in enumerate(lot):
                executor.submit(process_category, category, index, len(categories['results']), processed_urls)

if __name__ == '__main__':
    main()