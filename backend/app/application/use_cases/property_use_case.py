from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from app.domain.repositories.i_property_repository import IPropertyRepository
from app.domain.entities.property import Property
from app.application.dto.property_dto import (
    PropertyCreateDTO, PropertyUpdateDTO, PropertyFilterDTO,
)
from decimal import Decimal


class PropertyUseCase:
    def __init__(self, property_repo: IPropertyRepository):
        self._repo = property_repo

    @staticmethod
    def _normalize_amenities(values: Optional[list[str]]) -> list[dict]:
        if not values:
            return []
        seen = set()
        normalized = []
        for value in values:
            name = str(value).strip()
            if not name:
                continue
            key = name.lower()
            if key in seen:
                continue
            seen.add(key)
            normalized.append({"name": name})
        return normalized

    @staticmethod
    def _validate_image_count(images: list[str]):
        count = len(images)
        if count < 3 or count > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Property must have minimum 3 and maximum 5 images",
            )

    async def create_property(self, dto: PropertyCreateDTO, owner_id: int) -> Property:
        cleaned_images = [path.strip() for path in dto.images if str(path).strip()]
        self._validate_image_count(cleaned_images)
        images = [{"url": path} for path in cleaned_images]
        prop = Property(
            title=dto.title,
            owner_id=owner_id,
            property_type_id=dto.property_type_id,
            listing_type_id=dto.listing_type_id,
            district_id=dto.district_id,
            currency_id=dto.currency_id,
            price=dto.price,
            bedrooms=dto.bedrooms,
            bathrooms=dto.bathrooms,
            area_sqm=dto.area_sqm,
            address=dto.address,
            description=dto.description,
            is_furnished=dto.is_furnished,
            is_published=dto.is_published,
            latitude=dto.latitude,
            longitude=dto.longitude,
            broker_id=dto.broker_id,
            images=images,
            amenities=self._normalize_amenities(dto.amenities),
        )
        return await self._repo.create(prop)

    async def get_property(self, property_id: int) -> Property:
        prop = await self._repo.get_by_id(property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        return prop

    async def get_owner_properties(self, owner_id: int, skip: int = 0, limit: int = 20):
        props = await self._repo.get_by_owner(owner_id, skip=skip, limit=limit)
        total = await self._repo.count({"owner_id": owner_id})
        return {"properties": props, "total": total, "skip": skip, "limit": limit}

    async def get_broker_properties(self, broker_id: int, skip: int = 0, limit: int = 20):
        props = await self._repo.get_by_broker(broker_id, skip=skip, limit=limit)
        total = await self._repo.count({"broker_id": broker_id})
        return {"properties": props, "total": total, "skip": skip, "limit": limit}

    async def list_properties(self, filters: PropertyFilterDTO):
        filter_dict = {}
        if filters.district_id:
            filter_dict["district_id"] = filters.district_id
        if filters.property_type_id:
            filter_dict["property_type_id"] = filters.property_type_id
        if filters.listing_type_id:
            filter_dict["listing_type_id"] = filters.listing_type_id
        if filters.min_price is not None:
            filter_dict["min_price"] = filters.min_price
        if filters.max_price is not None:
            filter_dict["max_price"] = filters.max_price
        if filters.bedrooms is not None:
            filter_dict["bedrooms"] = filters.bedrooms
        if filters.is_furnished is not None:
            filter_dict["is_furnished"] = filters.is_furnished
        if filters.owner_id is not None:
            filter_dict["owner_id"] = filters.owner_id
        if filters.broker_id is not None:
            filter_dict["broker_id"] = filters.broker_id
        if filters.search:
            filter_dict["search"] = filters.search

        props = await self._repo.get_all(skip=filters.skip, limit=filters.limit, filters=filter_dict)
        total = await self._repo.count(filter_dict)
        return {"properties": props, "total": total, "skip": filters.skip, "limit": filters.limit}

    async def get_published_properties(self, filters: PropertyFilterDTO):
        filter_dict = {}
        if filters.district_id:
            filter_dict["district_id"] = filters.district_id
        if filters.property_type_id:
            filter_dict["property_type_id"] = filters.property_type_id
        if filters.listing_type_id:
            filter_dict["listing_type_id"] = filters.listing_type_id
        if filters.min_price is not None:
            filter_dict["min_price"] = filters.min_price
        if filters.max_price is not None:
            filter_dict["max_price"] = filters.max_price
        if filters.bedrooms is not None:
            filter_dict["bedrooms"] = filters.bedrooms
        if filters.is_furnished is not None:
            filter_dict["is_furnished"] = filters.is_furnished
        if filters.search:
            filter_dict["search"] = filters.search

        props = await self._repo.get_published(skip=filters.skip, limit=filters.limit, filters=filter_dict)
        total = await self._repo.count_published(filter_dict)
        return {"properties": props, "total": total, "skip": filters.skip, "limit": filters.limit}

    def _check_write_access(self, prop, user_id: int, role_name: str, allow_broker: bool = True):
        """Raise 403 if the user is not allowed to modify this property."""
        if role_name == "ADMIN":
            return
        if role_name == "OWNER":
            if prop.owner_id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                    detail="You do not own this property")
        elif role_name == "BROKER":
            if not allow_broker:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                    detail="Brokers cannot perform this action")
            if prop.broker_id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                    detail="This property is not assigned to you")
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="Not authorized")

    async def update_property(self, property_id: int, dto: PropertyUpdateDTO,
                              user_id: int, role_name: str) -> Property:
        prop = await self.get_property(property_id)
        self._check_write_access(prop, user_id, role_name, allow_broker=True)
        # Brokers may not reassign the owner or broker
        if role_name == "BROKER":
            dto_dict = dto.model_dump(exclude_none=True)
            dto_dict.pop("broker_id", None)
            dto_dict.pop("owner_id", None)
        else:
            dto_dict = dto.model_dump(exclude_none=True)

        if "images" in dto_dict:
            cleaned_images = [path.strip() for path in dto_dict["images"] if str(path).strip()]
            self._validate_image_count(cleaned_images)
            dto_dict["images"] = [{"url": path} for path in cleaned_images]

        if "amenities" in dto_dict:
            dto_dict["amenities"] = self._normalize_amenities(dto_dict["amenities"])

        for field, value in dto_dict.items():
            setattr(prop, field, value)
        return await self._repo.update(prop)

    async def delete_property(self, property_id: int, user_id: int, role_name: str) -> bool:
        prop = await self.get_property(property_id)
        # Brokers cannot delete — only owners and admins
        self._check_write_access(prop, user_id, role_name, allow_broker=False)
        return await self._repo.delete(property_id)

    async def publish_property(self, property_id: int, user_id: int, role_name: str) -> Property:
        prop = await self.get_property(property_id)
        self._check_write_access(prop, user_id, role_name, allow_broker=True)
        prop.publish()
        return await self._repo.update(prop)

    async def unpublish_property(self, property_id: int, user_id: int, role_name: str) -> Property:
        prop = await self.get_property(property_id)
        self._check_write_access(prop, user_id, role_name, allow_broker=True)
        prop.unpublish()
        return await self._repo.update(prop)
