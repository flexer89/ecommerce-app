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
        
    @task(3)
    def create_shipment(self):
        self.client.post(
            "/api/shipments/create",
            headers={"Authorization": f"{self.token}"},
            json= {
                "order_id": 1,
                "user_id": self.user_id,
                "shipment_address": "Plac Defilad 1",
                "current_location": "Plac Defilad 1",
                "status": "pending",
                "company": "DPD",
            }
        )
        
    @task(5)
    def get_shipments_by_user(self):
        self.client.get(f"/api/shipments/getbyuser/{self.user_id}", headers={"Authorization": f"{self.token}"})
        
    @task(5)
    def get_shipments_by_order(self):
        self.client.get(f"/api/shipments/getbyorder/1", headers={"Authorization": f"{self.token}"})
        
    @task(1)
    def update_shipment(self):
        self.client.patch(
            "/api/shipments/update/1",
            headers={"Authorization": f"{self.token}"},
            json= {
                "shipment_address": "Plac Defilad 1",
                "current_location": "Plac Defilad 1",
                "status": "delivered",
            }
        )