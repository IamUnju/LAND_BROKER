from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from decimal import Decimal


@dataclass
class Property:
    title: str
    owner_id: int
    property_type_id: int
    listing_type_id: int
    district_id: int
    price: Decimal
    bedrooms: int = 0
    bathrooms: int = 0
    area_sqm: Optional[Decimal] = None
    address: Optional[str] = None
    description: Optional[str] = None
    is_furnished: bool = False
    is_published: bool = False
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    broker_id: Optional[int] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.title or not self.title.strip():
            raise ValueError("Property title cannot be empty")
        if len(self.title) > 255:
            raise ValueError("Property title cannot exceed 255 characters")
        if self.price < 0:
            raise ValueError("Property price cannot be negative")
        if self.bedrooms < 0:
            raise ValueError("Bedrooms count cannot be negative")
        if self.bathrooms < 0:
            raise ValueError("Bathrooms count cannot be negative")
        if self.area_sqm is not None and self.area_sqm <= 0:
            raise ValueError("Area must be positive")
        self.title = self.title.strip()

    def publish(self):
        self.is_published = True

    def unpublish(self):
        self.is_published = False

    def assign_broker(self, broker_id: int):
        if broker_id <= 0:
            raise ValueError("Invalid broker ID")
        self.broker_id = broker_id

    def remove_broker(self):
        self.broker_id = None
