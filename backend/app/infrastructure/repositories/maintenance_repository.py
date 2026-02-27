from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.domain.repositories.i_maintenance_repository import IMaintenanceRepository
from app.domain.entities.maintenance import MaintenanceRequest
from app.infrastructure.db.models import MaintenanceModel


class MaintenanceRepository(IMaintenanceRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: MaintenanceModel) -> MaintenanceRequest:
        return MaintenanceRequest(
            id=model.id,
            unit_id=model.unit_id,
            tenant_id=model.tenant_id,
            title=model.title,
            description=model.description,
            priority=model.priority,
            status=model.status,
            assigned_to=model.assigned_to,
            resolution_notes=model.resolution_notes,
            resolved_at=model.resolved_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def create(self, request: MaintenanceRequest) -> MaintenanceRequest:
        model = MaintenanceModel(
            unit_id=request.unit_id,
            tenant_id=request.tenant_id,
            title=request.title,
            description=request.description,
            priority=request.priority,
            status=request.status,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, request_id: int) -> Optional[MaintenanceRequest]:
        result = await self._session.execute(select(MaintenanceModel).where(MaintenanceModel.id == request_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_unit(self, unit_id: int) -> List[MaintenanceRequest]:
        result = await self._session.execute(select(MaintenanceModel).where(MaintenanceModel.unit_id == unit_id))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_tenant(self, tenant_id: int) -> List[MaintenanceRequest]:
        result = await self._session.execute(select(MaintenanceModel).where(MaintenanceModel.tenant_id == tenant_id))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[MaintenanceRequest]:
        result = await self._session.execute(
            select(MaintenanceModel).offset(skip).limit(limit).order_by(MaintenanceModel.created_at.desc())
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, request: MaintenanceRequest) -> MaintenanceRequest:
        result = await self._session.execute(select(MaintenanceModel).where(MaintenanceModel.id == request.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"MaintenanceRequest {request.id} not found")
        for field in ["title", "description", "priority", "status",
                      "assigned_to", "resolution_notes", "resolved_at"]:
            setattr(model, field, getattr(request, field))
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, request_id: int) -> bool:
        result = await self._session.execute(select(MaintenanceModel).where(MaintenanceModel.id == request_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True
