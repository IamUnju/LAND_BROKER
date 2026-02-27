from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class PropertyType:
    name: str
    description: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.name or not self.name.strip():
            raise ValueError("PropertyType name cannot be empty")
        if len(self.name) > 100:
            raise ValueError("PropertyType name cannot exceed 100 characters")
        self.name = self.name.strip()


@dataclass
class ListingType:
    name: str
    description: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.name or not self.name.strip():
            raise ValueError("ListingType name cannot be empty")
        valid_types = {"FOR_SALE", "FOR_RENT", "BOTH"}
        if self.name.upper() not in valid_types:
            raise ValueError(f"ListingType must be one of {valid_types}")
        self.name = self.name.strip().upper()
