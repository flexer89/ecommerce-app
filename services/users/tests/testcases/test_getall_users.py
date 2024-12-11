from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from keycloak.exceptions import KeycloakError
from src.app import app

client = TestClient(app)

mock_users = [
    {
        "id": "user-1",
        "username": "testuser1",
        "email": "testuser1@example.com",
        "firstName": "Test",
        "lastName": "User1",
        "attributes": {
            "phoneNumber": ["123456789"],
            "Address": ["123 Main St"],
            "City": ["Springfield"],
            "PostCode": ["12345"],
            "voivodeship": ["Illinois"],
        },
    },
    {
        "id": "user-2",
        "username": "testuser2",
        "email": "testuser2@example.com",
        "firstName": "Test",
        "lastName": "User2",
        "attributes": {
            "phoneNumber": ["987654321"],
            "Address": ["456 Elm St"],
            "City": ["Greenville"],
            "PostCode": ["54321"],
            "voivodeship": ["Texas"],
        },
    },
]


def test_get_user_data_success():
    """Test successful retrieval of users with pagination and search."""

    with patch("src.keycloak_client.keycloak_admin.get_users", return_value=mock_users):
        with patch(
            "src.keycloak_client.keycloak_admin.users_count",
            return_value=len(mock_users),
        ):

            response = client.get("/get?limit=10&offset=0&search=testuser")

            assert response.status_code == 200
            json_response = response.json()
            assert json_response["total"] == 2
            assert len(json_response["users"]) == 2
            assert json_response["users"][0]["id"] == mock_users[0]["id"]
            assert json_response["users"][1]["id"] == mock_users[1]["id"]


def test_get_user_data_by_ids_success():
    """Test successful retrieval of users by their IDs."""

    with patch("src.keycloak_client.keycloak_admin.get_user") as mock_get_user:
        mock_get_user.side_effect = lambda user_id: next(
            user for user in mock_users if user["id"] == user_id
        )

        response = client.get("/get?ids=user-1,user-2")

        assert response.status_code == 200
        json_response = response.json()
        assert json_response["total"] == 2
        assert len(json_response["users"]) == 2
        assert json_response["users"][0]["id"] == "user-1"
        assert json_response["users"][1]["id"] == "user-2"


def test_get_user_data_no_users_found():
    """Test the scenario where no users are found."""

    with patch("src.keycloak_client.keycloak_admin.get_users", return_value=[]):
        with patch("src.keycloak_client.keycloak_admin.users_count", return_value=0):

            response = client.get("/get?search=nonexistent")

            assert response.status_code == 200
            assert response.json() == {"users": [], "total": 0}


def test_get_user_data_invalid_params():
    """Test invalid search parameters resulting in a bad request."""

    response = client.get("/get?limit=invalid&offset=invalid")

    assert response.status_code == 422


def test_get_user_data_internal_server_error():
    """Test internal server error during user retrieval."""

    with patch(
        "src.keycloak_client.keycloak_admin.get_users", side_effect=KeycloakError
    ):

        response = client.get("/get?limit=10&offset=0")

        assert response.status_code == 500
        assert response.json() == {"detail": "Internal server error"}
