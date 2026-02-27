from datetime import date
from fastapi import HTTPException, status
from app.domain.repositories.i_payment_repository import IPaymentRepository
from app.domain.repositories.i_lease_repository import ILeaseRepository
from app.domain.entities.payment import Payment, PaymentStatus, PaymentMethod
from app.domain.services.payment_service import PaymentDomainService
from app.application.dto.business_dto import PaymentCreateDTO, PaymentMarkPaidDTO


class PaymentUseCase:
    def __init__(
        self,
        payment_repo: IPaymentRepository,
        lease_repo: ILeaseRepository,
    ):
        self._payment_repo = payment_repo
        self._lease_repo = lease_repo

    async def create_payment(self, dto: PaymentCreateDTO) -> Payment:
        lease = await self._lease_repo.get_by_id(dto.lease_id)
        if not lease:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found")

        payment = Payment(
            lease_id=dto.lease_id,
            amount=dto.amount,
            due_date=dto.due_date,
            notes=dto.notes,
        )
        return await self._payment_repo.create(payment)

    async def generate_lease_payments(self, lease_id: int):
        lease = await self._lease_repo.get_by_id(lease_id)
        if not lease:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found")
        if not lease.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lease is not active")

        payments = PaymentDomainService.generate_monthly_payments(lease)
        created = []
        for p in payments:
            created.append(await self._payment_repo.create(p))
        return created

    async def get_payment(self, payment_id: int) -> Payment:
        payment = await self._payment_repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
        return payment

    async def get_lease_payments(self, lease_id: int):
        return await self._payment_repo.get_by_lease(lease_id)

    async def list_payments(self, skip: int = 0, limit: int = 100):
        return await self._payment_repo.get_all(skip=skip, limit=limit)

    async def mark_paid(self, payment_id: int, dto: PaymentMarkPaidDTO) -> Payment:
        payment = await self.get_payment(payment_id)
        payment.mark_paid(
            payment_date=dto.payment_date,
            method=dto.payment_method,
            reference=dto.reference_number,
        )
        return await self._payment_repo.update(payment)

    async def get_outstanding_balance(self, lease_id: int):
        payments = await self._payment_repo.get_by_lease(lease_id)
        balance = PaymentDomainService.calculate_outstanding_balance(payments)
        total_paid = PaymentDomainService.calculate_total_paid(payments)
        return {
            "lease_id": lease_id,
            "outstanding_balance": balance,
            "total_paid": total_paid,
        }

    async def get_monthly_report(self, year: int, month: int):
        return await self._payment_repo.get_monthly_summary(year, month)

    async def mark_overdue(self, payment_id: int) -> Payment:
        payment = await self.get_payment(payment_id)
        payment.mark_overdue()
        return await self._payment_repo.update(payment)

    async def delete_payment(self, payment_id: int) -> bool:
        await self.get_payment(payment_id)
        return await self._payment_repo.delete(payment_id)
