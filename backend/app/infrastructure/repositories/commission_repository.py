from typing import List, Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.domain.repositories.i_commission_repository import ICommissionRepository
from app.domain.entities.commission import Commission
from app.infrastructure.db.models import CommissionModel


class CommissionRepository(ICommissionRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: CommissionModel) -> Commission:
        return Commission(
            id=model.id,
            property_id=model.property_id,
            broker_id=model.broker_id,
            commission_rate=Decimal(str(model.commission_rate)),
            transaction_amount=Decimal(str(model.transaction_amount)),
            status=model.status,
            notes=model.notes,
            paid_at=model.paid_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def create(self, commission: Commission) -> Commission:
        model = CommissionModel(
            property_id=commission.property_id,
            broker_id=commission.broker_id,
            commission_rate=commission.commission_rate,
            transaction_amount=commission.transaction_amount,
            status=commission.status,
            notes=commission.notes,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, commission_id: int) -> Optional[Commission]:
        result = await self._session.execute(select(CommissionModel).where(CommissionModel.id == commission_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_broker(self, broker_id: int) -> List[Commission]:
        result = await self._session.execute(select(CommissionModel).where(CommissionModel.broker_id == broker_id))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_property(self, property_id: int) -> List[Commission]:
        result = await self._session.execute(select(CommissionModel).where(CommissionModel.property_id == property_id))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Commission]:
        result = await self._session.execute(
            select(CommissionModel).offset(skip).limit(limit).order_by(CommissionModel.created_at.desc())
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, commission: Commission) -> Commission:
        result = await self._session.execute(select(CommissionModel).where(CommissionModel.id == commission.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Commission {commission.id} not found")
        for field in ["commission_rate", "transaction_amount", "status", "notes", "paid_at"]:
            setattr(model, field, getattr(commission, field))
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, commission_id: int) -> bool:
        result = await self._session.execute(select(CommissionModel).where(CommissionModel.id == commission_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True
