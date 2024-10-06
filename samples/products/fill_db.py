import json
import os
import tempfile

import requests
from PIL import Image

# URL of your FastAPI endpoint
url = "http://localhost:5000/create"

# Path to your JSON file containing product data
json_file_path = "samples/products/products.json"


def load_products(json_file):
    with open(json_file, "r", encoding="utf-8") as file:
        return json.load(file)


def resize_image(image_path, scale_factor=0.5):
    """Resize the image by the given scale factor and save to a tempora ry file."""
    try:
        img = Image.open(image_path)
        new_size = (int(img.width * scale_factor), int(img.height * scale_factor))
        resized_img = img.resize(new_size, Image.ANTIALIAS)

        # Create a temporary file for the resized image
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        resized_img.save(temp_file.name)

        return temp_file.name
    except Exception as e:
        print(f"Error resizing image: {e}")
        return None


def upload_product(product):
    product_data = {
        "name": product["name"],
        "description": product["description"],
        "price": product["price"],
        "stock": product["stock"],
        "discount": product["discount"],
        "category": product["category"],
    }

    image_file = None
    if product.get("image_path"):
        image_path = product["image_path"]

        if os.path.exists(image_path):
            # Resize the image to half the original size
            resized_image_path = resize_image(image_path)
            if resized_image_path:
                image_file = open(resized_image_path, "rb")
            else:
                print(f"Failed to resize image: {image_path}")
                return
        else:
            print(f"Image file not found: {image_path}")
            return

    files = {"image": image_file}

    response = requests.post(url, data=product_data, files=files)

    if image_file:
        image_file.close()

    if response.status_code == 201:
        print(f"Successfully uploaded product: {product['name']}")
    else:
        print(
            f"Failed to upload product: {product['name']}. Status Code: {response.status_code}"
        )
        print(response.text)


def main():
    products = load_products(json_file_path)
    for product in products:
        upload_product(product)


if __name__ == "__main__":
    main()
