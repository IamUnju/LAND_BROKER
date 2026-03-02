from fastapi import APIRouter, Depends
from typing import List
from app.application.dto.unit_dto import UnitCreateDTO, UnitUpdateDTO, UnitResponseDTO
from app.application.use_cases.unit_use_case import UnitUseCase
from app.presentation.dependencies.di_container import get_unit_use_case, get_current_user, require_roles
from app.domain.entities.user import User

router = APIRouter(prefix="/units", tags=["Units"])


@router.get("/", response_model=List[UnitResponseDTO])
async def list_my_units(
    current_user: User = Depends(get_current_user),
    use_case: UnitUseCase = Depends(get_unit_use_case),
):
    role = (current_user.role_name or "").upper()
    if role == "ADMIN":
        return await use_case.list_all_units()
    return await use_case.get_owner_units(current_user.id)


@router.post("/", response_model=UnitResponseDTO, status_code=201)
async def create_unit(
    dto: UnitCreateDTO,
    current_user: User = Depends(get_current_user),
    use_case: UnitUseCase = Depends(get_unit_use_case),
):
    return await use_case.create_unit(dto, owner_id=current_user.id)


@router.get("/property/{property_id}", response_model=List[UnitResponseDTO])
async def get_property_units(
    property_id: int,
    current_user: User = Depends(get_current_user),
    use_case: UnitUseCase = Depends(get_unit_use_case),
):
    return await use_case.get_property_units(property_id)


@router.get("/{unit_id}", response_model=UnitResponseDTO)
async def get_unit(
    unit_id: int,
    current_user: User = Depends(get_current_user),
    use_case: UnitUseCase = Depends(get_unit_use_case),
):
    return await use_case.get_unit(unit_id)


@router.put("/{unit_id}", response_model=UnitResponseDTO)
async def update_unit(
    unit_id: int,
    dto: UnitUpdateDTO,
    current_user: User = Depends(get_current_user),
    use_case: UnitUseCase = Depends(get_unit_use_case),
):
    return await use_case.update_unit(unit_id, dto, owner_id=current_user.id)


@router.delete("/{unit_id}", status_code=204)
async def delete_unit(
    unit_id: int,
    current_user: User = Depends(get_current_user),
    use_case: UnitUseCase = Depends(get_unit_use_case),
):
    await use_case.delete_unit(unit_id, owner_id=current_user.id)
