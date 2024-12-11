import random
import string

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

# Number of sample users to generate
num_users = 100


def random_string(length=8):
    letters = string.ascii_lowercase
    return "".join(random.choice(letters) for _ in range(length))


def generate_user_data(index):
    suffix = random.randint(1, 100000)

    first_name = f"Name{suffix}"
    last_name = f"Surname{suffix}"
    username = f"user{suffix}@example.com"

    email = username
    password = "Password123@"

    user_data = {
        "username": username,
        "email": email,
        "firstName": first_name,
        "lastName": last_name,
        "enabled": True,
        "emailVerified": True,
        "attributes": {
            "phoneNumber": [f"{random.randint(100000000, 999999999)}"],
            "City": ["Warszawa"],
            "Address": ["Plac Defilad 1"],
            "PostCode": ["00-901"],
            "voivodeship": ["mazowieckie"],
        },
        "credentials": [{"type": "password", "value": password, "temporary": False}],
    }
    return user_data


def create_user(user_data):
    user = keycloak_admin.create_user(user_data)
    if user:
        print(f"User created: {user}")
    else:
        print("Failed to create user")


def main():
    for i in range(1, num_users + 1):
        user_data = generate_user_data(i)
        create_user(user_data)


if __name__ == "__main__":
    main()
