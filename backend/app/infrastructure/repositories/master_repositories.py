from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.domain.repositories.i_master_repositories import (
    IRoleRepository, IPropertyTypeRepository, IListingTypeRepository,
    IRegionRepository, IDistrictRepository,
)
from app.domain.entities.role import Role
from app.domain.entities.property_type import PropertyType, ListingType
from app.domain.entities.location import Region, District
from app.infrastructure.db.models import (
    RoleModel, PropertyTypeModel, ListingTypeModel, RegionModel, DistrictModel,
)


class RoleRepository(IRoleRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: RoleModel) -> Role:
        return Role(id=model.id, name=model.name, description=model.description, created_at=model.created_at)

    async def create(self, role: Role) -> Role:
        model = RoleModel(name=role.name, description=role.description)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, role_id: int) -> Optional[Role]:
        result = await self._session.execute(select(RoleModel).where(RoleModel.id == role_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_name(self, name: str) -> Optional[Role]:
        result = await self._session.execute(select(RoleModel).where(RoleModel.name == name.upper()))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self) -> List[Role]:
        result = await self._session.execute(select(RoleModel).order_by(RoleModel.name))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, role: Role) -> Role:
        result = await self._session.execute(select(RoleModel).where(RoleModel.id == role.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Role {role.id} not found")
        model.name = role.name
        model.description = role.description
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, role_id: int) -> bool:
        result = await self._session.execute(select(RoleModel).where(RoleModel.id == role_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True


class PropertyTypeRepository(IPropertyTypeRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: PropertyTypeModel) -> PropertyType:
        return PropertyType(id=model.id, name=model.name, description=model.description, created_at=model.created_at)

    async def create(self, prop_type: PropertyType) -> PropertyType:
        model = PropertyTypeModel(name=prop_type.name, description=prop_type.description)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, type_id: int) -> Optional[PropertyType]:
        result = await self._session.execute(select(PropertyTypeModel).where(PropertyTypeModel.id == type_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self) -> List[PropertyType]:
        result = await self._session.execute(select(PropertyTypeModel).order_by(PropertyTypeModel.name))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, prop_type: PropertyType) -> PropertyType:
        result = await self._session.execute(select(PropertyTypeModel).where(PropertyTypeModel.id == prop_type.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"PropertyType {prop_type.id} not found")
        model.name = prop_type.name
        model.description = prop_type.description
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, type_id: int) -> bool:
        result = await self._session.execute(select(PropertyTypeModel).where(PropertyTypeModel.id == type_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True


class ListingTypeRepository(IListingTypeRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: ListingTypeModel) -> ListingType:
        return ListingType(id=model.id, name=model.name, description=model.description, created_at=model.created_at)

    async def create(self, listing_type: ListingType) -> ListingType:
        model = ListingTypeModel(name=listing_type.name, description=listing_type.description)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, type_id: int) -> Optional[ListingType]:
        result = await self._session.execute(select(ListingTypeModel).where(ListingTypeModel.id == type_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self) -> List[ListingType]:
        result = await self._session.execute(select(ListingTypeModel).order_by(ListingTypeModel.name))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, listing_type: ListingType) -> ListingType:
        result = await self._session.execute(select(ListingTypeModel).where(ListingTypeModel.id == listing_type.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"ListingType {listing_type.id} not found")
        model.name = listing_type.name
        model.description = listing_type.description
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, type_id: int) -> bool:
        result = await self._session.execute(select(ListingTypeModel).where(ListingTypeModel.id == type_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True


class RegionRepository(IRegionRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: RegionModel) -> Region:
        return Region(id=model.id, name=model.name, code=model.code, created_at=model.created_at)

    async def create(self, region: Region) -> Region:
        model = RegionModel(name=region.name, code=region.code)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, region_id: int) -> Optional[Region]:
        result = await self._session.execute(select(RegionModel).where(RegionModel.id == region_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self) -> List[Region]:
        result = await self._session.execute(select(RegionModel).order_by(RegionModel.name))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, region: Region) -> Region:
        result = await self._session.execute(select(RegionModel).where(RegionModel.id == region.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Region {region.id} not found")
        model.name = region.name
        model.code = region.code
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, region_id: int) -> bool:
        result = await self._session.execute(select(RegionModel).where(RegionModel.id == region_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True


class DistrictRepository(IDistrictRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: DistrictModel) -> District:
        return District(id=model.id, name=model.name, region_id=model.region_id, code=model.code, created_at=model.created_at)

    async def create(self, district: District) -> District:
        model = DistrictModel(name=district.name, region_id=district.region_id, code=district.code)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, district_id: int) -> Optional[District]:
        result = await self._session.execute(select(DistrictModel).where(DistrictModel.id == district_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self) -> List[District]:
        result = await self._session.execute(select(DistrictModel).order_by(DistrictModel.name))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_region(self, region_id: int) -> List[District]:
        result = await self._session.execute(
            select(DistrictModel).where(DistrictModel.region_id == region_id).order_by(DistrictModel.name)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, district: District) -> District:
        result = await self._session.execute(select(DistrictModel).where(DistrictModel.id == district.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"District {district.id} not found")
        model.name = district.name
        model.region_id = district.region_id
        model.code = district.code
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, district_id: int) -> bool:
        result = await self._session.execute(select(DistrictModel).where(DistrictModel.id == district_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True
