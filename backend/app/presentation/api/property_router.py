from fastapi import APIRouter, Depends, Query
from typing import Optional
from decimal import Decimal
from app.application.dto.property_dto import (
    PropertyCreateDTO, PropertyUpdateDTO, PropertyResponseDTO,
    PropertyListDTO, PropertyFilterDTO, PropertyDetailDTO,
)
from app.application.use_cases.property_use_case import PropertyUseCase
from app.presentation.dependencies.di_container import (
    get_property_use_case, get_current_user, require_roles,
)
from app.domain.entities.user import User

router = APIRouter(prefix="/properties", tags=["Properties"])

# ── Role name helper ──────────────────────────────────────────────────────────
def _role(user: User) -> str:
    return (user.role_name or "").upper()


def _build_filters(
    district_id: Optional[int] = None,
    property_type_id: Optional[int] = None,
    listing_type_id: Optional[int] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    bedrooms: Optional[int] = None,
    is_furnished: Optional[bool] = None,
    owner_id: Optional[int] = None,
    broker_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
) -> PropertyFilterDTO:
    return PropertyFilterDTO(
        district_id=district_id,
        property_type_id=property_type_id,
        listing_type_id=listing_type_id,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        is_furnished=is_furnished,
        owner_id=owner_id,
        broker_id=broker_id,
        skip=skip,
        limit=limit,
    )


# Public marketplace endpoint
@router.get("/public", response_model=PropertyListDTO)
async def list_published_properties(
    filters: PropertyFilterDTO = Depends(_build_filters),
    use_case: PropertyUseCase = Depends(get_property_use_case),
):
    return await use_case.get_published_properties(filters)


@router.get("/public/{property_id}", response_model=PropertyDetailDTO)
async def get_published_property(
    property_id: int,
    use_case: PropertyUseCase = Depends(get_property_use_case),
):
    return await use_case.get_property(property_id)


# ── GET /my: role-aware listing ─────────────────────────────────────────────
@router.get("/my", response_model=PropertyListDTO)
async def my_properties(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    use_case: PropertyUseCase = Depends(get_property_use_case),
):
    role = _role(current_user)
    if role == "BROKER":
        return await use_case.get_broker_properties(broker_id=current_user.id, skip=skip, limit=limit)
    if role == "ADMIN":
        return await use_case.list_properties(PropertyFilterDTO(skip=skip, limit=limit))
    return await use_case.get_owner_properties(owner_id=current_user.id, skip=skip, limit=limit)


# ── GET /: admin only ────────────────────────────────────────────────────────
@router.get("/", response_model=PropertyListDTO)
async def list_all_properties(
    filters: PropertyFilterDTO = Depends(_build_filters),
    current_user: User = Depends(require_roles("ADMIN")),
    use_case: PropertyUseCase = Depends(get_property_use_case),
):
    return await use_case.list_properties(filters)


# ── POST /: owner or admin ───────────────────────────────────────────────────
@router.post("/", response_model=PropertyResponseDTO, status_code=201)
async def create_property(
    dto: PropertyCreateDTO,
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    use_case: PropertyUseCase = Depends(get_property_use_case),
):
    return await use_case.create_property(dto, owner_id=current_user.id)


# ── GET /{id} ────────────────────────────────────────────────────────────────
@router.get("/{property_id}", response_model=PropertyDetailDTO)
async def get_property(
    property_id: int,
    current_user: User = Depends(get_current_user),
    use_case: PropertyUseCase = Depends(get_property_use_case),
):
    return await use_case.get_property(property_id)


# ── PUT /{id}: owner, broker, admin ─────────────────────────────────────────
@router.put("/{property_id}", response_model=PropertyResponseDTO)
async def update_property(
    property_id: int,
    dto: PropertyUpdateDTO,
    current_user: User = Depends(require_roles("OWNER", "BROKER", "ADMIN")),
    use_case: PropertyUseCase = Depends(get_property_use_case),
):
    return await use_case.update_property(
        property_id, dto, user_id=current_user.id, role_name=_role(current_user)
    )


# ── DELETE /{id}: owner or admin only (no broker) ───────────────────────────
@router.delete("/{property_id}", status_code=204)
async def delete_property(
    property_id: int,
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    use_case: PropertyUseCase = Depends(get_property_use_case),
):
    await use_case.delete_property(
        property_id, user_id=current_user.id, role_name=_role(current_user)
    )


# ── PATCH publish / unpublish: owner, broker, admin ─────────────────────────
@router.patch("/{property_id}/publish", response_model=PropertyResponseDTO)
async def publish_property(
    property_id: int,
    current_user: User = Depends(require_roles("OWNER", "BROKER", "ADMIN")),
    use_case: PropertyUseCase = Depends(get_property_use_case),
):
    return await use_case.publish_property(
        property_id, user_id=current_user.id, role_name=_role(current_user)
    )


@router.patch("/{property_id}/unpublish", response_model=PropertyResponseDTO)
async def unpublish_property(
    property_id: int,
    current_user: User = Depends(require_roles("OWNER", "BROKER", "ADMIN")),
    use_case: PropertyUseCase = Depends(get_property_use_case),
):
    return await use_case.unpublish_property(
        property_id, user_id=current_user.id, role_name=_role(current_user)
    )
