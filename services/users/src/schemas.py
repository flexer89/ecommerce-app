from typing import Optional
from pydantic import BaseModel


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

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    firstName: str
    lastName: str

class UserResponseWithAttributes(UserResponse):
    attributes: dict
    