import random

import requests

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

products_service_url = "http://localhost:5000"
orders_service_url = "http://localhost:5010"
shipments_service_url = "http://localhost:5050"

# Number of sample orders to generate
num_orders = 100


def get_users():
    user_list = keycloak_admin.get_users({})
    if not user_list:
        print("Failed to fetch users from Keycloak")
        return []
    return user_list


def get_products():
    response = requests.get(f"{products_service_url}/getall")
    if response.status_code != 200:
        print("Failed to fetch products from the products service")
        return []
    return response.json()


def main():
    # Fetch users and products
    users = get_users()
    products = get_products()

    # Generate and insert orders
    for i in range(num_orders):
        user = random.choice(users)
        user_id = user["id"]

        # Randomly select order status
        status = random.choice(["pending", "processing", "shipped"])

        # Randomly select number of items in the order
        num_items = random.randint(1, 5)
        order_items = random.sample(products, min(num_items, len(products)))

        total_price = 0.0
        print(f"total_price: {total_price}")
        items_to_insert = []
        for item in order_items:
            # Random quantity between 1 and 5
            quantity = random.randint(1, 5)
            weight = random.choice([250, 500])
            print(f"weight: {weight}")
            print(f"item_price: {item['price']}")
            price = item["price"] if weight == 250 else item["price"] * 2
            print(f"full_item_price: {price}")
            item_total = price * quantity
            print(f"item_total: {item_total}")
            total_price += item_total
            print(f"total_price: {total_price}")

            print(
                f"Creating order for user: {user_id}, item: {item['id']}, quantity: {quantity}, price: {price}, weight: {weight}"
            )
            items_to_insert.append(
                {
                    "id": item["id"],
                    "quantity": quantity,
                    "price": price,
                    "weight": weight,
                }
            )
        # create order
        order = requests.post(
            f"{orders_service_url}/create",
            json={
                "user_id": user_id,
                "total_price": total_price,
                "items": items_to_insert,
            },
        )
        if order.status_code != 201:
            print(f"Failed to create order: {order}")
            continue
        print(f"Order created: {order.json()}")

        # add shipping info
        order_id = order.json().get("order_id")
        shipping_info = {
            "order_id": order_id,
            "user_id": user_id,
            "shipment_address": f"{user.get('attributes').get('Address')[0]}, {user.get('attributes').get('City')[0]}, {user.get('attributes').get('voivodeship')[0]}, {user.get('attributes').get('PostCode')[0]}",
            "company": "UPS",
            "current_location": "Warszawska 24, Kraków, małopolskie, 31-155",
        }

        shipment = requests.post(
            f"{shipments_service_url}/create", json=shipping_info
        )
        if shipment.status_code != 201:
            print(f"Failed to create shipment: {shipment.json()}")
            continue
        print(f"Shipment created: {shipment.json()}")


if __name__ == "__main__":
    main()
