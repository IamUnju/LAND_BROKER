from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.domain.repositories.i_tenant_repository import ITenantRepository
from app.domain.entities.tenant import Tenant, TenantStatus
from app.infrastructure.db.models import TenantModel


class TenantRepository(ITenantRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: TenantModel) -> Tenant:
        return Tenant(
            id=model.id,
            user_id=model.user_id,
            emergency_contact_name=model.emergency_contact_name,
            emergency_contact_phone=model.emergency_contact_phone,
            national_id=model.national_id,
            occupation=model.occupation,
            monthly_income=float(model.monthly_income) if model.monthly_income else None,
            status=model.status,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def create(self, tenant: Tenant) -> Tenant:
        model = TenantModel(
            user_id=tenant.user_id,
            emergency_contact_name=tenant.emergency_contact_name,
            emergency_contact_phone=tenant.emergency_contact_phone,
            national_id=tenant.national_id,
            occupation=tenant.occupation,
            monthly_income=tenant.monthly_income,
            status=tenant.status,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, tenant_id: int) -> Optional[Tenant]:
        result = await self._session.execute(select(TenantModel).where(TenantModel.id == tenant_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_user_id(self, user_id: int) -> Optional[Tenant]:
        result = await self._session.execute(select(TenantModel).where(TenantModel.user_id == user_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Tenant]:
        result = await self._session.execute(select(TenantModel).offset(skip).limit(limit))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, tenant: Tenant) -> Tenant:
        result = await self._session.execute(select(TenantModel).where(TenantModel.id == tenant.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Tenant {tenant.id} not found")
        for field in ["emergency_contact_name", "emergency_contact_phone",
                      "national_id", "occupation", "monthly_income", "status"]:
            setattr(model, field, getattr(tenant, field))
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, tenant_id: int) -> bool:
        result = await self._session.execute(select(TenantModel).where(TenantModel.id == tenant_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True
