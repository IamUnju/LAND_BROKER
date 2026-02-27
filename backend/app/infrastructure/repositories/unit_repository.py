from typing import List, Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.domain.repositories.i_unit_repository import IUnitRepository
from app.domain.entities.unit import Unit, UnitStatus
from app.infrastructure.db.models import UnitModel, PropertyModel


class UnitRepository(IUnitRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_entity(self, model: UnitModel) -> Unit:
        return Unit(
            id=model.id,
            property_id=model.property_id,
            unit_number=model.unit_number,
            floor=model.floor,
            bedrooms=model.bedrooms,
            bathrooms=model.bathrooms,
            area_sqm=Decimal(str(model.area_sqm)) if model.area_sqm else None,
            rent_price=Decimal(str(model.rent_price)) if model.rent_price else None,
            sale_price=Decimal(str(model.sale_price)) if model.sale_price else None,
            status=model.status,
            description=model.description,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    async def create(self, unit: Unit) -> Unit:
        model = UnitModel(
            property_id=unit.property_id,
            unit_number=unit.unit_number,
            floor=unit.floor,
            bedrooms=unit.bedrooms,
            bathrooms=unit.bathrooms,
            area_sqm=unit.area_sqm,
            rent_price=unit.rent_price,
            sale_price=unit.sale_price,
            status=unit.status,
            description=unit.description,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, unit_id: int) -> Optional[Unit]:
        result = await self._session.execute(select(UnitModel).where(UnitModel.id == unit_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_property(self, property_id: int) -> List[Unit]:
        result = await self._session.execute(select(UnitModel).where(UnitModel.property_id == property_id))
        return [self._to_entity(m) for m in result.scalars().all()]

    async def get_by_owner(self, owner_id: int) -> List[Unit]:
        result = await self._session.execute(
            select(UnitModel)
            .join(PropertyModel, UnitModel.property_id == PropertyModel.id)
            .where(PropertyModel.owner_id == owner_id)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def update(self, unit: Unit) -> Unit:
        result = await self._session.execute(select(UnitModel).where(UnitModel.id == unit.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Unit {unit.id} not found")
        for field in ["unit_number", "floor", "bedrooms", "bathrooms", "area_sqm",
                      "rent_price", "sale_price", "status", "description"]:
            setattr(model, field, getattr(unit, field))
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, unit_id: int) -> bool:
        result = await self._session.execute(select(UnitModel).where(UnitModel.id == unit_id))
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True
