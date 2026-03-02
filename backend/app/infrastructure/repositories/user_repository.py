from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from app.domain.repositories.i_user_repository import IUserRepository
from app.domain.entities.user import User
from app.infrastructure.db.models import UserModel, RoleModel


class UserRepository(IUserRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: UserModel) -> User:
        role_name = None
        try:
            role_name = model.role.name if model.role else None
        except Exception:
            pass
        return User(
            id=model.id,
            email=model.email,
            hashed_password=model.hashed_password,
            first_name=model.first_name,
            last_name=model.last_name,
            phone=model.phone,
            role_id=model.role_id,
            is_active=model.is_active,
            is_verified=model.is_verified,
            created_at=model.created_at,
            updated_at=model.updated_at,
            role_name=role_name,
        )

    async def create(self, user: User) -> User:
        model = UserModel(
            email=user.email,
            hashed_password=user.hashed_password,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            role_id=user.role_id,
            is_active=user.is_active,
            is_verified=user.is_verified,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self._session.execute(
            select(UserModel).options(joinedload(UserModel.role)).where(UserModel.id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self._session.execute(
            select(UserModel).options(joinedload(UserModel.role)).where(UserModel.email == email.lower())
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        result = await self._session.execute(
            select(UserModel).options(joinedload(UserModel.role)).offset(skip).limit(limit)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, user: User) -> User:
        result = await self._session.execute(select(UserModel).where(UserModel.id == user.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"User {user.id} not found")
        model.first_name = user.first_name
        model.last_name = user.last_name
        model.phone = user.phone
        model.is_active = user.is_active
        model.is_verified = user.is_verified
        model.role_id = user.role_id
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, user_id: int) -> bool:
        result = await self._session.execute(select(UserModel).where(UserModel.id == user_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True

    async def count(self) -> int:
        result = await self._session.execute(select(func.count()).select_from(UserModel))
        return result.scalar_one()

    async def get_by_role_name(self, role_name: str, skip: int = 0, limit: int = 100) -> List[User]:
        result = await self._session.execute(
            select(UserModel)
            .join(UserModel.role)
            .options(joinedload(UserModel.role))
            .where(RoleModel.name == role_name.upper())
            .where(UserModel.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return [self._to_entity(m) for m in result.scalars().all()]
