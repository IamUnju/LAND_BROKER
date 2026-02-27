from decimal import Decimal
from app.domain.entities.commission import Commission, CommissionStatus
from app.domain.entities.property import Property


class CommissionDomainService:
    """Domain service for broker commission calculations."""

    @staticmethod
    def calculate_commission(transaction_amount: Decimal, rate: Decimal) -> Decimal:
        """Calculate commission amount given transaction amount and rate (%)."""
        if rate <= 0 or rate > 100:
            raise ValueError("Commission rate must be between 0 and 100")
        if transaction_amount <= 0:
            raise ValueError("Transaction amount must be positive")
        return (transaction_amount * rate / 100).quantize(Decimal("0.01"))

    @staticmethod
    def create_commission(
        property_id: int,
        broker_id: int,
        transaction_amount: Decimal,
        commission_rate: Decimal,
        notes: str = None,
    ) -> Commission:
        """Factory method: create a new commission with validation."""
        commission = Commission(
            property_id=property_id,
            broker_id=broker_id,
            commission_rate=commission_rate,
            transaction_amount=transaction_amount,
            notes=notes,
        )
        return commission
