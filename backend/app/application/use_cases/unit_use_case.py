from fastapi import HTTPException, status
from app.domain.repositories.i_unit_repository import IUnitRepository
from app.domain.repositories.i_property_repository import IPropertyRepository
from app.domain.entities.unit import Unit
from app.application.dto.unit_dto import UnitCreateDTO, UnitUpdateDTO


class UnitUseCase:
    def __init__(self, unit_repo: IUnitRepository, property_repo: IPropertyRepository):
        self._unit_repo = unit_repo
        self._property_repo = property_repo

    async def create_unit(self, dto: UnitCreateDTO, owner_id: int, is_admin: bool = False) -> Unit:
        prop = await self._property_repo.get_by_id(dto.property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        if not is_admin and prop.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

        unit = Unit(
            property_id=dto.property_id,
            unit_number=dto.unit_number,
            floor=dto.floor,
            bedrooms=dto.bedrooms,
            bathrooms=dto.bathrooms,
            area_sqm=dto.area_sqm,
            rent_price=dto.rent_price,
            sale_price=dto.sale_price,
            description=dto.description,
        )
        return await self._unit_repo.create(unit)

    async def get_unit(self, unit_id: int) -> Unit:
        unit = await self._unit_repo.get_by_id(unit_id)
        if not unit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")
        return unit

    async def get_property_units(self, property_id: int):
        return await self._unit_repo.get_by_property(property_id)

    async def get_owner_units(self, owner_id: int):
        return await self._unit_repo.get_by_owner(owner_id)

    async def list_all_units(self, skip: int = 0, limit: int = 200):
        return await self._unit_repo.get_all(skip=skip, limit=limit)

    async def update_unit(self, unit_id: int, dto: UnitUpdateDTO, owner_id: int, is_admin: bool = False) -> Unit:
        unit = await self.get_unit(unit_id)
        prop = await self._property_repo.get_by_id(unit.property_id)
        if not is_admin and prop.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

        update_fields = dto.model_dump(exclude_none=True)
        for field, value in update_fields.items():
            setattr(unit, field, value)
        return await self._unit_repo.update(unit)

    async def delete_unit(self, unit_id: int, owner_id: int, is_admin: bool = False) -> bool:
        unit = await self.get_unit(unit_id)
        prop = await self._property_repo.get_by_id(unit.property_id)
        if not is_admin and prop.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return await self._unit_repo.delete(unit_id)
