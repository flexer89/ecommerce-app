from locust import HttpUser, task, constant_throughput
from time import time_ns
import random


class User(HttpUser):
    service = "/products"
    wait_time = constant_throughput(1)  # type: ignore

    @task
    def send_add_request(self) -> None:
        product_data = {
            "name": f"Test Product update {time_ns()}",
            "price": random.randint(1, 100),
            "quantity": random.randint(1, 100),
            "description": "Test description",
            "category": "uncategorized",
            "brand": "default",
            "images": [],
            "weight": random.uniform(0.1, 10.0),
            "dimensions": [random.uniform(1.0, 10.0) for _ in range(3)],
        }
        self.client.post(f"{self.service}/add", json=product_data)

    @task
    def send_update_request(self) -> None:
        product_data = {
            "price": random.randint(1, 100),
            "quantity": random.randint(1, 100),
            "description": "Test description",
            "category": "uncategorized",
            "brand": "default",
            "images": [],
            "weight": random.uniform(0.1, 10.0),
            "dimensions": [random.uniform(1.0, 10.0) for _ in range(3)],
        }
        self.client.patch(
            f"{self.service}/update/65e588bf2dc79d953066597a", json=product_data
        )

    @task
    def send_filter_request(self) -> None:
        product_data = {
            "category": "uncategorized",
        }
        self.client.post(f"{self.service}/filter", json=product_data)

    @task
    def send_get_request(self) -> None:
        self.client.get(f"{self.service}/get/65e588bf2dc79d953066597a")

    def send_get_all_request(self) -> None:
        self.client.get(f"{self.service}/get")
