from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Region:
    name: str
    code: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.name or not self.name.strip():
            raise ValueError("Region name cannot be empty")
        if len(self.name) > 150:
            raise ValueError("Region name cannot exceed 150 characters")
        self.name = self.name.strip()


@dataclass
class District:
    name: str
    region_id: int
    code: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.name or not self.name.strip():
            raise ValueError("District name cannot be empty")
        if len(self.name) > 150:
            raise ValueError("District name cannot exceed 150 characters")
        if not self.region_id or self.region_id <= 0:
            raise ValueError("District must belong to a valid region")
        self.name = self.name.strip()
