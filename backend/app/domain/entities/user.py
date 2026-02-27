from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import re


@dataclass
class User:
    email: str
    hashed_password: str
    first_name: str
    last_name: str
    role_id: int
    phone: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    role_name: Optional[str] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.email or not self.email.strip():
            raise ValueError("Email cannot be empty")
        if not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", self.email):
            raise ValueError("Invalid email format")
        if not self.first_name or not self.first_name.strip():
            raise ValueError("First name cannot be empty")
        if not self.last_name or not self.last_name.strip():
            raise ValueError("Last name cannot be empty")
        if not self.role_id or self.role_id <= 0:
            raise ValueError("User must have a valid role")
        self.email = self.email.strip().lower()
        self.first_name = self.first_name.strip()
        self.last_name = self.last_name.strip()

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def deactivate(self):
        self.is_active = False

    def activate(self):
        self.is_active = True
