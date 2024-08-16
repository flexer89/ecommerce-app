from fastapi import APIRouter, HTTPException
import os
from typing import Dict
from src.keycloak_client import keycloak_admin
from src.schemas import UserUpdateRequest
from keycloak.exceptions import KeycloakPutError

router = APIRouter()


@router.get("/k8s", include_in_schema=False)
async def k8s() -> Dict[str, str | None]:
    env_vars = {
        "HOSTNAME": os.getenv("HOSTNAME"),
        "KUBERNETES_PORT": os.getenv("KUBERNETES_PORT"),
    }
    return env_vars

@router.get("/get")
def get_patients_kc():
    return keycloak_admin.get_users({})

@router.get("/get/{user_id}")
def get_user_data(user_id: str):
    user = keycloak_admin.get_user(user_id)
    
    # Flatten attributes from list to a single value (assuming each list has one item)
    attributes = {key: value[0] if isinstance(value, list) and value else value 
                  for key, value in user.get("attributes", {}).items()}
    
    return {
        "id": user.get("id"),
        "username": user.get("username"),
        "email": user.get("email"),
        "firstName": user.get("firstName"),
        "lastName": user.get("lastName"),
        "attributes": attributes,
    }
    
@router.patch("/update/{user_id}")
def update_user_data(user_id: str, update_data: UserUpdateRequest):
    # Retrieve the existing user data from Keycloak
    user = keycloak_admin.get_user(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Initialize the payload with existing data
    user_update_payload = {
        "firstName": user.get("firstName"),
        "lastName": user.get("lastName"),
        "email": user.get("email"),
        "attributes": user.get("attributes", {})
    }

    # Update fields only if they are provided in the request
    if update_data.firstName is not None:
        user_update_payload["firstName"] = update_data.firstName
    
    if update_data.lastName is not None:
        user_update_payload["lastName"] = update_data.lastName
    
    if update_data.email is not None:
        user_update_payload["email"] = update_data.email

    # Update attributes if provided
    if update_data.attributes is not None:
        attributes = user_update_payload["attributes"]

        if update_data.attributes.phoneNumber is not None:
            attributes["phoneNumber"] = [update_data.attributes.phoneNumber]

        if update_data.attributes.Address is not None:
            attributes["Address"] = [update_data.attributes.Address]

        if update_data.attributes.City is not None:
            attributes["City"] = [update_data.attributes.City]

        if update_data.attributes.PostCode is not None:
            attributes["PostCode"] = [update_data.attributes.PostCode]

        if update_data.attributes.voivodeship is not None:
            attributes["voivodeship"] = [update_data.attributes.voivodeship]

        user_update_payload["attributes"] = attributes

    # Send the update request to Keycloak
    try:
        keycloak_admin.update_user(user_id=user_id, payload=user_update_payload)
    except KeycloakPutError as e:
        raise HTTPException(status_code=400)

    return {"detail": "User updated successfully"}
