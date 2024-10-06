from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from keycloak.exceptions import KeycloakPutError
from src.app import app

client = TestClient(app)


mock_user = {
    "id": "test-user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "attributes": {
        "phoneNumber": ["123456789"],
        "Address": ["123 Main St"],
        "City": ["Springfield"],
        "PostCode": ["12345"],
        "voivodeship": ["Illinois"],
    },
}


def test_update_user_success():
    """Test successful user update."""

    with patch(
        "src.keycloak_client.keycloak_admin.get_user", return_value=mock_user
    ) as mock_get_user, patch(
        "src.keycloak_client.keycloak_admin.update_user", return_value=None
    ) as mock_update_user:

        update_data = {
            "firstName": "Jane",
            "lastName": "Doe",
            "email": "jane.doe@example.com",
            "attributes": {
                "phoneNumber": "987654321",
                "Address": "456 Another St",
                "City": "Metropolis",
                "PostCode": "54321",
                "voivodeship": "Metropolis State",
            },
        }

        response = client.patch(f"/update/{mock_user['id']}", json=update_data)

        assert response.status_code == 200
        assert response.json() == {"detail": "User updated successfully"}

        mock_get_user.assert_called_once_with(mock_user["id"])
        mock_update_user.assert_called_once()


def test_update_user_not_found():
    """Test user not found scenario."""

    with patch(
        "src.keycloak_client.keycloak_admin.get_user", return_value=None
    ) as mock_get_user:

        response = client.patch(f"/update/non-existent-user", json={})

        assert response.status_code == 404
        assert response.json() == {"detail": "User not found"}

        mock_get_user.assert_called_once_with("non-existent-user")


def test_update_user_keycloak_error():
    """Test Keycloak error during the update."""

    with patch(
        "src.keycloak_client.keycloak_admin.get_user", return_value=mock_user
    ) as mock_get_user, patch(
        "src.keycloak_client.keycloak_admin.update_user",
        side_effect=KeycloakPutError("Error"),
    ) as mock_update_user:

        update_data = {
            "firstName": "Jane",
            "lastName": "Doe",
        }

        response = client.patch(f"/update/{mock_user['id']}", json=update_data)

        assert response.status_code == 400
        assert response.json() == {"detail": "Error updating user"}

        mock_get_user.assert_called_once_with(mock_user["id"])
        mock_update_user.assert_called_once()


def test_update_user_invalid_payload():
    """Test with invalid request payload."""

    with patch(
        "src.keycloak_client.keycloak_admin.update_user", return_value=mock_user
    ) as mock_get_user:
        invalid_payload = {"firstName": 123}

        response = client.patch(f"/update/{mock_user['id']}", json=invalid_payload)

        assert response.status_code == 422
