from random import choice

from locust import HttpUser, between, task


class UserBehavior(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        self.client.verify = False

    @task(10)
    def get_products(self):
        category = choice(["arabica", "robusta", ""])
        maxPrice = choice([0, 20, 40, 60, 80, 100, 120, 140])
        if category and maxPrice:
            self.client.get(
                f"/api/products/get?limit=20&offset=0&category={category}&maxPrice={maxPrice}"
            )
        elif category:
            self.client.get(f"/api/products/get?limit=20&offset=0&category={category}")
        elif maxPrice:
            self.client.get(f"/api/products/get?limit=20&offset=0&maxPrice={maxPrice}")
        else:
            self.client.get(f"/api/products/get?limit=20&offset=0")

    @task(10)
    def get_product_by_id(self):
        self.client.get("/api/products/getbyid/1")

    @task(10)
    def download_images(self):
        self.client.get("/api/products/download/images?product_ids=1%2C2%2C3%2C4%2C5")

    @task(5)
    def download_binary_image(self):
        self.client.get("/api/products/download/bin/1")

    @task(5)
    def get_categories(self):
        self.client.get("/api/products/categories")
