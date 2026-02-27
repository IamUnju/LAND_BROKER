from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Role:
    name: str
    description: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.name or not self.name.strip():
            raise ValueError("Role name cannot be empty")
        if len(self.name) > 50:
            raise ValueError("Role name cannot exceed 50 characters")
        self.name = self.name.strip().upper()
