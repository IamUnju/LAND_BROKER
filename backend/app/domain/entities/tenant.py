from dataclasses import dataclass
from datetime import datetime, date
from typing import Optional
from enum import Enum


class TenantStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    BLACKLISTED = "BLACKLISTED"


@dataclass
class Tenant:
    user_id: int
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    national_id: Optional[str] = None
    occupation: Optional[str] = None
    monthly_income: Optional[float] = None
    status: TenantStatus = TenantStatus.ACTIVE
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()
        if isinstance(self.status, str):
            self.status = TenantStatus(self.status)

    def _validate(self):
        if not self.user_id or self.user_id <= 0:
            raise ValueError("Tenant must be linked to a valid user")
        if self.monthly_income is not None and self.monthly_income < 0:
            raise ValueError("Monthly income cannot be negative")

    def blacklist(self):
        self.status = TenantStatus.BLACKLISTED

    def activate(self):
        if self.status == TenantStatus.BLACKLISTED:
            raise ValueError("Cannot activate a blacklisted tenant")
        self.status = TenantStatus.ACTIVE

    def deactivate(self):
        self.status = TenantStatus.INACTIVE
