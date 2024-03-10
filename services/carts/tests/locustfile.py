from locust import HttpUser, task, constant_throughput
from time import time_ns
import random

class User(HttpUser):
    service = "/carts"
    wait_time = constant_throughput(1)  # type: ignore

    @task
    def get_cart(self) -> None:
        email = "example@example.com"
        self.client.get(f"{self.service}/get?email={email}")

    @task
    def add_to_cart(self) -> None:
        email = "example@example.com"  # You can replace this with a valid email
        product_data = [
            {
                "product_id": str(time_ns()),
                "quantity": random.randint(1, 10)
            },
            {
                "product_id": str(time_ns()),
                "quantity": random.randint(1, 10)
            }
        ]
        self.client.post(f"{self.service}/add?email={email}", json=product_data)

    @task
    def remove_from_cart(self) -> None:
        email = "example@example.com"  
        product_id = "1" 
        self.client.post(f"{self.service}/remove?email={email}&product_id={product_id}")

