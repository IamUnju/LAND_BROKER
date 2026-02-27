from fastapi import HTTPException, status
from app.domain.repositories.i_tenant_repository import ITenantRepository
from app.domain.repositories.i_user_repository import IUserRepository
from app.domain.entities.tenant import Tenant, TenantStatus
from app.application.dto.business_dto import TenantCreateDTO, TenantUpdateDTO


class TenantUseCase:
    def __init__(self, tenant_repo: ITenantRepository, user_repo: IUserRepository):
        self._tenant_repo = tenant_repo
        self._user_repo = user_repo

    async def create_tenant(self, dto: TenantCreateDTO) -> Tenant:
        user = await self._user_repo.get_by_id(dto.user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        existing = await self._tenant_repo.get_by_user_id(dto.user_id)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tenant profile already exists for this user")

        tenant = Tenant(
            user_id=dto.user_id,
            emergency_contact_name=dto.emergency_contact_name,
            emergency_contact_phone=dto.emergency_contact_phone,
            national_id=dto.national_id,
            occupation=dto.occupation,
            monthly_income=dto.monthly_income,
        )
        return await self._tenant_repo.create(tenant)

    async def get_tenant(self, tenant_id: int) -> Tenant:
        tenant = await self._tenant_repo.get_by_id(tenant_id)
        if not tenant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
        return tenant

    async def get_tenant_by_user(self, user_id: int) -> Tenant:
        tenant = await self._tenant_repo.get_by_user_id(user_id)
        if not tenant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant profile not found")
        return tenant

    async def list_tenants(self, skip: int = 0, limit: int = 100):
        return await self._tenant_repo.get_all(skip=skip, limit=limit)

    async def update_tenant(self, tenant_id: int, dto: TenantUpdateDTO) -> Tenant:
        tenant = await self.get_tenant(tenant_id)
        update_fields = dto.model_dump(exclude_none=True)
        for field, value in update_fields.items():
            setattr(tenant, field, value)
        return await self._tenant_repo.update(tenant)

    async def delete_tenant(self, tenant_id: int) -> bool:
        await self.get_tenant(tenant_id)
        return await self._tenant_repo.delete(tenant_id)

    async def blacklist_tenant(self, tenant_id: int) -> Tenant:
        tenant = await self.get_tenant(tenant_id)
        tenant.blacklist()
        return await self._tenant_repo.update(tenant)
