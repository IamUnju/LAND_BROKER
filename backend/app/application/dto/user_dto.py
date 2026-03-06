from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime


class UserCreateDTO(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: Optional[str] = None
    role_id: Optional[int] = None  # Ignored on self-registration; backend assigns TENANT

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserUpdateDTO(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class AdminPasswordUpdateDTO(BaseModel):
    """Admin-only DTO to update any user's password."""
    new_password: str = Field(min_length=8, max_length=100)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserResponseDTO(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    role_id: int
    role_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class UserListDTO(BaseModel):
    users: list[UserResponseDTO]
    total: int
    skip: int
    limit: int


class LoginDTO(BaseModel):
    email: EmailStr
    password: str


class AdminUserCreateDTO(BaseModel):
    """Used by admin to create users with any role."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: Optional[str] = None
    role_id: int = Field(gt=0)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class TokenDTO(BaseModel):
    access_token: str
    refresh_token: str


class GoogleAuthDTO(BaseModel):
    token: str  # Google ID token from frontend
    token_type: str = "bearer"


class RefreshTokenDTO(BaseModel):
    refresh_token: str


class ChangePasswordDTO(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=100)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v
