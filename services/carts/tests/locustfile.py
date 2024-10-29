from random import randint
from locust import HttpUser, between, task
from keycloak import KeycloakAdmin, KeycloakOpenIDConnection

KC_URL = "https://auth.jolszak.test"
KC_REALM = "jolszak"
KC_CLIENT_ID = "python"
KC_CLIENT_SECRET = "python-secret"

keycloak_connection = KeycloakOpenIDConnection(
    server_url=f"{KC_URL}",
    username="test@admin.org",
    password="Admin222@",
    realm_name=KC_REALM,
    user_realm_name=KC_REALM,
    client_id=KC_CLIENT_ID,
    client_secret_key=KC_CLIENT_SECRET,
    verify=False,
)

keycloak_admin = KeycloakAdmin(connection=keycloak_connection)


def create_test_user():
    """Simulates the creation of a test user"""
    email = f"user{randint(1, 100000)}@example.com"
    user_payload = {
        "username": email,
        "email": email,
        "firstName": email.split("@")[0],
        "lastName": email.split("@")[0],
        "enabled": True,
        "emailVerified": True,
        "attributes": {
            "phoneNumber": [f"{randint(100000000, 999999999)}"],
            "City": ["Warszawa"],
            "Address": ["Plac Defilad 1"],
            "PostCode": ["00-901"],
            "voivodeship": ["mazowieckie"],
        },
        "credentials": [
            {"type": "password", "value": "Password123@", "temporary": False}
        ],
    }
    return keycloak_admin.create_user(user_payload)


def generate_cart_items():
    return {
        "items": [
            {
                "id": randint(1, 1000),
                "name": f"Product-{randint(1, 1000)}",
                "price": round(randint(50, 200) + randint(0, 99) / 100, 2),
                "discount": randint(0, 1),
                "weight": round(randint(1, 10) + randint(0, 99) / 100, 2),
                "quantity": randint(1, 5),
            }
        ]
    }


class CartBehavior(HttpUser):
    wait_time = between(1, 3)
    user_id = None

    def on_start(self):
        self.user_id = create_test_user()
        self.client.verify = False

        self.client.post(
            f"/api/carts/add/{self.user_id}",
            json={
                "items": [
                    {
                        "id": randint(1, 1000),
                        "name": f"Product-{randint(1, 1000)}",
                        "price": round(randint(50, 200) + randint(0, 99) / 100, 2),
                        "discount": randint(0, 1),
                        "weight": round(randint(1, 10) + randint(0, 99) / 100, 2),
                        "quantity": randint(1, 5),
                    }
                ]
            },
        )

    @task(1)
    def add_items_to_cart(self):
        cart_items = generate_cart_items()
        self.client.post(f"/api/carts/add/{self.user_id}", json=cart_items)

    @task(20)
    def get_cart(self):
        self.client.get(f"/api/carts/get/{self.user_id}")

    @task(1)
    def remove_item_from_cart(self):
        remove_request = {
            "product_id": randint(1, 1000),
            "weight": round(randint(1, 10) + randint(0, 99) / 100, 2),
            "quantity": randint(1, 3),
        }
        self.client.post(f"/api/carts/remove/{self.user_id}", json=remove_request)

    def on_stop(self):
        self.client.delete(f"/delete/{self.user_id}")
