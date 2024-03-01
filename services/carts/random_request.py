import requests
import random
import time


def send_random_request():
    base_url = "https://jolszak.fun"
    endpoints = ["/get", "/add", "/remove", "/delete"]
    emails = ["test@example.com", "user@example.com"]

    while True:
        endpoint = random.choice(endpoints)
        url = f"{base_url}/carts{endpoint}"

        if endpoint == "/get":
            email = random.choice(emails)
            response = requests.get(url, params={"email": email})

        elif endpoint == "/add":
            email = random.choice(emails)
            items = [
                {
                    "product_id": str(random.randint(1, 100)),
                    "quantity": random.randint(1, 10),
                }
            ]
            response = requests.post(url, params={"email": email}, json=items)

        elif endpoint == "/remove":
            email = random.choice(emails)
            product_id = str(random.randint(1, 100))
            response = requests.post(
                url, params={"email": email, "product_id": product_id}
            )

        elif endpoint == "/delete":
            email = random.choice(emails)
            response = requests.delete(url, params={"email": email})

        print(f"Sent request to {url}, status code: {response.status_code}")
        time.sleep(random.uniform(0.05, 0.1))


send_random_request()
