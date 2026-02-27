from dataclasses import dataclass
from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from enum import Enum


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"


class PaymentMethod(str, Enum):
    CASH = "CASH"
    BANK_TRANSFER = "BANK_TRANSFER"
    MOBILE_MONEY = "MOBILE_MONEY"
    CARD = "CARD"
    OTHER = "OTHER"


@dataclass
class Payment:
    lease_id: int
    amount: Decimal
    due_date: date
    payment_date: Optional[date] = None
    status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()
        if isinstance(self.status, str):
            self.status = PaymentStatus(self.status)
        if isinstance(self.payment_method, str) and self.payment_method:
            self.payment_method = PaymentMethod(self.payment_method)
        if isinstance(self.due_date, str):
            self.due_date = date.fromisoformat(self.due_date)
        if isinstance(self.payment_date, str) and self.payment_date:
            self.payment_date = date.fromisoformat(self.payment_date)

    def _validate(self):
        if self.amount <= 0:
            raise ValueError("Payment amount must be positive")

    def mark_paid(self, payment_date: date, method: PaymentMethod, reference: Optional[str] = None):
        if self.status == PaymentStatus.PAID:
            raise ValueError("Payment already marked as paid")
        if self.status == PaymentStatus.CANCELLED:
            raise ValueError("Cannot pay a cancelled payment")
        self.status = PaymentStatus.PAID
        self.payment_date = payment_date
        self.payment_method = method
        self.reference_number = reference

    def mark_overdue(self):
        if self.status != PaymentStatus.PENDING:
            raise ValueError("Only pending payments can be marked overdue")
        self.status = PaymentStatus.OVERDUE

    def cancel(self):
        if self.status == PaymentStatus.PAID:
            raise ValueError("Cannot cancel a paid payment")
        self.status = PaymentStatus.CANCELLED

    @property
    def is_paid(self) -> bool:
        return self.status == PaymentStatus.PAID

    def check_overdue(self, current_date: date) -> bool:
        return self.status == PaymentStatus.PENDING and self.due_date < current_date
