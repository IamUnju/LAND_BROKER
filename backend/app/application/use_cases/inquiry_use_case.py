from fastapi import HTTPException, status
from app.domain.repositories.i_inquiry_repository import IInquiryRepository, IFavoriteRepository
from app.domain.repositories.i_property_repository import IPropertyRepository
from app.domain.entities.inquiry import Inquiry, Favorite
from app.application.dto.business_dto import InquiryCreateDTO, InquiryRespondDTO


class InquiryUseCase:
    def __init__(
        self,
        inquiry_repo: IInquiryRepository,
        property_repo: IPropertyRepository,
    ):
        self._repo = inquiry_repo
        self._property_repo = property_repo

    async def create_inquiry(self, dto: InquiryCreateDTO, user_id: int) -> Inquiry:
        prop = await self._property_repo.get_by_id(dto.property_id)
        if not prop or not prop.is_published:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

        inquiry = Inquiry(
            property_id=dto.property_id,
            user_id=user_id,
            message=dto.message,
        )
        return await self._repo.create(inquiry)

    async def get_inquiry(self, inquiry_id: int) -> Inquiry:
        inquiry = await self._repo.get_by_id(inquiry_id)
        if not inquiry:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
        return inquiry

    async def respond_to_inquiry(
        self,
        inquiry_id: int,
        dto: InquiryRespondDTO,
        actor_user_id: int,
        actor_role: str,
        is_admin: bool = False,
    ) -> Inquiry:
        inquiry = await self.get_inquiry(inquiry_id)
        prop = await self._property_repo.get_by_id(inquiry.property_id)
        role = (actor_role or "").upper()
        is_owner = prop.owner_id == actor_user_id
        is_broker = prop.broker_id == actor_user_id
        if not is_admin and role != "ADMIN" and not is_owner and not is_broker:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        inquiry.respond(dto.response)
        return await self._repo.update(inquiry)

    async def get_property_inquiries(self, property_id: int, actor_user_id: int, actor_role: str, is_admin: bool = False):
        prop = await self._property_repo.get_by_id(property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        role = (actor_role or "").upper()
        is_owner = prop.owner_id == actor_user_id
        is_broker = prop.broker_id == actor_user_id
        if not is_admin and role != "ADMIN" and not is_owner and not is_broker:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return await self._repo.get_by_property(property_id)

    async def get_assigned_inquiries(self, actor_user_id: int, actor_role: str):
        role = (actor_role or "").upper()
        if role == "ADMIN":
            return await self._repo.get_all(skip=0, limit=500)
        if role == "OWNER":
            return await self._repo.get_by_owner(actor_user_id)
        if role == "BROKER":
            return await self._repo.get_by_broker(actor_user_id)
        return []

    async def get_user_inquiries(self, user_id: int):
        return await self._repo.get_by_user(user_id)

    async def list_inquiries(self, skip: int = 0, limit: int = 100):
        return await self._repo.get_all(skip=skip, limit=limit)

    async def delete_inquiry(self, inquiry_id: int) -> bool:
        await self.get_inquiry(inquiry_id)
        return await self._repo.delete(inquiry_id)


class FavoriteUseCase:
    def __init__(
        self,
        favorite_repo: IFavoriteRepository,
        property_repo: IPropertyRepository,
    ):
        self._repo = favorite_repo
        self._property_repo = property_repo

    async def add_favorite(self, user_id: int, property_id: int) -> Favorite:
        prop = await self._property_repo.get_by_id(property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

        exists = await self._repo.exists(user_id, property_id)
        if exists:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already in favorites")

        fav = Favorite(user_id=user_id, property_id=property_id)
        return await self._repo.create(fav)

    async def remove_favorite(self, user_id: int, property_id: int) -> bool:
        exists = await self._repo.exists(user_id, property_id)
        if not exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not in favorites")
        return await self._repo.delete(user_id, property_id)

    async def get_user_favorites(self, user_id: int):
        return await self._repo.get_by_user(user_id)
