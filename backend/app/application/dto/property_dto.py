from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


class PropertyImageDTO(BaseModel):
    id: int
    url: str
    caption: Optional[str] = None
    is_primary: bool = False
    display_order: int = 0

    model_config = {"from_attributes": True}


class AmenityDTO(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    category: Optional[str] = None

    model_config = {"from_attributes": True}


class ReviewDTO(BaseModel):
    id: int
    reviewer_name: str
    reviewer_avatar: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    stay_period: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PropertyCreateDTO(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    property_type_id: int = Field(gt=0)
    listing_type_id: int = Field(gt=0)
    district_id: int = Field(gt=0)
    price: Decimal = Field(gt=0)
    bedrooms: int = Field(ge=0, default=0)
    bathrooms: int = Field(ge=0, default=0)
    area_sqm: Optional[Decimal] = Field(None, gt=0)
    address: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    is_furnished: bool = False
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    broker_id: Optional[int] = None


class PropertyUpdateDTO(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    property_type_id: Optional[int] = Field(None, gt=0)
    listing_type_id: Optional[int] = Field(None, gt=0)
    district_id: Optional[int] = Field(None, gt=0)
    price: Optional[Decimal] = Field(None, gt=0)
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    area_sqm: Optional[Decimal] = Field(None, gt=0)
    address: Optional[str] = None
    description: Optional[str] = None
    is_furnished: Optional[bool] = None
    is_published: Optional[bool] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    broker_id: Optional[int] = None


class PropertyResponseDTO(BaseModel):
    id: int
    title: str
    owner_id: int
    property_type_id: int
    listing_type_id: int
    district_id: int
    price: Decimal
    bedrooms: int
    bathrooms: int
    area_sqm: Optional[Decimal]
    address: Optional[str]
    description: Optional[str]
    is_furnished: bool
    is_published: bool
    latitude: Optional[Decimal]
    longitude: Optional[Decimal]
    broker_id: Optional[int]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    # Enriched display fields
    property_type_name: Optional[str] = None
    listing_type_name: Optional[str] = None
    district_name: Optional[str] = None
    region_name: Optional[str] = None
    # Contact info (available even on listing cards)
    host_name: Optional[str] = None
    broker_name: Optional[str] = None

    model_config = {"from_attributes": True}


class PropertyDetailDTO(PropertyResponseDTO):
    images: List[PropertyImageDTO] = []
    amenities: List[AmenityDTO] = []
    reviews: List[ReviewDTO] = []
    avg_rating: float = 0.0
    review_count: int = 0
    # Full contact details on detail page
    owner_email: Optional[str] = None
    owner_phone: Optional[str] = None
    broker_email: Optional[str] = None
    broker_phone: Optional[str] = None

    model_config = {"from_attributes": True}


class PropertyListDTO(BaseModel):
    properties: List[PropertyResponseDTO]
    total: int
    skip: int
    limit: int


class PropertyFilterDTO(BaseModel):
    district_id: Optional[int] = None
    region_id: Optional[int] = None
    property_type_id: Optional[int] = None
    listing_type_id: Optional[int] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    bedrooms: Optional[int] = None
    is_furnished: Optional[bool] = None
    owner_id: Optional[int] = None
    broker_id: Optional[int] = None
    search: Optional[str] = None
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=20, ge=1, le=100)
