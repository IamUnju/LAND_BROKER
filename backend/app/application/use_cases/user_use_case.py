from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from app.domain.repositories.i_user_repository import IUserRepository
from app.domain.entities.user import User
from app.application.dto.user_dto import UserCreateDTO, UserUpdateDTO, UserResponseDTO
from app.infrastructure.security.password import PasswordHasher


class UserUseCase:
    def __init__(self, user_repo: IUserRepository, password_hasher: PasswordHasher):
        self._user_repo = user_repo
        self._password_hasher = password_hasher

    async def get_user(self, user_id: int) -> User:
        user = await self._user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def list_users(self, skip: int = 0, limit: int = 100):
        users = await self._user_repo.get_all(skip=skip, limit=limit)
        total = await self._user_repo.count()
        return {"users": users, "total": total, "skip": skip, "limit": limit}

    async def update_user(self, user_id: int, dto: UserUpdateDTO) -> User:
        user = await self.get_user(user_id)
        if dto.first_name is not None:
            user.first_name = dto.first_name
        if dto.last_name is not None:
            user.last_name = dto.last_name
        if dto.phone is not None:
            user.phone = dto.phone
        if dto.is_active is not None:
            if dto.is_active:
                user.activate()
            else:
                user.deactivate()
        return await self._user_repo.update(user)

    async def delete_user(self, user_id: int) -> bool:
        await self.get_user(user_id)
        return await self._user_repo.delete(user_id)

    async def activate_user(self, user_id: int) -> User:
        user = await self.get_user(user_id)
        user.activate()
        return await self._user_repo.update(user)

    async def deactivate_user(self, user_id: int) -> User:
        user = await self.get_user(user_id)
        user.deactivate()
        return await self._user_repo.update(user)
