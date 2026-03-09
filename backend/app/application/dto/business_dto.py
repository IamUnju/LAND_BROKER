from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
from app.domain.entities.tenant import TenantStatus
from app.domain.entities.lease import LeaseStatus
from app.domain.entities.payment import PaymentStatus, PaymentMethod
from app.domain.entities.maintenance import MaintenanceStatus, MaintenancePriority
from app.domain.entities.inquiry import InquiryStatus
from app.domain.entities.commission import CommissionStatus


# ── Tenant ──────────────────────────────────────────────────────────────
class TenantCreateDTO(BaseModel):
    user_id: int = Field(gt=0)
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    national_id: Optional[str] = None
    occupation: Optional[str] = None
    monthly_income: Optional[float] = Field(None, ge=0)


class TenantUpdateDTO(BaseModel):
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    national_id: Optional[str] = None
    occupation: Optional[str] = None
    monthly_income: Optional[float] = Field(None, ge=0)
    status: Optional[TenantStatus] = None


class TenantResponseDTO(BaseModel):
    id: int
    user_id: int
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    national_id: Optional[str]
    occupation: Optional[str]
    monthly_income: Optional[float]
    status: str
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Lease ────────────────────────────────────────────────────────────────
class LeaseCreateDTO(BaseModel):
    unit_id: int = Field(gt=0)
    tenant_id: int = Field(gt=0)
    start_date: date
    end_date: date
    monthly_rent: Decimal = Field(gt=0)
    security_deposit: Decimal = Field(ge=0)
    notes: Optional[str] = None


class LeaseUpdateDTO(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    monthly_rent: Optional[Decimal] = Field(None, gt=0)
    security_deposit: Optional[Decimal] = Field(None, ge=0)
    status: Optional[LeaseStatus] = None
    notes: Optional[str] = None


class LeaseResponseDTO(BaseModel):
    id: int
    unit_id: int
    tenant_id: int
    start_date: date
    end_date: date
    monthly_rent: Decimal
    security_deposit: Decimal
    status: str
    notes: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Payment ──────────────────────────────────────────────────────────────
class PaymentCreateDTO(BaseModel):
    lease_id: int = Field(gt=0)
    amount: Decimal = Field(gt=0)
    due_date: date
    notes: Optional[str] = None


class PaymentMarkPaidDTO(BaseModel):
    payment_date: date
    payment_method: PaymentMethod
    reference_number: Optional[str] = None


class PaymentResponseDTO(BaseModel):
    id: int
    lease_id: int
    amount: Decimal
    due_date: date
    payment_date: Optional[date]
    status: str
    payment_method: Optional[str]
    reference_number: Optional[str]
    notes: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Maintenance ──────────────────────────────────────────────────────────
class MaintenanceCreateDTO(BaseModel):
    unit_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    priority: MaintenancePriority = MaintenancePriority.MEDIUM


class MaintenanceUpdateDTO(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[MaintenancePriority] = None
    status: Optional[MaintenanceStatus] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None


class MaintenanceResponseDTO(BaseModel):
    id: int
    unit_id: int
    tenant_id: int
    title: str
    description: str
    priority: str
    status: str
    assigned_to: Optional[str]
    resolution_notes: Optional[str]
    resolved_at: Optional[datetime]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Inquiry ───────────────────────────────────────────────────────────────
class InquiryCreateDTO(BaseModel):
    property_id: int = Field(gt=0)
    message: str = Field(min_length=1, max_length=1000)


class InquiryRespondDTO(BaseModel):
    response: str = Field(min_length=1)


class InquiryResponseDTO(BaseModel):
    id: int
    property_id: int
    user_id: int
    message: str
    status: str
    response: Optional[str]
    responded_at: Optional[datetime]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Favorite ──────────────────────────────────────────────────────────────
class FavoriteResponseDTO(BaseModel):
    id: int
    user_id: int
    property_id: int
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Commission ────────────────────────────────────────────────────────────
class CommissionCreateDTO(BaseModel):
    property_id: int = Field(gt=0)
    broker_id: int = Field(gt=0)
    commission_rate: Decimal = Field(gt=0, le=100)
    transaction_amount: Decimal = Field(gt=0)
    notes: Optional[str] = None


class CommissionResponseDTO(BaseModel):
    id: int
    property_id: int
    broker_id: int
    commission_rate: Decimal
    transaction_amount: Decimal
    commission_amount: Decimal
    status: str
    notes: Optional[str]
    paid_at: Optional[datetime]
    created_at: Optional[datetime]
    # Enriched display fields
    property_title: Optional[str] = None
    broker_name: Optional[str] = None

    model_config = {"from_attributes": True}
