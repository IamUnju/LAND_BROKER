from typing import List, Optional
from decimal import Decimal
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, extract
from app.domain.repositories.i_payment_repository import IPaymentRepository
from app.domain.entities.payment import Payment, PaymentStatus, PaymentMethod
from app.infrastructure.db.models import PaymentModel


class PaymentRepository(IPaymentRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: PaymentModel) -> Payment:
        return Payment(
            id=model.id,
            lease_id=model.lease_id,
            amount=Decimal(str(model.amount)),
            due_date=model.due_date,
            payment_date=model.payment_date,
            status=model.status,
            payment_method=model.payment_method,
            reference_number=model.reference_number,
            notes=model.notes,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def create(self, payment: Payment) -> Payment:
        model = PaymentModel(
            lease_id=payment.lease_id,
            amount=payment.amount,
            due_date=payment.due_date,
            payment_date=payment.payment_date,
            status=payment.status,
            payment_method=payment.payment_method,
            reference_number=payment.reference_number,
            notes=payment.notes,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, payment_id: int) -> Optional[Payment]:
        result = await self._session.execute(select(PaymentModel).where(PaymentModel.id == payment_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_lease(self, lease_id: int) -> List[Payment]:
        result = await self._session.execute(
            select(PaymentModel).where(PaymentModel.lease_id == lease_id).order_by(PaymentModel.due_date)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_overdue(self, as_of_date: date) -> List[Payment]:
        result = await self._session.execute(
            select(PaymentModel).where(
                and_(
                    PaymentModel.status == PaymentStatus.PENDING,
                    PaymentModel.due_date < as_of_date,
                )
            )
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Payment]:
        result = await self._session.execute(
            select(PaymentModel).offset(skip).limit(limit).order_by(PaymentModel.due_date.desc())
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, payment: Payment) -> Payment:
        result = await self._session.execute(select(PaymentModel).where(PaymentModel.id == payment.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Payment {payment.id} not found")
        for field in ["amount", "due_date", "payment_date", "status",
                      "payment_method", "reference_number", "notes"]:
            setattr(model, field, getattr(payment, field))
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, payment_id: int) -> bool:
        result = await self._session.execute(select(PaymentModel).where(PaymentModel.id == payment_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True

    async def get_monthly_summary(self, year: int, month: int) -> dict:
        result = await self._session.execute(
            select(
                func.count(PaymentModel.id).label("total_payments"),
                func.sum(PaymentModel.amount).filter(PaymentModel.status == PaymentStatus.PAID).label("total_collected"),
                func.sum(PaymentModel.amount).filter(PaymentModel.status == PaymentStatus.PENDING).label("total_pending"),
                func.sum(PaymentModel.amount).filter(PaymentModel.status == PaymentStatus.OVERDUE).label("total_overdue"),
            ).where(
                and_(
                    extract("year", PaymentModel.due_date) == year,
                    extract("month", PaymentModel.due_date) == month,
                )
            )
        )
        row = result.one()
        return {
            "year": year,
            "month": month,
            "total_payments": row.total_payments or 0,
            "total_collected": float(row.total_collected or 0),
            "total_pending": float(row.total_pending or 0),
            "total_overdue": float(row.total_overdue or 0),
        }
