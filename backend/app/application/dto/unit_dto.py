from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.domain.entities.unit import UnitStatus


class UnitCreateDTO(BaseModel):
    property_id: int = Field(gt=0)
    unit_number: str = Field(min_length=1, max_length=50)
    floor: Optional[int] = None
    bedrooms: int = Field(ge=0, default=0)
    bathrooms: int = Field(ge=0, default=0)
    area_sqm: Optional[Decimal] = Field(None, gt=0)
    rent_price: Optional[Decimal] = Field(None, ge=0)
    sale_price: Optional[Decimal] = Field(None, ge=0)
    description: Optional[str] = None


class UnitUpdateDTO(BaseModel):
    unit_number: Optional[str] = Field(None, min_length=1, max_length=50)
    floor: Optional[int] = None
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    area_sqm: Optional[Decimal] = Field(None, gt=0)
    rent_price: Optional[Decimal] = Field(None, ge=0)
    sale_price: Optional[Decimal] = Field(None, ge=0)
    status: Optional[UnitStatus] = None
    description: Optional[str] = None


class UnitResponseDTO(BaseModel):
    id: int
    property_id: int
    unit_number: str
    floor: Optional[int]
    bedrooms: int
    bathrooms: int
    area_sqm: Optional[Decimal]
    rent_price: Optional[Decimal]
    sale_price: Optional[Decimal]
    status: str
    description: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}
