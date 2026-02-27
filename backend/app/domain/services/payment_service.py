from decimal import Decimal
from datetime import date
from typing import List, Optional
from app.domain.entities.payment import Payment, PaymentStatus
from app.domain.entities.lease import Lease


class PaymentDomainService:
    """Domain service for payment business rules that span multiple entities."""

    @staticmethod
    def calculate_outstanding_balance(payments: List[Payment]) -> Decimal:
        """Calculate the total outstanding balance (unpaid payments)."""
        return sum(
            p.amount
            for p in payments
            if p.status in (PaymentStatus.PENDING, PaymentStatus.OVERDUE)
        ) or Decimal("0.00")

    @staticmethod
    def calculate_total_paid(payments: List[Payment]) -> Decimal:
        """Calculate total amount paid."""
        return sum(
            p.amount for p in payments if p.status == PaymentStatus.PAID
        ) or Decimal("0.00")

    @staticmethod
    def generate_monthly_payments(lease: Lease) -> List[Payment]:
        """Generate monthly payment records for a lease."""
        from datetime import timedelta
        payments = []
        current_date = lease.start_date.replace(day=1)
        end_date = lease.end_date

        while current_date <= end_date:
            due_date = current_date.replace(day=lease.start_date.day)
            if due_date > end_date:
                break
            payment = Payment(
                lease_id=lease.id,
                amount=lease.monthly_rent,
                due_date=due_date,
                status=PaymentStatus.PENDING,
            )
            payments.append(payment)
            # Advance by one month
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)

        return payments

    @staticmethod
    def mark_overdue_payments(payments: List[Payment], as_of_date: Optional[date] = None) -> List[Payment]:
        """Mark all pending past-due payments as overdue."""
        check_date = as_of_date or date.today()
        updated = []
        for payment in payments:
            if payment.check_overdue(check_date):
                payment.mark_overdue()
                updated.append(payment)
        return updated
