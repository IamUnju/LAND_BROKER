from fastapi import HTTPException, status
from app.domain.repositories.i_lease_repository import ILeaseRepository
from app.domain.repositories.i_unit_repository import IUnitRepository
from app.domain.repositories.i_tenant_repository import ITenantRepository
from app.domain.entities.lease import Lease, LeaseStatus
from app.application.dto.business_dto import LeaseCreateDTO, LeaseUpdateDTO


class LeaseUseCase:
    def __init__(
        self,
        lease_repo: ILeaseRepository,
        unit_repo: IUnitRepository,
        tenant_repo: ITenantRepository,
    ):
        self._lease_repo = lease_repo
        self._unit_repo = unit_repo
        self._tenant_repo = tenant_repo

    async def create_lease(self, dto: LeaseCreateDTO) -> Lease:
        unit = await self._unit_repo.get_by_id(dto.unit_id)
        if not unit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")
        if not unit.is_available:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Unit is not available")

        tenant = await self._tenant_repo.get_by_id(dto.tenant_id)
        if not tenant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

        # Check no active lease exists for this unit
        active = await self._lease_repo.get_active_lease_for_unit(dto.unit_id)
        if active:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Unit already has an active lease")

        lease = Lease(
            unit_id=dto.unit_id,
            tenant_id=dto.tenant_id,
            start_date=dto.start_date,
            end_date=dto.end_date,
            monthly_rent=dto.monthly_rent,
            security_deposit=dto.security_deposit,
            notes=dto.notes,
        )
        lease.validate_dates()
        created = await self._lease_repo.create(lease)

        # Mark unit as occupied
        unit.occupy()
        await self._unit_repo.update(unit)

        return created

    async def get_lease(self, lease_id: int) -> Lease:
        lease = await self._lease_repo.get_by_id(lease_id)
        if not lease:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lease not found")
        return lease

    async def list_leases(self, skip: int = 0, limit: int = 100):
        return await self._lease_repo.get_all(skip=skip, limit=limit)

    async def get_leases_by_user(self, user_id: int):
        """Get leases belonging to the tenant profile linked to this user_id."""
        tenant = await self._tenant_repo.get_by_user_id(user_id)
        if not tenant:
            return []
        return await self._lease_repo.get_by_tenant(tenant.id)

    async def get_unit_leases(self, unit_id: int):
        return await self._lease_repo.get_by_unit(unit_id)

    async def get_tenant_leases(self, tenant_id: int):
        return await self._lease_repo.get_by_tenant(tenant_id)

    async def activate_lease(self, lease_id: int) -> Lease:
        lease = await self.get_lease(lease_id)
        lease.activate()
        return await self._lease_repo.update(lease)

    async def terminate_lease(self, lease_id: int) -> Lease:
        lease = await self.get_lease(lease_id)
        lease.terminate()
        updated = await self._lease_repo.update(lease)

        # Vacate the unit
        unit = await self._unit_repo.get_by_id(lease.unit_id)
        if unit:
            unit.vacate()
            await self._unit_repo.update(unit)

        return updated

    async def update_lease(self, lease_id: int, dto: LeaseUpdateDTO) -> Lease:
        lease = await self.get_lease(lease_id)
        update_fields = dto.model_dump(exclude_none=True)
        for field, value in update_fields.items():
            setattr(lease, field, value)
        return await self._lease_repo.update(lease)

    async def delete_lease(self, lease_id: int) -> bool:
        await self.get_lease(lease_id)
        return await self._lease_repo.delete(lease_id)
