import requests
from bs4 import BeautifulSoup

url = 'https://www.lidl.fr/h/bricolage/h10018559?pageId=10018559'

response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# Extract the title of the product
body = soup.find('body').get_text(strip=True)
print("body:", body)

products = []

for product in soup.find_all('div', class_='ods-tile__inner'):
    name = product.find('div', class_='product-grid-box__title').get_text(strip=True)
    price = product.find('div', class_='m-price__price').get_text(strip=True)
    products.append({'name': name, 'price': price})

for product in products:
    print(f"Product Name: {product['name']}, Price: {product['price']}")