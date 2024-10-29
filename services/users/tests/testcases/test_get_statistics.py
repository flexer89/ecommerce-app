from datetime import datetime, timedelta
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from keycloak.exceptions import KeycloakError
from src.app import app

client = TestClient(app)

mock_active_users = [
    {
        "id": "user-1",
        "username": "activeuser1",
        "email": "activeuser1@example.com",
        "firstName": "Active",
        "lastName": "User1",
        "lastLogin": (datetime.now() - timedelta(days=10)).timestamp() * 1000,
    },
    {
        "id": "user-2",
        "username": "activeuser2",
        "email": "activeuser2@example.com",
        "firstName": "Active",
        "lastName": "User2",
        "lastLogin": (datetime.now() - timedelta(days=5)).timestamp() * 1000,
    },
]

mock_new_users = [
    {
        "id": "user-3",
        "username": "newuser1",
        "email": "newuser1@example.com",
        "firstName": "New",
        "lastName": "User1",
        "createdAt": (datetime.now() - timedelta(days=15)).timestamp() * 1000,
    },
    {
        "id": "user-4",
        "username": "newuser2",
        "email": "newuser2@example.com",
        "firstName": "New",
        "lastName": "User2",
        "createdAt": (datetime.now() - timedelta(days=20)).timestamp() * 1000,
    },
]

total_users_mock = 100


def test_get_user_statistics_success():
    """Test successful retrieval of user statistics."""

    with patch("src.keycloak_client.keycloak_admin.get_users") as mock_get_users, patch(
        "src.keycloak_client.keycloak_admin.users_count",
        return_value=total_users_mock,
    ):
        mock_get_users.side_effect = [mock_active_users, mock_new_users]

        response = client.get("/statistics")

        assert response.status_code == 200
        json_response = response.json()
        assert json_response["total_users"] == total_users_mock
        assert json_response["active_users_last_30_days"] == len(mock_active_users)
        assert json_response["new_users_last_30_days"] == len(mock_new_users)


def test_get_user_statistics_keycloak_error():
    """Test KeycloakError handling when fetching user statistics fails."""

    with patch(
        "src.keycloak_client.keycloak_admin.get_users",
        side_effect=KeycloakError,
    ):

        response = client.get("/statistics")

        assert response.status_code == 500
        assert response.json() == {"detail": "Internal server error"}


def test_get_user_statistics_general_exception():
    """Test general exception handling for bad request or failed request."""

    with patch("src.keycloak_client.keycloak_admin.get_users", side_effect=Exception):

        response = client.get("/statistics")

        assert response.status_code == 400
        assert response.json() == {
            "detail": "Bad request - invalid parameters or failed request"
        }
