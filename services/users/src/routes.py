from fastapi import APIRouter, HTTPException
import os
from typing import Dict, List
from src.keycloak_client import keycloak_admin
from src.schemas import UserUpdateRequest, UserResponseWithAttributes
from keycloak.exceptions import KeycloakPutError

router = APIRouter()


@router.get("/k8s", include_in_schema=False)
async def k8s() -> Dict[str, str | None]:
    env_vars = {
        "HOSTNAME": os.getenv("HOSTNAME"),
        "KUBERNETES_PORT": os.getenv("KUBERNETES_PORT"),
    }
    return env_vars

@router.get("/get/{user_id}")
def get_user_data(user_id: str):
    user = keycloak_admin.get_user(user_id)
    
    attributes = {key: value[0] if isinstance(value, list) and value else value 
                  for key, value in user.get("attributes", {}).items()}
    
    user = {
        "id": user.get("id"),
        "username": user.get("username"),
        "email": user.get("email"),
        "firstName": user.get("firstName"),
        "lastName": user.get("lastName"),
        "attributes": attributes,
    }
    
    return {
        "total": 1,
        "users": [user],
    }
    
@router.patch("/update/{user_id}")
def update_user_data(user_id: str, update_data: UserUpdateRequest):
    user = keycloak_admin.get_user(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_update_payload = {
        "firstName": user.get("firstName"),
        "lastName": user.get("lastName"),
        "email": user.get("email"),
        "attributes": user.get("attributes", {})
    }

    if update_data.firstName is not None:
        user_update_payload["firstName"] = update_data.firstName
    
    if update_data.lastName is not None:
        user_update_payload["lastName"] = update_data.lastName
    
    if update_data.email is not None:
        user_update_payload["email"] = update_data.email

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
    try:
        keycloak_admin.update_user(user_id=user_id, payload=user_update_payload)
    except KeycloakPutError as e:
        raise HTTPException(status_code=400)

    return {"detail": "User updated successfully"}


@router.get("/getall", response_model=List[UserResponseWithAttributes])
def get_users():
    try:
        # Fetch users from Keycloak
        users = keycloak_admin.get_users({})
        users_data = []
        for user in users:
            attributes = {key: value[0] if isinstance(value, list) and value else value 
                          for key, value in user.get("attributes", {}).items()}
            users_data.append({
                "id": user.get("id"),
                "username": user.get("username"),
                "email": user.get("email"),
                "firstName": user.get("firstName"),
                "lastName": user.get("lastName"),
                "attributes": attributes,
            })
        return users_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.get("/get")
def get_user_data(limit: int = 10, offset: int = 0, search: str = None, ids: str = None):
    if ids:
        ids = ids.split(",")
        users = [keycloak_admin.get_user(user_id) for user_id in ids]
        total = len(users)
    else:
        users = keycloak_admin.get_users({"max": limit, "first": offset, "search": search})
        total = keycloak_admin.users_count(query={"search": search})
    
    users_data = []
    for user in users:
        attributes = {key: value[0] if isinstance(value, list) and value else value 
                    for key, value in user.get("attributes", {}).items()}
        users_data.append({
            "id": user.get("id"),
            "username": user.get("username"),
            "email": user.get("email"),
            "firstName": user.get("firstName"),
            "lastName": user.get("lastName"),
            "attributes": attributes,
        })
        
    return {
        "users": users_data,
        "total": total,
    }