import requests
from bs4 import BeautifulSoup
import json
import os
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import random

def extract_product_details(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Extract the title of the product
    title = soup.find('h1').get_text(strip=True) if soup.find('h1') else 'N/A'
    print("Product Title:", title)

    # Extract the price of the product
    price = soup.find('div', class_='m-price__price').get_text(strip=True) if soup.find('div', class_='m-price__price') else 'N/A'
    currency = soup.find('div', class_='m-price__currency').get_text(strip=True) if soup.find('div', class_='m-price__currency') else ''
    print("Product Price:", price + currency)

    # Extract the product description
    description = soup.find('div', class_='info__content--legacy-de-styles info__content').decode_contents() if soup.find('div', class_='info__content--legacy-de-styles info__content') else 'N/A'
    print("Product Description:", description)

    # Extract all image URLs
    image_list = soup.find('ul', class_='m-slider__list')
    images = image_list.find_all('img') if image_list else []
    image_urls = [img['src'] for img in images]

    # Extract all reviews
    reviews_list = soup.find('ol', class_='rating-list__rating--sort-STARS_DESC')
    reviews = reviews_list.find_all('div', class_='rating__wrapper') if reviews_list else []
    review_titles = [review.find('span', class_='rating__review-title').get_text(strip=True) for review in reviews if review.find('span', class_='rating__review-title')]
    review_descriptions = [review.find('span', class_='read-more__text').get_text(strip=True) for review in reviews if review.find('span', class_='read-more__text')]

    # Remove \u20ac in price
    original_price = price
    price = price.replace('\u20ac', '')

    try:
        # Lower the price by 20%
        price = price.replace('€', '')
        price = float(price)
        price = price - price * 0.2

        # Randomly set the decimal values
        decimal_values = [0.29, 0.49, 0.79, 0.99]
        random_decimal = random.choice(decimal_values)
        price = int(price) + random_decimal
    except ValueError:
        price = original_price

    slug = title.lower().replace(' ', '-').replace('/', '-').replace('\'', '').replace('(', '').replace(')', '').replace('---','').replace('--', '-') 
    

    return {
        "productSource": url,
        "productTitle": title,
        "productPrice": f"{price}{currency}" if price != 'N/A' else 'N/A',
        "productDescription": description,
        "productImages": image_urls,
        "productReviews": [{"title": t, "description": d} for t, d in zip(review_titles, review_descriptions)],
        "slug": slug
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

        with ThreadPoolExecutor(max_workers=20) as executor:
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