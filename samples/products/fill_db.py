import requests
import json
import os

# URL of your FastAPI endpoint
url = "http://localhost:5000/products/create"

# Path to your JSON file containing product data
json_file_path = "samples\products\products.json"

def load_products(json_file):
    with open(json_file, "r", encoding="utf-8") as file:
        return json.load(file)

def upload_product(product):
    product_data = {
        "name": product["name"],
        "description": product["description"],
        "price": product["price"],
        "stock": product["stock"],
        "discount": product["discount"],
        "category": product["category"]
    }

    image_file = None
    if product.get("image_path"):
        image_path = product["image_path"]
        
        if os.path.exists(image_path):
            image_file = open(image_path, "rb")
        else:
            print(f"Image file not found: {image_path}")
            return

    files = {
        "image": image_file
    }

    #response = requests.post(url, data=product_data, files=files)

    if image_file:
        image_file.close()

    # if response.status_code == 200:
    #     print(f"Successfully uploaded product: {product['name']}")
    # else:
    #     print(f"Failed to upload product: {product['name']}. Status Code: {response.status_code}")
    #     print(response.text)

def main():
    products = load_products(json_file_path)
    print(len(products))
    # for product in products:
    #     upload_product(product)

if __name__ == "__main__":
    main()
