import requests
import time
import random


def send_random_request():
    base_url = "https://jolszak.fun"
    endpoints = [
        "/add",
        "/get",
        "/get/65e217135ab61e3d18a197ea",
        "/update/65e217135ab61e3d18a197ea",
        "/filter",
    ]

    while True:
        endpoint = random.choice(endpoints)
        url = f"{base_url}/products{endpoint}"

        if "add" in endpoint or "update" in endpoint or "filter" in endpoint:
            product_data = {
                "name": f"Test Product update {random.randint(1, 100)}",
                "price": random.randint(1, 100),
                "quantity": random.randint(1, 100),
                "description": "Test description",
                "category": "uncategorized",
                "brand": "default",
                "images": [],
                "weight": random.uniform(0.1, 10.0),
                "dimensions": [random.uniform(1.0, 10.0) for _ in range(3)],
            }
            if "update" in endpoint:
                response = requests.put(url, json=product_data)
            else:
                response = requests.post(url, json=product_data)
        else:
            response = requests.get(url)

        print(f"Sent request to {url}, status code: {response.status_code}")

        time.sleep(random.uniform(0.05, 0.1))


send_random_request()
