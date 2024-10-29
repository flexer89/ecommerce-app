import uuid
from datetime import datetime, timedelta
from typing import Optional
from logging import getLogger
from fastapi import APIRouter, HTTPException
from keycloak.exceptions import KeycloakError, KeycloakPutError
from src.keycloak_client import keycloak_admin
from src.schemas import (
    ErrorResponse,
    UpdateResponse,
    UserListResponse,
    UserStatisticsResponse,
    UserUpdateRequest,
)

router = APIRouter()
logger = getLogger(__name__)


@router.get(
    "/get/{user_id}",
    response_model=UserListResponse,
    summary="Get user data by ID",
    description="Retrieves detailed information about a user from Keycloak by user ID, including attributes like phone number, address, city, and more.",
    responses={
        200: {"description": "User data retrieved successfully."},
        404: {"model": ErrorResponse, "description": "User not found."},
        500: {"model": ErrorResponse, "description": "Internal server error."},
    },
)
def get_user_data(user_id: uuid.UUID):
    try:
        user = keycloak_admin.get_user(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        attributes = {
            key: value[0] if isinstance(value, list) and value else value
            for key, value in user.get("attributes", {}).items()
        }

        user_data = {
            "id": user.get("id"),
            "username": user.get("username"),
            "email": user.get("email"),
            "firstName": user.get("firstName"),
            "lastName": user.get("lastName"),
            "attributes": attributes,
            "enabled": user.get("enabled"),
        }

        return {
            "total": 1,
            "users": [user_data],
        }
    except KeycloakError:
        raise HTTPException(
            status_code=500, detail="Failed to retrieve user data."
        )


@router.patch(
    "/update/{user_id}",
    response_model=UpdateResponse,
    summary="Update user data",
    description="Updates a user's data in Keycloak, including fields such as first name, last name, email, and user-defined attributes like phone number, address, and city.",
    responses={
        200: {
            "description": "User data updated successfully",
            "model": UpdateResponse,
        },
        400: {
            "description": "Bad request - Error updating user data",
            "model": ErrorResponse,
        },
        404: {"description": "User not found", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
)
def update_user_data(user_id: uuid.UUID, update_data: UserUpdateRequest):
    user = keycloak_admin.get_user(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_update_payload = {
        "firstName": user.get("firstName"),
        "lastName": user.get("lastName"),
        "email": user.get("email"),
        "attributes": user.get("attributes", {}),
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
        keycloak_admin.update_user(
            user_id=user_id, payload=user_update_payload
        )
    except KeycloakPutError as e:
        raise HTTPException(status_code=400, detail="Error updating user")

    return {"detail": "User updated successfully"}


@router.get(
    "/get",
    response_model=UserListResponse,
    summary="Search and paginate through users",
    description="Retrieves a paginated list of users based on search criteria, including support for searching by IDs or keywords.",
    responses={
        200: {
            "description": "Successful retrieval of users",
            "model": UserListResponse,
        },
        400: {
            "description": "Bad request - Invalid search parameters",
            "model": ErrorResponse,
        },
        404: {"description": "No users found", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
)
def get_user_data(
    limit: int = 10,
    offset: int = 0,
    search: Optional[str] = None,
    ids: Optional[str] = None,
):
    try:
        if ids:
            ids = ids.split(",")
            users = [keycloak_admin.get_user(user_id) for user_id in ids]
            total = len(users)
        else:
            users = keycloak_admin.get_users(
                {"max": limit, "first": offset, "search": search}
            )
            total = keycloak_admin.users_count(query={"search": search})

        users_data = []
        for user in users:
            attributes = {
                key: value[0] if isinstance(value, list) and value else value
                for key, value in user.get("attributes", {}).items()
            }
            users_data.append(
                {
                    "id": user.get("id"),
                    "username": user.get("username"),
                    "email": user.get("email"),
                    "firstName": user.get("firstName"),
                    "lastName": user.get("lastName"),
                    "enabled": user.get("enabled"),
                    "attributes": attributes,
                }
            )

        return {
            "users": users_data,
            "total": total,
        }

    except KeycloakError:
        raise HTTPException(status_code=500, detail="Internal server error")

    except Exception:
        raise HTTPException(
            status_code=400, detail="Bad request - Invalid search parameters"
        )


@router.get(
    "/statistics",
    response_model=UserStatisticsResponse,
    summary="User statistics",
    description="Provides user statistics, including active users in the last 30 days, new users, users grouped by region, and users grouped by roles.",
    responses={
        200: {
            "description": "User statistics retrieved successfully",
            "model": UserStatisticsResponse,
        },
        400: {
            "description": "Bad request - invalid parameters or failed request",
            "model": ErrorResponse,
        },
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
)
def get_user_statistics():
    try:
        # Fetch active users from Keycloak in the last 30 days
        active_users = keycloak_admin.get_users(
            {
                "lastLogin": f">={int((datetime.now() - timedelta(days=30)).timestamp()) * 1000}"
            }
        )
        active_users_count = len(active_users)

        # Fetch total users
        total_users = keycloak_admin.users_count()

        # Fetch new users in the last 30 days
        cutoff_date = datetime.now() - timedelta(days=30)
        new_users = keycloak_admin.get_users(
            {"createdAt": f">={int(cutoff_date.timestamp()) * 1000}"}
        )
        new_users_count = len(new_users)

        # Return the user statistics response
        return {
            "total_users": total_users,
            "active_users_last_30_days": active_users_count,
            "new_users_last_30_days": new_users_count,
        }

    except KeycloakError:
        raise HTTPException(status_code=500, detail="Internal server error")

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Bad request - invalid parameters or failed request",
        )


@router.post(
    "/block/{user_id}",
    summary="Block a user",
    response_model=ErrorResponse,
    description="Disables the specified user account in Keycloak, effectively blocking their access to the system.",
    responses={
        200: {
            "description": "User blocked successfully",
            "content": {
                "application/json": {
                    "example": {"detail": "User blocked successfully"}
                }
            },
        },
        400: {
            "description": "Bad request - error blocking user",
            "content": {
                "application/json": {
                    "example": {"detail": "Error blocking user"}
                }
            },
        },
    },
)
def block_user(user_id: uuid.UUID):

    try:
        keycloak_admin.update_user(user_id, {"enabled": False})
        return {"detail": "User blocked successfully"}
    except KeycloakPutError:
        logger.error(f"Error blocking user with user_id={user_id}")
        raise HTTPException(status_code=400, detail="Error blocking user")
    except Exception as e:
        logger.error(
            f"Unexpected error blocking user with user_id={user_id}: {e}"
        )
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post(
    "/unblock/{user_id}",
    summary="Unblock a user",
    response_model=ErrorResponse,
    description="Enables the specified user account in Keycloak, allowing them to regain access to the system.",
    responses={
        200: {
            "description": "User unblocked successfully",
            "content": {
                "application/json": {
                    "example": {"detail": "User unblocked successfully"}
                }
            },
        },
        400: {
            "description": "Bad request - error unblocking user",
            "content": {
                "application/json": {
                    "example": {"detail": "Error unblocking user"}
                }
            },
        },
    },
)
def unblock_user(user_id: uuid.UUID):
    try:
        keycloak_admin.update_user(user_id, {"enabled": True})
        return {"detail": "User unblocked successfully"}
    except KeycloakPutError:
        logger.error(f"Error unblocking user with user_id={user_id}")
        raise HTTPException(status_code=400, detail="Error unblocking user")
    except Exception as e:
        logger.error(
            f"Unexpected error unblocking user with user_id={user_id}: {e}"
        )
        raise HTTPException(status_code=500, detail="Internal server error")
