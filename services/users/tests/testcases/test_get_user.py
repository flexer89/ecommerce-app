import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.app import app
from keycloak.exceptions import KeycloakError

client = TestClient(app)

mock_user = {
    "id": "test-user-id",
    "username": "testuser",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    "attributes": {
        "phoneNumber": ["123456789"],
        "Address": ["123 Main St"],
        "City": ["Springfield"],
        "PostCode": ["12345"],
        "voivodeship": ["Illinois"]
    }
}


def test_get_user_success():
    """Test successful retrieval of user data."""
    
    with patch('src.keycloak_client.keycloak_admin.get_user', return_value=mock_user):
        
        response = client.get(f"/get/{mock_user['id']}")
        
        assert response.status_code == 200
        json_response = response.json()
        
        assert json_response["total"] == 1
        assert json_response["users"][0]["id"] == mock_user["id"]
        assert json_response["users"][0]["email"] == mock_user["email"]
        assert json_response["users"][0]["firstName"] == mock_user["firstName"]
        assert json_response["users"][0]["attributes"]["phoneNumber"] == "123456789"


def test_get_user_not_found():
    """Test the scenario where the user is not found."""
    
    with patch('src.keycloak_client.keycloak_admin.get_user', return_value=None):
        
        response = client.get("/get/non-existent-user")
        
        assert response.status_code == 404
        assert response.json() == {"detail": "User not found"}


def test_get_user_internal_server_error():
    """Test internal server error during user retrieval."""
    
    with patch('src.keycloak_client.keycloak_admin.get_user', side_effect=KeycloakError):
        
        response = client.get(f"/get/{mock_user['id']}")
        
        assert response.status_code == 500
        assert response.json() == {"detail": "Failed to retrieve user data."}
