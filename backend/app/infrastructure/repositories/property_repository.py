from typing import List, Optional, Dict, Any
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.domain.repositories.i_property_repository import IPropertyRepository
from app.domain.entities.property import Property
from app.infrastructure.db.models import PropertyModel


class PropertyRepository(IPropertyRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: PropertyModel) -> Property:
        return Property(
            id=model.id,
            title=model.title,
            owner_id=model.owner_id,
            property_type_id=model.property_type_id,
            listing_type_id=model.listing_type_id,
            district_id=model.district_id,
            price=Decimal(str(model.price)),
            bedrooms=model.bedrooms,
            bathrooms=model.bathrooms,
            area_sqm=Decimal(str(model.area_sqm)) if model.area_sqm else None,
            address=model.address,
            description=model.description,
            is_furnished=model.is_furnished,
            is_published=model.is_published,
            latitude=Decimal(str(model.latitude)) if model.latitude else None,
            longitude=Decimal(str(model.longitude)) if model.longitude else None,
            broker_id=model.broker_id,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _build_filters(self, query, filters: Dict[str, Any]):
        if not filters:
            return query
        conditions = []
        if "owner_id" in filters:
            conditions.append(PropertyModel.owner_id == filters["owner_id"])
        if "district_id" in filters:
            conditions.append(PropertyModel.district_id == filters["district_id"])
        if "property_type_id" in filters:
            conditions.append(PropertyModel.property_type_id == filters["property_type_id"])
        if "listing_type_id" in filters:
            conditions.append(PropertyModel.listing_type_id == filters["listing_type_id"])
        if "min_price" in filters:
            conditions.append(PropertyModel.price >= filters["min_price"])
        if "max_price" in filters:
            conditions.append(PropertyModel.price <= filters["max_price"])
        if "bedrooms" in filters:
            conditions.append(PropertyModel.bedrooms == filters["bedrooms"])
        if "is_furnished" in filters:
            conditions.append(PropertyModel.is_furnished == filters["is_furnished"])
        if conditions:
            query = query.where(and_(*conditions))
        return query

    async def create(self, prop: Property) -> Property:
        model = PropertyModel(
            title=prop.title,
            owner_id=prop.owner_id,
            property_type_id=prop.property_type_id,
            listing_type_id=prop.listing_type_id,
            district_id=prop.district_id,
            price=prop.price,
            bedrooms=prop.bedrooms,
            bathrooms=prop.bathrooms,
            area_sqm=prop.area_sqm,
            address=prop.address,
            description=prop.description,
            is_furnished=prop.is_furnished,
            is_published=prop.is_published,
            latitude=prop.latitude,
            longitude=prop.longitude,
            broker_id=prop.broker_id,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, property_id: int) -> Optional[Property]:
        result = await self._session.execute(select(PropertyModel).where(PropertyModel.id == property_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self, skip: int = 0, limit: int = 20, filters: Optional[Dict[str, Any]] = None) -> List[Property]:
        query = select(PropertyModel)
        if filters:
            query = self._build_filters(query, filters)
        query = query.offset(skip).limit(limit).order_by(PropertyModel.created_at.desc())
        result = await self._session.execute(query)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_owner(self, owner_id: int, skip: int = 0, limit: int = 20) -> List[Property]:
        return await self.get_all(skip=skip, limit=limit, filters={"owner_id": owner_id})

    async def get_published(self, skip: int = 0, limit: int = 20, filters: Optional[Dict[str, Any]] = None) -> List[Property]:
        query = select(PropertyModel).where(PropertyModel.is_published == True)
        if filters:
            query = self._build_filters(query, filters)
        query = query.offset(skip).limit(limit).order_by(PropertyModel.created_at.desc())
        result = await self._session.execute(query)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, prop: Property) -> Property:
        result = await self._session.execute(select(PropertyModel).where(PropertyModel.id == prop.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Property {prop.id} not found")
        for field in ["title", "property_type_id", "listing_type_id", "district_id", "price",
                      "bedrooms", "bathrooms", "area_sqm", "address", "description",
                      "is_furnished", "is_published", "latitude", "longitude", "broker_id"]:
            setattr(model, field, getattr(prop, field))
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, property_id: int) -> bool:
        result = await self._session.execute(select(PropertyModel).where(PropertyModel.id == property_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True

    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        query = select(func.count()).select_from(PropertyModel)
        if filters:
            query = self._build_filters(query, filters)
        result = await self._session.execute(query)
        return result.scalar_one()

    async def count_published(self, filters: Optional[Dict[str, Any]] = None) -> int:
        query = select(func.count()).select_from(PropertyModel).where(PropertyModel.is_published == True)
        if filters:
            query = self._build_filters(query, filters)
        result = await self._session.execute(query)
        return result.scalar_one()
