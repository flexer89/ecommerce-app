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


class UserBehavior(HttpUser):
    wait_time = between(1, 3)
    user_id = None

    def on_start(self):
        self.user_id = create_test_user()

    @task(2)
    def get_user_data(self):
        """Simulates the GET /get/{user_id} endpoint to retrieve user data"""
        with self.client.get(f"/get/{self.user_id}", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed to retrieve user data: {response.text}")

    @task(1)
    def update_user_data(self):
        """Simulates the PATCH /update/{user_id} endpoint to update user data"""
        update_payload = {
            "firstName": "Updated",
            "lastName": "User",
            "attributes": {
                "phoneNumber": "987654321",
                "Address": "Updated Address",
                "City": "city",
                "PostCode": "54-321",
                "voivodeship": "śląskie",
            },
        }
        with self.client.patch(
            f"/update/{self.user_id}", json=update_payload, catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed to update user data: {response.text}")

    @task(1)
    def get_user_statistics(self):
        """Simulates the GET /statistics endpoint to retrieve user statistics"""
        with self.client.get("/statistics", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed to retrieve statistics: {response.text}")

    def on_stop(self):
        """This function will be called when a locust user stops"""
        keycloak_admin.delete_user(self.user_id)
