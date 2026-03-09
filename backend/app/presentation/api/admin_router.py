from fastapi import APIRouter, Depends
from typing import List, Optional
from datetime import date as date_type
from app.application.dto.master_dto import (
    RoleCreateDTO, RoleUpdateDTO, RoleResponseDTO,
    PropertyTypeCreateDTO, PropertyTypeUpdateDTO, PropertyTypeResponseDTO,
    ListingTypeCreateDTO, ListingTypeUpdateDTO, ListingTypeResponseDTO,
    RegionCreateDTO, RegionUpdateDTO, RegionResponseDTO,
    DistrictCreateDTO, DistrictUpdateDTO, DistrictResponseDTO,
    CurrencyCreateDTO, CurrencyUpdateDTO, CurrencyResponseDTO,
    RoomTypeCreateDTO, RoomTypeUpdateDTO, RoomTypeResponseDTO,
    StatsDTO,
)
from app.application.use_cases.master_use_case import MasterUseCase
from app.presentation.dependencies.di_container import (
    get_master_use_case, require_roles, get_current_user,
    get_user_repo, get_property_repo, get_tenant_repo,
    get_lease_repo, get_payment_repo, get_maintenance_repo, get_unit_repo,
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


@public_router.get("/currencies", response_model=List[CurrencyResponseDTO])
async def list_currencies(use_case: MasterUseCase = Depends(get_master_use_case)):
    return await use_case.list_currencies()


@public_router.get("/room-types", response_model=List[RoomTypeResponseDTO])
async def list_room_types(use_case: MasterUseCase = Depends(get_master_use_case)):
    return await use_case.list_room_types()


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


@router.post("/currencies", response_model=CurrencyResponseDTO, status_code=201)
async def create_currency(
    dto: CurrencyCreateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.create_currency(dto)


@router.put("/currencies/{currency_id}", response_model=CurrencyResponseDTO)
async def update_currency(
    currency_id: int,
    dto: CurrencyUpdateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.update_currency(currency_id, dto)


@router.delete("/currencies/{currency_id}", status_code=204)
async def delete_currency(
    currency_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    await use_case.delete_currency(currency_id)


@router.post("/room-types", response_model=RoomTypeResponseDTO, status_code=201)
async def create_room_type(
    dto: RoomTypeCreateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.create_room_type(dto)


@router.put("/room-types/{type_id}", response_model=RoomTypeResponseDTO)
async def update_room_type(
    type_id: int,
    dto: RoomTypeUpdateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    return await use_case.update_room_type(type_id, dto)


@router.delete("/room-types/{type_id}", status_code=204)
async def delete_room_type(
    type_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: MasterUseCase = Depends(get_master_use_case),
):
    await use_case.delete_room_type(type_id)


@router.get("/stats", response_model=StatsDTO)
async def get_system_stats(
    _: User = Depends(require_roles("ADMIN")),
    user_repo=Depends(get_user_repo),
    property_repo=Depends(get_property_repo),
    unit_repo=Depends(get_unit_repo),
    tenant_repo=Depends(get_tenant_repo),
    lease_repo=Depends(get_lease_repo),
    payment_repo=Depends(get_payment_repo),
    maintenance_repo=Depends(get_maintenance_repo),
):
    today = date_type.today()

    total_users = await user_repo.count()
    total_properties = await property_repo.count()
    total_units = await unit_repo.count()
    tenants = await tenant_repo.get_all(limit=10000)
    leases = await lease_repo.get_all(limit=10000)
    payments = await payment_repo.get_all(limit=10000)
    maintenance = await maintenance_repo.get_all(limit=10000)
    all_users = await user_repo.get_all(limit=10000)

    active_leases = sum(1 for l in leases if l.status.value == "ACTIVE")
    pending_maintenance = sum(1 for m in maintenance if m.status.value == "PENDING")
    open_maintenance = pending_maintenance
    total_revenue = sum(float(p.amount) for p in payments if p.status.value == "PAID")
    active_users = sum(1 for u in all_users if getattr(u, "is_active", False))
    payments_this_month = sum(
        1 for p in payments
        if p.due_date and p.due_date.year == today.year and p.due_date.month == today.month
    )

    # Group users by role name
    users_by_role: dict = {}
    for u in all_users:
        role = u.role_name or "Unknown"
        users_by_role[role] = users_by_role.get(role, 0) + 1

    return StatsDTO(
        total_users=total_users,
        active_users=active_users,
        total_properties=total_properties,
        total_units=total_units,
        total_tenants=len(tenants),
        total_leases=len(leases),
        total_payments=len(payments),
        total_revenue=total_revenue,
        pending_maintenance=pending_maintenance,
        open_maintenance=open_maintenance,
        active_leases=active_leases,
        payments_this_month=payments_this_month,
        users_by_role=users_by_role,
    )
