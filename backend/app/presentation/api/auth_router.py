from fastapi import APIRouter, Depends
from app.application.dto.user_dto import (
    UserCreateDTO, LoginDTO, TokenDTO, RefreshTokenDTO, UserResponseDTO,
)
from app.application.use_cases.auth_use_case import AuthUseCase
from app.presentation.dependencies.di_container import get_auth_use_case, get_current_user
from app.domain.entities.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponseDTO, status_code=201)
async def register(
    dto: UserCreateDTO,
    use_case: AuthUseCase = Depends(get_auth_use_case),
):
    user = await use_case.register(dto)
    return user


@router.post("/login", response_model=TokenDTO)
async def login(
    dto: LoginDTO,
    use_case: AuthUseCase = Depends(get_auth_use_case),
):
    return await use_case.login(dto)


@router.post("/refresh", response_model=TokenDTO)
async def refresh(
    dto: RefreshTokenDTO,
    use_case: AuthUseCase = Depends(get_auth_use_case),
):
    return await use_case.refresh_token(dto)


@router.get("/me", response_model=UserResponseDTO)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
