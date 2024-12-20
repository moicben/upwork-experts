import requests
from bs4 import BeautifulSoup

def extract_product_details(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Extract the title of the product
    title = soup.find('body').get_text(strip=True)
    print("Product Title:", title)

    return {
        "title": title
    }

if __name__ == "__main__":
    url = "https://www.amazon.fr/Compatible-Canon-Cartouche-dencre-magenta/dp/B00XVUA4U2/ref=sr_1_2_sspa?dib=eyJ2IjoiMSJ9._7-UnfnenxFoxmoS56L0CoNr4AeeJGjNhZamdJp8505fVzJQSAK3y864hS7WkW7ATYS_3ZxhpP7i8W5iQqJH1PPUsZEHDfZgrMSQ340XHP6uIApPOMJ4RdCx0j7H1yhs-d5E19tPxshjQ5SZ2t7fJNxK5a5-eKazNXZHUJxK5jZYtlwi4y4VXLIdkps8efPMiqqkIIj1P9QRzDe6OA42DgjOxBiKwYfeqFVECAsNd2hSj24LMmHphYugJaFtfJ6De6ZSHh73fx-L5pZDuWWTuq45CF8OqxrZPQE12Qxl5s0.nLnKuvYL_cuLxgalbEwVmUDZ2C_t8jwNnI5EYNWhwg8&dib_tag=se&keywords=cartouche+encre+canon&nsdOptOutParam=true&qid=1734647774&sr=8-2-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1"
    extract_product_details(url)
