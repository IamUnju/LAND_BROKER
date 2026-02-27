from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from decimal import Decimal
from enum import Enum


class UnitStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"


@dataclass
class Unit:
    property_id: int
    unit_number: str
    floor: Optional[int] = None
    bedrooms: int = 0
    bathrooms: int = 0
    area_sqm: Optional[Decimal] = None
    rent_price: Optional[Decimal] = None
    sale_price: Optional[Decimal] = None
    status: UnitStatus = UnitStatus.AVAILABLE
    description: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()
        if isinstance(self.status, str):
            self.status = UnitStatus(self.status)

    def _validate(self):
        if not self.unit_number or not self.unit_number.strip():
            raise ValueError("Unit number cannot be empty")
        if self.bedrooms < 0:
            raise ValueError("Bedrooms cannot be negative")
        if self.bathrooms < 0:
            raise ValueError("Bathrooms cannot be negative")
        if self.rent_price is not None and self.rent_price < 0:
            raise ValueError("Rent price cannot be negative")
        if self.sale_price is not None and self.sale_price < 0:
            raise ValueError("Sale price cannot be negative")

    def occupy(self):
        if self.status == UnitStatus.UNDER_MAINTENANCE:
            raise ValueError("Cannot occupy a unit under maintenance")
        self.status = UnitStatus.OCCUPIED

    def vacate(self):
        self.status = UnitStatus.AVAILABLE

    def set_under_maintenance(self):
        self.status = UnitStatus.UNDER_MAINTENANCE

    @property
    def is_available(self) -> bool:
        return self.status == UnitStatus.AVAILABLE
