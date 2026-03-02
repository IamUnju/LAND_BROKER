from app.domain.repositories.i_user_repository import IUserRepository
from app.domain.repositories.i_master_repositories import IRoleRepository
from app.domain.entities.user import User
from app.application.dto.user_dto import (
    UserCreateDTO, LoginDTO, TokenDTO, RefreshTokenDTO, GoogleAuthDTO,
)
from app.infrastructure.security.password import PasswordHasher
from app.infrastructure.security.jwt import JWTService
from app.infrastructure.config.settings import get_settings
from fastapi import HTTPException, status
import secrets


class AuthUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        password_hasher: PasswordHasher,
        jwt_service: JWTService,
        role_repo: IRoleRepository = None,
    ):
        self._user_repo = user_repo
        self._password_hasher = password_hasher
        self._jwt_service = jwt_service
        self._role_repo = role_repo
        self._settings = get_settings()

    async def _get_tenant_role_id(self) -> int:
        """Always returns the TENANT role ID for self-registration."""
        if self._role_repo:
            role = await self._role_repo.get_by_name("TENANT")
            if role:
                return role.id
        # fallback: query directly
        from sqlalchemy import select
        from app.infrastructure.db.models import RoleModel
        raise HTTPException(status_code=500, detail="TENANT role not found")

    async def register(self, dto: UserCreateDTO) -> User:
        existing = await self._user_repo.get_by_email(dto.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        hashed = self._password_hasher.hash(dto.password)
        # All self-registrations are TENANT regardless of what's sent
        tenant_role_id = await self._get_tenant_role_id()
        user = User(
            email=dto.email,
            hashed_password=hashed,
            first_name=dto.first_name,
            last_name=dto.last_name,
            phone=dto.phone,
            role_id=tenant_role_id,
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

    async def google_auth(self, dto: GoogleAuthDTO) -> TokenDTO:
        """Verify a Google access token via Google's userinfo endpoint, create TENANT user if new, return JWT."""
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {dto.token}"},
            )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token",
            )
        userinfo = resp.json()

        email = userinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Google account has no email")

        first_name = userinfo.get("given_name") or email.split("@")[0]
        last_name = userinfo.get("family_name") or ""

        user = await self._user_repo.get_by_email(email)
        if not user:
            tenant_role_id = await self._get_tenant_role_id()
            hashed = self._password_hasher.hash(secrets.token_urlsafe(32))
            new_user = User(
                email=email,
                hashed_password=hashed,
                first_name=first_name,
                last_name=last_name,
                role_id=tenant_role_id,
                is_verified=True,
            )
            user = await self._user_repo.create(new_user)

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

        access_token = self._jwt_service.create_access_token(
            subject=str(user.id), extra={"role_id": user.role_id, "email": user.email}
        )
        refresh_token = self._jwt_service.create_refresh_token(subject=str(user.id))
        return TokenDTO(access_token=access_token, refresh_token=refresh_token)
