from typing import Optional

from pydantic import BaseModel, Field, validator, validate_email

voivodeships = [
    "dolnośląskie",
    "kujawsko-pomorskie",
    "lubelskie",
    "lubuskie",
    "łódzkie",
    "małopolskie",
    "mazowieckie",
    "opolskie",
    "podkarpackie",
    "podlaskie",
    "pomorskie",
    "śląskie",
    "świętokrzyskie",
    "warmińsko-mazurskie",
    "wielkopolskie",
    "zachodniopomorskie",
]


class UserAttributes(BaseModel):
    phoneNumber: str = Field(
        None, min_length=9, max_length=9, description="The phone number, 9 characters."
    )
    Address: str = Field(
        None,
        min_length=1,
        max_length=100,
        description="The address, between 1 and 100 characters.",
    )
    City: str = Field(
        None,
        min_length=1,
        max_length=100,
        description="The city, between 1 and 100 characters.",
    )
    PostCode: str = Field(
        None, min_length=6, max_length=6, description="The post code, 6 characters."
    )
    voivodeship: str = Field(None, description="The voivodeship.")

    @validator("voivodeship")
    def check_voivodeship(cls, v):
        if v not in voivodeships:
            raise ValueError("Invalid voivodeship")
        return v


class UserWithAttributesResponse(BaseModel):
    id: str
    username: str
    email: str = Field(..., description="The email of the user.")
    firstName: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The first name of the user, between 1 and 100 characters.",
    )
    lastName: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The last name of the user, between 1 and 100 characters.",
    )
    enabled: bool = Field(..., description="The status of the user.")
    attributes: UserAttributes

    @validator("email")
    def validate_email(cls, v):
        validate_email(v)
        return v


class UserListResponse(BaseModel):
    total: int
    users: list[UserWithAttributesResponse]


class ErrorResponse(BaseModel):
    detail: str


class UserUpdateRequestAttributes(BaseModel):
    phoneNumber: Optional[str] = Field(
        None, min_length=9, max_length=9, description="The phone number, 9 characters."
    )
    Address: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="The address, between 1 and 100 characters.",
    )
    City: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="The city, between 1 and 100 characters.",
    )
    PostCode: Optional[str] = Field(
        None, min_length=6, max_length=6, description="The post code, 6 characters."
    )
    voivodeship: Optional[str] = Field(None, description="The voivodeship.")

    @validator("voivodeship")
    def check_voivodeship(cls, v):
        if v not in voivodeships:
            raise ValueError("Invalid voivodeship")
        return v


class UserUpdateRequest(BaseModel):
    firstName: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="The first name of the user, between 1 and 100 characters.",
    )
    lastName: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="The last name of the user, between 1 and 100 characters.",
    )
    email: Optional[str] = Field(None, description="The email of the user.")
    attributes: Optional[UserUpdateRequestAttributes] = None

    @validator("email")
    def validate_email(cls, v):
        validate_email(v)
        return v


class UpdateResponse(BaseModel):
    detail: str


class ErrorResponse(BaseModel):
    detail: str


class UserResponse(BaseModel):
    id: str
    username: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The username of the user, between 1 and 100 characters.",
    )
    email: str = Field(..., description="The email of the user.")
    firstName: str
    lastName: str

    @validator("email")
    def validate_email(cls, v):
        validate_email(v)
        return v


class UserStatisticsResponse(BaseModel):
    total_users: int
    active_users_last_30_days: int
    new_users_last_30_days: int
