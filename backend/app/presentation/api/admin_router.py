from fastapi import APIRouter, Depends
from typing import List, Optional
from app.application.dto.master_dto import (
    RoleCreateDTO, RoleUpdateDTO, RoleResponseDTO,
    PropertyTypeCreateDTO, PropertyTypeUpdateDTO, PropertyTypeResponseDTO,
    ListingTypeCreateDTO, ListingTypeUpdateDTO, ListingTypeResponseDTO,
    RegionCreateDTO, RegionUpdateDTO, RegionResponseDTO,
    DistrictCreateDTO, DistrictUpdateDTO, DistrictResponseDTO,
    StatsDTO,
)
from app.application.use_cases.master_use_case import MasterUseCase
from app.presentation.dependencies.di_container import (
    get_master_use_case, require_roles, get_current_user,
    get_user_repo, get_property_repo, get_tenant_repo,
    get_lease_repo, get_payment_repo, get_maintenance_repo,
)
from app.domain.entities.user import User
from sqlalchemy import func, select
from app.infrastructure.db.models import (
    UserModel, PropertyModel, TenantModel, LeaseModel,
    PaymentModel, MaintenanceModel,
)
from app.domain.entities.lease import LeaseStatus
from app.domain.entities.payment import PaymentStatus
from app.domain.entities.maintenance import MaintenanceStatus

router = APIRouter(prefix="/admin", tags=["Admin"])
public_router = APIRouter(prefix="/master", tags=["Master Data"])


# ─── PUBLIC Master Data Endpoints ────────────────────────────────────────────
@public_router.get("/roles", response_model=List[RoleResponseDTO])
async def list_roles(use_case: MasterUseCase = Depends(get_master_use_case)):
    return await use_case.list_roles()


@public_router.get("/property-types", response_model=List[PropertyTypeResponseDTO])
async def list_property_types(use_case: MasterUseCase = Depends(get_master_use_case)):
    return await use_case.list_property_types()


@public_router.get("/listing-types", response_model=List[ListingTypeResponseDTO])
async def list_listing_types(use_case: MasterUseCase = Depends(get_master_use_case)):
    return await use_case.list_listing_types()


@public_router.get("/regions", response_model=List[RegionResponseDTO])
async def list_regions(use_case: MasterUseCase = Depends(get_master_use_case)):
    return await use_case.list_regions()


@public_router.get("/districts", response_model=List[DistrictResponseDTO])
async def list_districts(
    region_id: Optional[int] = None,
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.list_districts(region_id=region_id)


# ─── ADMIN-ONLY Master Data CRUD ─────────────────────────────────────────────
@router.post("/roles", response_model=RoleResponseDTO, status_code=201)
async def create_role(
    dto: RoleCreateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.create_role(dto)


@router.put("/roles/{role_id}", response_model=RoleResponseDTO)
async def update_role(
    role_id: int,
    dto: RoleUpdateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.update_role(role_id, dto)


@router.delete("/roles/{role_id}", status_code=204)
async def delete_role(
    role_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    await use_case.delete_role(role_id)


@router.post("/property-types", response_model=PropertyTypeResponseDTO, status_code=201)
async def create_property_type(
    dto: PropertyTypeCreateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.create_property_type(dto)


@router.put("/property-types/{type_id}", response_model=PropertyTypeResponseDTO)
async def update_property_type(
    type_id: int,
    dto: PropertyTypeUpdateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.update_property_type(type_id, dto)


@router.delete("/property-types/{type_id}", status_code=204)
async def delete_property_type(
    type_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    await use_case.delete_property_type(type_id)


@router.post("/listing-types", response_model=ListingTypeResponseDTO, status_code=201)
async def create_listing_type(
    dto: ListingTypeCreateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.create_listing_type(dto)


@router.put("/listing-types/{type_id}", response_model=ListingTypeResponseDTO)
async def update_listing_type(
    type_id: int,
    dto: ListingTypeUpdateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.update_listing_type(type_id, dto)


@router.delete("/listing-types/{type_id}", status_code=204)
async def delete_listing_type(
    type_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    await use_case.delete_listing_type(type_id)


@router.post("/regions", response_model=RegionResponseDTO, status_code=201)
async def create_region(
    dto: RegionCreateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.create_region(dto)


@router.put("/regions/{region_id}", response_model=RegionResponseDTO)
async def update_region(
    region_id: int,
    dto: RegionUpdateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.update_region(region_id, dto)


@router.delete("/regions/{region_id}", status_code=204)
async def delete_region(
    region_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    await use_case.delete_region(region_id)


@router.post("/districts", response_model=DistrictResponseDTO, status_code=201)
async def create_district(
    dto: DistrictCreateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.create_district(dto)


@router.put("/districts/{district_id}", response_model=DistrictResponseDTO)
async def update_district(
    district_id: int,
    dto: DistrictUpdateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.update_district(district_id, dto)


@router.delete("/districts/{district_id}", status_code=204)
async def delete_district(
    district_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    await use_case.delete_district(district_id)


@router.get("/stats", response_model=StatsDTO)
async def get_system_stats(
    _: User = Depends(require_roles("ADMIN")),
    user_repo=Depends(get_user_repo),
    property_repo=Depends(get_property_repo),
    tenant_repo=Depends(get_tenant_repo),
    lease_repo=Depends(get_lease_repo),
    payment_repo=Depends(get_payment_repo),
    maintenance_repo=Depends(get_maintenance_repo),
):
    total_users = await user_repo.count()
    total_properties = await property_repo.count()
    tenants = await tenant_repo.get_all(limit=10000)
    leases = await lease_repo.get_all(limit=10000)
    payments = await payment_repo.get_all(limit=10000)
    maintenance = await maintenance_repo.get_all(limit=10000)

    active_leases = sum(1 for l in leases if l.status.value == "ACTIVE")
    pending_maintenance = sum(1 for m in maintenance if m.status.value == "PENDING")
    total_revenue = sum(float(p.amount) for p in payments if p.status.value == "PAID")

    return StatsDTO(
        total_users=total_users,
        total_properties=total_properties,
        total_tenants=len(tenants),
        total_leases=len(leases),
        total_payments=len(payments),
        total_revenue=total_revenue,
        pending_maintenance=pending_maintenance,
        active_leases=active_leases,
    )
