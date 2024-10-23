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

def get_token():
    return keycloak_admin.token["access_token"]

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


class UserBehavior(HttpUser):
    wait_time = between(1, 3)
    user_id = None

    def on_start(self):
        self.client.verify = False
        self.token = get_token()
        self.user_id = create_test_user()

    def on_request(self, request, **kwargs):
        if request.url.startswith("/api"):
            self.token = get_token()

    @task(5)
    def get_user_orders(self):
        self.client.get(f"/api/orders/getbyuser/{self.user_id}", headers={"Authorization": f"{self.token}"})

    @task(5)
    def create_order(self):
        self.client.post(
            "/api/orders/create",
            headers={"Authorization": f"{self.token}"},
            json= {
                "user_id": self.user_id,
                "items": [
                    {"id": 1, "quantity": 2, "price": 50.0, "weight": 500},
                    {"id": 2, "quantity": 1, "price": 50.0, "weight": 500},
                ],
                "total_price": 100.0,
            }
        )
        
    @task(2)
    def get_order_by_id(self):
        self.client.get(f"/api/orders/get/1", headers={"Authorization": f"{self.token}"})
        
    @task(10)
    def get_bestsellers(self):
        self.client.get("/api/orders/bestsellers", headers={"Authorization": f"{self.token}"})
    
    def on_stop(self):
        keycloak_admin.delete_user(self.user_id)
