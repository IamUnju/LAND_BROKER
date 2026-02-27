from fastapi import HTTPException, status
from app.domain.repositories.i_maintenance_repository import IMaintenanceRepository
from app.domain.repositories.i_unit_repository import IUnitRepository
from app.domain.repositories.i_tenant_repository import ITenantRepository
from app.domain.entities.maintenance import MaintenanceRequest
from app.application.dto.business_dto import MaintenanceCreateDTO, MaintenanceUpdateDTO


class MaintenanceUseCase:
    def __init__(
        self,
        maintenance_repo: IMaintenanceRepository,
        unit_repo: IUnitRepository,
        tenant_repo: ITenantRepository,
    ):
        self._repo = maintenance_repo
        self._unit_repo = unit_repo
        self._tenant_repo = tenant_repo

    async def create_request(self, dto: MaintenanceCreateDTO, user_id: int) -> MaintenanceRequest:
        unit = await self._unit_repo.get_by_id(dto.unit_id)
        if not unit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")

        tenant = await self._tenant_repo.get_by_user_id(user_id)
        if not tenant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant profile not found")

        request = MaintenanceRequest(
            unit_id=dto.unit_id,
            tenant_id=tenant.id,
            title=dto.title,
            description=dto.description,
            priority=dto.priority,
        )
        return await self._repo.create(request)

    async def get_request(self, request_id: int) -> MaintenanceRequest:
        request = await self._repo.get_by_id(request_id)
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance request not found")
        return request

    async def list_requests(self, skip: int = 0, limit: int = 100):
        return await self._repo.get_all(skip=skip, limit=limit)

    async def get_tenant_requests(self, tenant_id: int):
        return await self._repo.get_by_tenant(tenant_id)

    async def get_unit_requests(self, unit_id: int):
        return await self._repo.get_by_unit(unit_id)

    async def update_request(self, request_id: int, dto: MaintenanceUpdateDTO) -> MaintenanceRequest:
        request = await self.get_request(request_id)
        update_fields = dto.model_dump(exclude_none=True)

        # Handle status transitions via domain methods
        new_status = update_fields.pop("status", None)
        resolution_notes = update_fields.pop("resolution_notes", None)
        assigned_to = update_fields.pop("assigned_to", None)

        for field, value in update_fields.items():
            setattr(request, field, value)

        if new_status:
            from app.domain.entities.maintenance import MaintenanceStatus
            if new_status == MaintenanceStatus.IN_PROGRESS:
                request.start_work(assigned_to=assigned_to)
            elif new_status == MaintenanceStatus.COMPLETED:
                request.complete(resolution_notes=resolution_notes)
            elif new_status == MaintenanceStatus.CANCELLED:
                request.cancel()

        return await self._repo.update(request)

    async def delete_request(self, request_id: int) -> bool:
        await self.get_request(request_id)
        return await self._repo.delete(request_id)
