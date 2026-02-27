from dataclasses import dataclass
from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from enum import Enum


class LeaseStatus(str, Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    TERMINATED = "TERMINATED"
    PENDING = "PENDING"


@dataclass
class Lease:
    unit_id: int
    tenant_id: int
    start_date: date
    end_date: date
    monthly_rent: Decimal
    security_deposit: Decimal
    status: LeaseStatus = LeaseStatus.PENDING
    notes: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()
        if isinstance(self.status, str):
            self.status = LeaseStatus(self.status)
        if isinstance(self.start_date, str):
            self.start_date = date.fromisoformat(self.start_date)
        if isinstance(self.end_date, str):
            self.end_date = date.fromisoformat(self.end_date)

    def _validate(self):
        if self.monthly_rent <= 0:
            raise ValueError("Monthly rent must be positive")
        if self.security_deposit < 0:
            raise ValueError("Security deposit cannot be negative")

    def validate_dates(self):
        if self.start_date >= self.end_date:
            raise ValueError("End date must be after start date")

    def activate(self):
        if self.status != LeaseStatus.PENDING:
            raise ValueError("Only pending leases can be activated")
        self.status = LeaseStatus.ACTIVE

    def terminate(self):
        if self.status not in (LeaseStatus.ACTIVE, LeaseStatus.PENDING):
            raise ValueError("Only active or pending leases can be terminated")
        self.status = LeaseStatus.TERMINATED

    def expire(self):
        self.status = LeaseStatus.EXPIRED

    @property
    def is_active(self) -> bool:
        return self.status == LeaseStatus.ACTIVE

    @property
    def duration_months(self) -> int:
        return (
            (self.end_date.year - self.start_date.year) * 12
            + (self.end_date.month - self.start_date.month)
        )

    @property
    def total_rent(self) -> Decimal:
        return self.monthly_rent * self.duration_months
