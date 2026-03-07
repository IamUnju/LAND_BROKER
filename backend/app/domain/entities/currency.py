from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Currency:
    name: str
    code: str
    symbol: str
    description: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.name or not self.name.strip():
            raise ValueError("Currency name cannot be empty")
        if not self.code or not self.code.strip():
            raise ValueError("Currency code cannot be empty")
        if len(self.code.strip()) > 10:
            raise ValueError("Currency code cannot exceed 10 characters")
        if not self.symbol or not self.symbol.strip():
            raise ValueError("Currency symbol cannot be empty")
        self.name = self.name.strip()
        self.code = self.code.strip().upper()
        self.symbol = self.symbol.strip()
