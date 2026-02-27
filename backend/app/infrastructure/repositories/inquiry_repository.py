from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.domain.repositories.i_inquiry_repository import IInquiryRepository, IFavoriteRepository
from app.domain.entities.inquiry import Inquiry, Favorite, InquiryStatus
from app.infrastructure.db.models import InquiryModel, FavoriteModel


class InquiryRepository(IInquiryRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: InquiryModel) -> Inquiry:
        return Inquiry(
            id=model.id,
            property_id=model.property_id,
            user_id=model.user_id,
            message=model.message,
            status=model.status,
            response=model.response,
            responded_at=model.responded_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def create(self, inquiry: Inquiry) -> Inquiry:
        model = InquiryModel(
            property_id=inquiry.property_id,
            user_id=inquiry.user_id,
            message=inquiry.message,
            status=inquiry.status,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, inquiry_id: int) -> Optional[Inquiry]:
        result = await self._session.execute(select(InquiryModel).where(InquiryModel.id == inquiry_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_property(self, property_id: int) -> List[Inquiry]:
        result = await self._session.execute(select(InquiryModel).where(InquiryModel.property_id == property_id))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_user(self, user_id: int) -> List[Inquiry]:
        result = await self._session.execute(select(InquiryModel).where(InquiryModel.user_id == user_id))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Inquiry]:
        result = await self._session.execute(
            select(InquiryModel).offset(skip).limit(limit).order_by(InquiryModel.created_at.desc())
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, inquiry: Inquiry) -> Inquiry:
        result = await self._session.execute(select(InquiryModel).where(InquiryModel.id == inquiry.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Inquiry {inquiry.id} not found")
        for field in ["status", "response", "responded_at"]:
            setattr(model, field, getattr(inquiry, field))
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, inquiry_id: int) -> bool:
        result = await self._session.execute(select(InquiryModel).where(InquiryModel.id == inquiry_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True


class FavoriteRepository(IFavoriteRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: FavoriteModel) -> Favorite:
        return Favorite(
            id=model.id,
            user_id=model.user_id,
            property_id=model.property_id,
            created_at=model.created_at,
        )

    async def create(self, favorite: Favorite) -> Favorite:
        model = FavoriteModel(user_id=favorite.user_id, property_id=favorite.property_id)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, user_id: int, property_id: int) -> bool:
        result = await self._session.execute(
            select(FavoriteModel).where(
                and_(FavoriteModel.user_id == user_id, FavoriteModel.property_id == property_id)
            )
        )
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True

    async def get_by_user(self, user_id: int) -> List[Favorite]:
        result = await self._session.execute(select(FavoriteModel).where(FavoriteModel.user_id == user_id))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def exists(self, user_id: int, property_id: int) -> bool:
        result = await self._session.execute(
            select(FavoriteModel).where(
                and_(FavoriteModel.user_id == user_id, FavoriteModel.property_id == property_id)
            )
        )
        return result.scalar_one_or_none() is not None
