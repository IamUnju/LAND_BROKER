from typing import List, Optional, Dict, Any
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from app.domain.repositories.i_property_repository import IPropertyRepository
from app.domain.entities.property import Property
from app.infrastructure.db.models import PropertyModel, DistrictModel, PropertyImageModel, AmenityModel, ReviewModel


class PropertyRepository(IPropertyRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def _resolve_amenity_models(self, amenities_input) -> list[AmenityModel]:
        if not amenities_input:
            return []

        ordered_names: list[str] = []
        seen = set()
        for item in amenities_input:
            if isinstance(item, dict):
                raw_name = item.get("name", "")
            else:
                raw_name = item
            name = str(raw_name).strip()
            if not name:
                continue
            key = name.lower()
            if key in seen:
                continue
            seen.add(key)
            ordered_names.append(name)

        if not ordered_names:
            return []

        lowered = [name.lower() for name in ordered_names]
        existing_result = await self._session.execute(
            select(AmenityModel).where(func.lower(AmenityModel.name).in_(lowered))
        )
        existing = {row.name.lower(): row for row in existing_result.scalars().all()}

        resolved = []
        for name in ordered_names:
            key = name.lower()
            amenity_model = existing.get(key)
            if not amenity_model:
                amenity_model = AmenityModel(name=name)
                self._session.add(amenity_model)
                await self._session.flush()
                existing[key] = amenity_model
            resolved.append(amenity_model)
        return resolved

    def _to_entity(self, model: PropertyModel) -> Property:
        # Safely read relationship names if already loaded
        try:
            pt_name = model.property_type.name if model.property_type else None
        except Exception:
            pt_name = None
        try:
            lt_name = model.listing_type.name if model.listing_type else None
        except Exception:
            lt_name = None
        try:
            district_name = model.district.name if model.district else None
            region_name = model.district.region.name if (model.district and model.district.region) else None
        except Exception:
            district_name = None
            region_name = None
        try:
            currency_name = model.currency.name if model.currency else None
            currency_code = model.currency.code if model.currency else None
            currency_symbol = model.currency.symbol if model.currency else None
        except Exception:
            currency_name = None
            currency_code = None
            currency_symbol = None
        # Safely read rich relationship data (images/amenities/reviews may not be loaded)
        try:
            images = [
                {"id": img.id, "url": img.url, "caption": img.caption,
                 "is_primary": img.is_primary or False, "display_order": img.display_order or 0}
                for img in (model.images or [])
            ]
        except Exception:
            images = []
        try:
            amenities = [
                {"id": a.id, "name": a.name, "icon": a.icon, "category": a.category}
                for a in (model.amenities or [])
            ]
        except Exception:
            amenities = []
        try:
            reviews_data = [
                {"id": r.id, "reviewer_name": r.reviewer_name, "reviewer_avatar": r.reviewer_avatar,
                 "rating": r.rating, "comment": r.comment, "stay_period": r.stay_period,
                 "created_at": r.created_at}
                for r in (model.reviews or [])
            ]
        except Exception:
            reviews_data = []
        avg_rating = round(sum(r["rating"] for r in reviews_data) / len(reviews_data), 1) if reviews_data else 0.0
        # Host/Owner info
        try:
            host_name = f"{model.owner.first_name} {model.owner.last_name}".strip() if model.owner else None
            owner_email = model.owner.email if model.owner else None
            owner_phone = model.owner.phone if model.owner else None
        except Exception:
            host_name = None
            owner_email = None
            owner_phone = None
        # Broker info
        try:
            broker_name = f"{model.broker.first_name} {model.broker.last_name}".strip() if model.broker else None
            broker_email = model.broker.email if model.broker else None
            broker_phone = model.broker.phone if model.broker else None
        except Exception:
            broker_name = None
            broker_email = None
            broker_phone = None
        return Property(
            id=model.id,
            title=model.title,
            owner_id=model.owner_id,
            property_type_id=model.property_type_id,
            listing_type_id=model.listing_type_id,
            district_id=model.district_id,
            currency_id=model.currency_id,
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
            property_type_name=pt_name,
            listing_type_name=lt_name,
            district_name=district_name,
            region_name=region_name,
            currency_name=currency_name,
            currency_code=currency_code,
            currency_symbol=currency_symbol,
            images=images,
            amenities=amenities,
            reviews=reviews_data,
            avg_rating=avg_rating,
            review_count=len(reviews_data),
            host_name=host_name,
            owner_email=owner_email,
            owner_phone=owner_phone,
            broker_name=broker_name,
            broker_email=broker_email,
            broker_phone=broker_phone,
        )

    def _build_filters(self, query, filters: Dict[str, Any]):
        if not filters:
            return query
        conditions = []
        if "owner_id" in filters:
            conditions.append(PropertyModel.owner_id == filters["owner_id"])
        if "broker_id" in filters:
            conditions.append(PropertyModel.broker_id == filters["broker_id"])
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
        if "search" in filters and filters["search"]:
            term = f"%{filters['search']}%"
            conditions.append(
                or_(
                    PropertyModel.title.ilike(term),
                    PropertyModel.address.ilike(term),
                    PropertyModel.description.ilike(term),
                )
            )
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
            currency_id=prop.currency_id,
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
        for idx, image in enumerate(prop.images or []):
            url = (image.get("url") or "").strip() if isinstance(image, dict) else str(image).strip()
            if not url:
                continue
            model.images.append(
                PropertyImageModel(
                    url=url,
                    caption=image.get("caption") if isinstance(image, dict) else None,
                    is_primary=bool(image.get("is_primary", idx == 0)) if isinstance(image, dict) else idx == 0,
                    display_order=int(image.get("display_order", idx)) if isinstance(image, dict) else idx,
                )
            )

        model.amenities = await self._resolve_amenity_models(prop.amenities or [])

        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, property_id: int) -> Optional[Property]:
        result = await self._session.execute(
            select(PropertyModel)
            .options(
                selectinload(PropertyModel.property_type),
                selectinload(PropertyModel.listing_type),
                selectinload(PropertyModel.district).selectinload(DistrictModel.region),
                selectinload(PropertyModel.currency),
                selectinload(PropertyModel.images),
                selectinload(PropertyModel.amenities),
                selectinload(PropertyModel.reviews),
                selectinload(PropertyModel.owner),
                selectinload(PropertyModel.broker),
            )
            .where(PropertyModel.id == property_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self, skip: int = 0, limit: int = 20, filters: Optional[Dict[str, Any]] = None) -> List[Property]:
        query = select(PropertyModel).options(
            selectinload(PropertyModel.property_type),
            selectinload(PropertyModel.listing_type),
            selectinload(PropertyModel.district).selectinload(DistrictModel.region),
            selectinload(PropertyModel.currency),
            selectinload(PropertyModel.images),
            selectinload(PropertyModel.amenities),
            selectinload(PropertyModel.owner),
            selectinload(PropertyModel.broker),
        )
        if filters:
            query = self._build_filters(query, filters)
        query = query.offset(skip).limit(limit).order_by(PropertyModel.created_at.desc())
        result = await self._session.execute(query)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_owner(self, owner_id: int, skip: int = 0, limit: int = 20) -> List[Property]:
        return await self.get_all(skip=skip, limit=limit, filters={"owner_id": owner_id})

    async def get_by_broker(self, broker_id: int, skip: int = 0, limit: int = 20) -> List[Property]:
        return await self.get_all(skip=skip, limit=limit, filters={"broker_id": broker_id})

    async def get_published(self, skip: int = 0, limit: int = 20, filters: Optional[Dict[str, Any]] = None) -> List[Property]:
        query = select(PropertyModel).options(
            selectinload(PropertyModel.property_type),
            selectinload(PropertyModel.listing_type),
            selectinload(PropertyModel.district).selectinload(DistrictModel.region),
            selectinload(PropertyModel.currency),
            selectinload(PropertyModel.owner),
            selectinload(PropertyModel.broker),
            selectinload(PropertyModel.images),
            selectinload(PropertyModel.amenities),
        ).where(PropertyModel.is_published == True)
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
        for field in ["title", "property_type_id", "listing_type_id", "district_id", "currency_id", "price",
                      "bedrooms", "bathrooms", "area_sqm", "address", "description",
                      "is_furnished", "is_published", "latitude", "longitude", "broker_id"]:
            setattr(model, field, getattr(prop, field))

        if prop.images is not None:
            model.images.clear()
            for idx, image in enumerate(prop.images):
                url = (image.get("url") or "").strip() if isinstance(image, dict) else str(image).strip()
                if not url:
                    continue
                model.images.append(
                    PropertyImageModel(
                        url=url,
                        caption=image.get("caption") if isinstance(image, dict) else None,
                        is_primary=bool(image.get("is_primary", idx == 0)) if isinstance(image, dict) else idx == 0,
                        display_order=int(image.get("display_order", idx)) if isinstance(image, dict) else idx,
                    )
                )

        if prop.amenities is not None:
            model.amenities = await self._resolve_amenity_models(prop.amenities)

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
