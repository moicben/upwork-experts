import requests
from bs4 import BeautifulSoup, MarkupResemblesLocatorWarning
import json
import os
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import random
import openai
import warnings

# Ignore the MarkupResemblesLocatorWarning
warnings.filterwarnings("ignore", category=MarkupResemblesLocatorWarning)

def extract_product_details(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return None

    soup = BeautifulSoup(response.content, 'html.parser')

    # Extract the title of the product
    title = soup.find('h1').get_text(strip=True) if soup.find('h1') else 'N/A'
    openai.api_key = os.getenv("OPENAI_API_KEY")

    def simplify_title(title):
        prompt = f"""
        Simplifie le titre suivant pour optimiser le SEO et SXO en respectant les critères :\n
        - Max 65 caractères \n
        - Sans le mot Amazon, caractères spéciaux, ou mots anglais \n
        - Ne supprime pas ses caractéristiques ou détails importants.\n
        - Format : mot-clé principal au début, 1 majuscule\n
        - Utilise des mots-clés pertinents pour le référencement\n
        Titre : {title}
        \n\n
        Réponds, uniquement avec le titre de rédigé rien d'autres !\n
        Voici le titre du produit mis à jour : \n
        """
        try:
            response = openai.Completion.create(
                engine="gpt-4o-mini",
                prompt=prompt,
                max_tokens=80,
                n=1,
                stop=None,
                temperature=0.5,
            )
            return response.choices[0].text.strip()
        except openai.OpenAIError as e:
            print(f"Error with OpenAI API: {e}")
            return title

    title = simplify_title(title)

    # Extract the price of the product
    price = soup.find('div', class_='m-price__price').get_text(strip=True) if soup.find('div', class_='m-price__price') else 'N/A'
    currency = soup.find('div', class_='m-price__currency').get_text(strip=True) if soup.find('div', class_='m-price__currency') else ''
    original_price = price
    price = price.replace('\u20ac', '').replace('€', '')
    try:
        price = float(price)
        price = price - price * 0.2
        decimal_values = [0.29, 0.49, 0.79, 0.99]
        random_decimal = random.choice(decimal_values)
        price = int(price) + random_decimal
    except ValueError:
        price = original_price

    # Extract the product description
    description = soup.find('div', class_='info__content--legacy-de-styles info__content').decode_contents() if soup.find('div', class_='info__content--legacy-de-styles info__content') else 'N/A'
    description_soup = BeautifulSoup(description, 'html.parser')
    for img_tag in description_soup.find_all('img'):
        img_tag.decompose()
    for a_tag in description_soup.find_all('a'):
        a_tag.attrs.pop('href', None)
    description = str(description_soup)

    # Extract all image URLs
    image_list = soup.find('ul', class_='m-slider__list')
    images = image_list.find_all('img') if image_list else []
    image_urls = [img['src'] for img in images]

    # Extract all reviews
    reviews_list = soup.find('ol', class_='rating-list__rating--sort-STARS_DESC')
    reviews = reviews_list.find_all('div', class_='rating__wrapper') if reviews_list else []
    review_titles = [review.find('span', class_='rating__review-title').get_text(strip=True) for review in reviews if review.find('span', class_='rating__review-title')]
    review_descriptions = [review.find('span', class_='read-more__text').get_text(strip=True) for review in reviews if review.find('span', class_='read-more__text')]

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
                    if detailed_product:
                        detailed_products.append(detailed_product)
                except Exception as exc:
                    print(f"Error extracting details for {product['productSource']}: {exc}")

        products_data['products'] = detailed_products
        with open(json_file, 'w') as df:
            json.dump(products_data, df, indent=2)

if __name__ == "__main__":
    main()