from fastapi import APIRouter, Depends, Query
from app.application.dto.user_dto import UserUpdateDTO, UserResponseDTO, UserListDTO, AdminUserCreateDTO, AdminPasswordUpdateDTO
from app.application.use_cases.user_use_case import UserUseCase
from app.presentation.dependencies.di_container import (
    get_user_use_case, get_current_user, require_roles,
)
from app.domain.entities.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("", response_model=UserResponseDTO, status_code=201)
async def admin_create_user(
    dto: AdminUserCreateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: UserUseCase = Depends(get_user_use_case),
):
    """Admin-only: create a user with any role (OWNER, BROKER, TENANT, etc.)"""
    return await use_case.admin_create_user(dto)


@router.get("/brokers", response_model=UserListDTO)
async def list_brokers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    _: User = Depends(require_roles("ADMIN", "OWNER")),
    use_case: UserUseCase = Depends(get_user_use_case),
):
    """List all active users with BROKER role (accessible by ADMIN and OWNER)."""
    return await use_case.list_by_role("BROKER", skip=skip, limit=limit)


@router.get("/owners", response_model=UserListDTO)
async def list_owners(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    _: User = Depends(require_roles("ADMIN")),
    use_case: UserUseCase = Depends(get_user_use_case),
):
    """Admin-only: list all active users with OWNER role."""
    return await use_case.list_by_role("OWNER", skip=skip, limit=limit)


@router.get("", response_model=UserListDTO)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(require_roles("ADMIN")),
    use_case: UserUseCase = Depends(get_user_use_case),
):
    return await use_case.list_users(skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponseDTO)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    use_case: UserUseCase = Depends(get_user_use_case),
):
    return await use_case.get_user(user_id)


@router.put("/{user_id}", response_model=UserResponseDTO)
async def update_user(
    user_id: int,
    dto: UserUpdateDTO,
    current_user: User = Depends(get_current_user),
    use_case: UserUseCase = Depends(get_user_use_case),
):
    return await use_case.update_user(user_id, dto)


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: UserUseCase = Depends(get_user_use_case),
):
    await use_case.delete_user(user_id)


@router.patch("/{user_id}/activate", response_model=UserResponseDTO)
async def activate_user(
    user_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: UserUseCase = Depends(get_user_use_case),
):
    return await use_case.activate_user(user_id)


@router.patch("/{user_id}/deactivate", response_model=UserResponseDTO)
async def deactivate_user(
    user_id: int,
    _: User = Depends(require_roles("ADMIN")),
    use_case: UserUseCase = Depends(get_user_use_case),
):
    return await use_case.deactivate_user(user_id)


@router.patch("/{user_id}/password", response_model=UserResponseDTO)
async def update_user_password(
    user_id: int,
    dto: AdminPasswordUpdateDTO,
    _: User = Depends(require_roles("ADMIN")),
    use_case: UserUseCase = Depends(get_user_use_case),
):
    """Admin-only: Update any user's password."""
    return await use_case.admin_update_password(user_id, dto)
