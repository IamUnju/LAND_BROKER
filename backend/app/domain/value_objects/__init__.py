from dataclasses import dataclass
from decimal import Decimal
from typing import Optional


@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str = "USD"

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("Money amount cannot be negative")
        if not self.currency or len(self.currency) != 3:
            raise ValueError("Currency must be a 3-letter ISO code")

    def add(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("Cannot add amounts with different currencies")
        return Money(amount=self.amount + other.amount, currency=self.currency)

    def subtract(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("Cannot subtract amounts with different currencies")
        result = self.amount - other.amount
        if result < 0:
            raise ValueError("Result cannot be negative")
        return Money(amount=result, currency=self.currency)

    def multiply(self, factor: Decimal) -> "Money":
        if factor < 0:
            raise ValueError("Factor cannot be negative")
        return Money(amount=(self.amount * factor).quantize(Decimal("0.01")), currency=self.currency)

    def __str__(self) -> str:
        return f"{self.currency} {self.amount:.2f}"


@dataclass(frozen=True)
class Email:
    value: str

    def __post_init__(self):
        import re
        if not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", self.value):
            raise ValueError(f"Invalid email: {self.value}")

    def __str__(self) -> str:
        return self.value


@dataclass(frozen=True)
class PhoneNumber:
    value: str

    def __post_init__(self):
        import re
        cleaned = re.sub(r"[\s\-\(\)]", "", self.value)
        if not re.match(r"^\+?[1-9]\d{6,14}$", cleaned):
            raise ValueError(f"Invalid phone number: {self.value}")

    def __str__(self) -> str:
        return self.value


@dataclass(frozen=True)
class Address:
    street: str
    city: str
    district: str
    region: str
    country: str = "GH"
    postal_code: Optional[str] = None

    def __post_init__(self):
        if not all([self.street, self.city, self.district, self.region]):
            raise ValueError("Address requires at least street, city, district, and region")

    def __str__(self) -> str:
        parts = [self.street, self.city, self.district, self.region, self.country]
        if self.postal_code:
            parts.append(self.postal_code)
        return ", ".join(parts)


@dataclass(frozen=True)
class CommissionRate:
    value: Decimal

    def __post_init__(self):
        if self.value <= 0 or self.value > 100:
            raise ValueError("Commission rate must be between 0 and 100")

    def calculate(self, transaction_amount: Decimal) -> Decimal:
        return (transaction_amount * self.value / 100).quantize(Decimal("0.01"))

    def __str__(self) -> str:
        return f"{self.value}%"
