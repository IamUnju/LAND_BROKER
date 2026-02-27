from typing import List, Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.domain.repositories.i_lease_repository import ILeaseRepository
from app.domain.entities.lease import Lease, LeaseStatus
from app.infrastructure.db.models import LeaseModel


class LeaseRepository(ILeaseRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: LeaseModel) -> Lease:
        return Lease(
            id=model.id,
            unit_id=model.unit_id,
            tenant_id=model.tenant_id,
            start_date=model.start_date,
            end_date=model.end_date,
            monthly_rent=Decimal(str(model.monthly_rent)),
            security_deposit=Decimal(str(model.security_deposit)),
            status=model.status,
            notes=model.notes,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def create(self, lease: Lease) -> Lease:
        model = LeaseModel(
            unit_id=lease.unit_id,
            tenant_id=lease.tenant_id,
            start_date=lease.start_date,
            end_date=lease.end_date,
            monthly_rent=lease.monthly_rent,
            security_deposit=lease.security_deposit,
            status=lease.status,
            notes=lease.notes,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, lease_id: int) -> Optional[Lease]:
        result = await self._session.execute(select(LeaseModel).where(LeaseModel.id == lease_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_unit(self, unit_id: int) -> List[Lease]:
        result = await self._session.execute(select(LeaseModel).where(LeaseModel.unit_id == unit_id))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_tenant(self, tenant_id: int) -> List[Lease]:
        result = await self._session.execute(select(LeaseModel).where(LeaseModel.tenant_id == tenant_id))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_active_lease_for_unit(self, unit_id: int) -> Optional[Lease]:
        result = await self._session.execute(
            select(LeaseModel).where(
                LeaseModel.unit_id == unit_id,
                LeaseModel.status == LeaseStatus.ACTIVE,
            )
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Lease]:
        result = await self._session.execute(
            select(LeaseModel).offset(skip).limit(limit).order_by(LeaseModel.created_at.desc())
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, lease: Lease) -> Lease:
        result = await self._session.execute(select(LeaseModel).where(LeaseModel.id == lease.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Lease {lease.id} not found")
        for field in ["start_date", "end_date", "monthly_rent", "security_deposit", "status", "notes"]:
            setattr(model, field, getattr(lease, field))
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, lease_id: int) -> bool:
        result = await self._session.execute(select(LeaseModel).where(LeaseModel.id == lease_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True
