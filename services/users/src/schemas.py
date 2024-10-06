from typing import Dict, List, Optional

from pydantic import BaseModel


class UserAttributes(BaseModel):
    phoneNumber: str = None
    Address: str = None
    City: str = None
    PostCode: str = None
    voivodeship: str = None


class UserWithAttributesResponse(BaseModel):
    id: str
    username: str
    email: str
    firstName: str
    lastName: str
    attributes: UserAttributes


class UserListResponse(BaseModel):
    total: int
    users: list[UserWithAttributesResponse]


class ErrorResponse(BaseModel):
    detail: str


class UserUpdateRequestAttributes(BaseModel):
    phoneNumber: Optional[str] = None
    Address: Optional[str] = None
    City: Optional[str] = None
    PostCode: Optional[str] = None
    voivodeship: Optional[str] = None


class UserUpdateRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    attributes: Optional[UserUpdateRequestAttributes] = None


class UpdateResponse(BaseModel):
    detail: str


class ErrorResponse(BaseModel):
    detail: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    firstName: str
    lastName: str


class UserStatisticsResponse(BaseModel):
    total_users: int
    active_users_last_30_days: int
    new_users_last_30_days: int
