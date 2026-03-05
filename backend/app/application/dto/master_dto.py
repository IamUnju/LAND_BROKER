from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class RoleCreateDTO(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    description: Optional[str] = None


class RoleUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None


class RoleResponseDTO(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class PropertyTypeCreateDTO(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None


class PropertyTypeUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class PropertyTypeResponseDTO(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ListingTypeCreateDTO(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    description: Optional[str] = None


class ListingTypeUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None


class ListingTypeResponseDTO(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class RegionCreateDTO(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    code: Optional[str] = Field(None, max_length=10)


class RegionUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    code: Optional[str] = Field(None, max_length=10)


class RegionResponseDTO(BaseModel):
    id: int
    name: str
    code: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class DistrictCreateDTO(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    region_id: int = Field(gt=0)
    code: Optional[str] = Field(None, max_length=10)


class DistrictUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    region_id: Optional[int] = Field(None, gt=0)
    code: Optional[str] = Field(None, max_length=10)


class DistrictResponseDTO(BaseModel):
    id: int
    name: str
    region_id: int
    code: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class StatsDTO(BaseModel):
    total_users: int
    total_properties: int
    total_units: int = 0
    total_tenants: int
    total_leases: int
    total_payments: int
    total_revenue: float
    pending_maintenance: int
    open_maintenance: int = 0
    active_leases: int
    payments_this_month: int = 0
    users_by_role: dict = {}
