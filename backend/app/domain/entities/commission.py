from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from decimal import Decimal
from enum import Enum


class CommissionStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    CANCELLED = "CANCELLED"


@dataclass
class Commission:
    property_id: int
    broker_id: int
    commission_rate: Decimal  # percentage e.g. 2.5 for 2.5%
    transaction_amount: Decimal
    status: CommissionStatus = CommissionStatus.PENDING
    notes: Optional[str] = None
    paid_at: Optional[datetime] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()
        if isinstance(self.status, str):
            self.status = CommissionStatus(self.status)

    def _validate(self):
        if self.commission_rate <= 0 or self.commission_rate > 100:
            raise ValueError("Commission rate must be between 0 and 100")
        if self.transaction_amount <= 0:
            raise ValueError("Transaction amount must be positive")

    @property
    def commission_amount(self) -> Decimal:
        return (self.transaction_amount * self.commission_rate / 100).quantize(Decimal("0.01"))

    def mark_paid(self):
        if self.status != CommissionStatus.PENDING:
            raise ValueError("Only pending commissions can be marked as paid")
        self.status = CommissionStatus.PAID
        self.paid_at = datetime.utcnow()

    def cancel(self):
        if self.status == CommissionStatus.PAID:
            raise ValueError("Cannot cancel a paid commission")
        self.status = CommissionStatus.CANCELLED
