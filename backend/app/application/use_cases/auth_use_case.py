from app.domain.repositories.i_user_repository import IUserRepository
from app.domain.entities.user import User
from app.application.dto.user_dto import (
    UserCreateDTO, LoginDTO, TokenDTO, RefreshTokenDTO,
)
from app.infrastructure.security.password import PasswordHasher
from app.infrastructure.security.jwt import JWTService
from fastapi import HTTPException, status


class AuthUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        password_hasher: PasswordHasher,
        jwt_service: JWTService,
    ):
        self._user_repo = user_repo
        self._password_hasher = password_hasher
        self._jwt_service = jwt_service

    async def register(self, dto: UserCreateDTO) -> User:
        existing = await self._user_repo.get_by_email(dto.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        hashed = self._password_hasher.hash(dto.password)
        user = User(
            email=dto.email,
            hashed_password=hashed,
            first_name=dto.first_name,
            last_name=dto.last_name,
            phone=dto.phone,
            role_id=dto.role_id,
        )
        return await self._user_repo.create(user)

    async def login(self, dto: LoginDTO) -> TokenDTO:
        user = await self._user_repo.get_by_email(dto.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )
        if not self._password_hasher.verify(dto.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        subject = str(user.id)
        access_token = self._jwt_service.create_access_token(
            subject=subject, extra={"role_id": user.role_id, "email": user.email}
        )
        refresh_token = self._jwt_service.create_refresh_token(subject=subject)

        return TokenDTO(access_token=access_token, refresh_token=refresh_token)

    async def refresh_token(self, dto: RefreshTokenDTO) -> TokenDTO:
        payload = self._jwt_service.decode_token(dto.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        user_id = int(payload.get("sub"))
        user = await self._user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )
        access_token = self._jwt_service.create_access_token(
            subject=str(user.id), extra={"role_id": user.role_id, "email": user.email}
        )
        refresh_token = self._jwt_service.create_refresh_token(subject=str(user.id))
        return TokenDTO(access_token=access_token, refresh_token=refresh_token)
