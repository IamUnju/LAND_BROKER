from fastapi import HTTPException, status
from app.domain.repositories.i_master_repositories import (
    IRoleRepository, IPropertyTypeRepository, IListingTypeRepository,
    IRegionRepository, IDistrictRepository, ICurrencyRepository,
)
from app.domain.entities.role import Role
from app.domain.entities.property_type import PropertyType, ListingType
from app.domain.entities.location import Region, District
from app.domain.entities.currency import Currency
from app.application.dto.master_dto import (
    RoleCreateDTO, RoleUpdateDTO,
    PropertyTypeCreateDTO, PropertyTypeUpdateDTO,
    ListingTypeCreateDTO, ListingTypeUpdateDTO,
    RegionCreateDTO, RegionUpdateDTO,
    DistrictCreateDTO, DistrictUpdateDTO,
    CurrencyCreateDTO, CurrencyUpdateDTO,
)


class MasterUseCase:
    def __init__(
        self,
        role_repo: IRoleRepository,
        property_type_repo: IPropertyTypeRepository,
        listing_type_repo: IListingTypeRepository,
        region_repo: IRegionRepository,
        district_repo: IDistrictRepository,
        currency_repo: ICurrencyRepository,
    ):
        self._role_repo = role_repo
        self._property_type_repo = property_type_repo
        self._listing_type_repo = listing_type_repo
        self._region_repo = region_repo
        self._district_repo = district_repo
        self._currency_repo = currency_repo

    # ── Roles ──────────────────────────────────────────────────────────────
    async def create_role(self, dto: RoleCreateDTO) -> Role:
        existing = await self._role_repo.get_by_name(dto.name)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Role already exists")
        role = Role(name=dto.name, description=dto.description)
        return await self._role_repo.create(role)

    async def get_role(self, role_id: int) -> Role:
        role = await self._role_repo.get_by_id(role_id)
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
        return role

    async def list_roles(self):
        return await self._role_repo.get_all()

    async def update_role(self, role_id: int, dto: RoleUpdateDTO) -> Role:
        role = await self.get_role(role_id)
        if dto.name:
            role.name = dto.name
        if dto.description is not None:
            role.description = dto.description
        return await self._role_repo.update(role)

    async def delete_role(self, role_id: int) -> bool:
        await self.get_role(role_id)
        return await self._role_repo.delete(role_id)

    # ── PropertyTypes ───────────────────────────────────────────────────────
    async def create_property_type(self, dto: PropertyTypeCreateDTO) -> PropertyType:
        pt = PropertyType(name=dto.name, description=dto.description)
        return await self._property_type_repo.create(pt)

    async def get_property_type(self, type_id: int) -> PropertyType:
        pt = await self._property_type_repo.get_by_id(type_id)
        if not pt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property type not found")
        return pt

    async def list_property_types(self):
        return await self._property_type_repo.get_all()

    async def update_property_type(self, type_id: int, dto: PropertyTypeUpdateDTO) -> PropertyType:
        pt = await self.get_property_type(type_id)
        if dto.name:
            pt.name = dto.name
        if dto.description is not None:
            pt.description = dto.description
        return await self._property_type_repo.update(pt)

    async def delete_property_type(self, type_id: int) -> bool:
        await self.get_property_type(type_id)
        return await self._property_type_repo.delete(type_id)

    # ── ListingTypes ────────────────────────────────────────────────────────
    async def create_listing_type(self, dto: ListingTypeCreateDTO) -> ListingType:
        lt = ListingType(name=dto.name, description=dto.description)
        return await self._listing_type_repo.create(lt)

    async def get_listing_type(self, type_id: int) -> ListingType:
        lt = await self._listing_type_repo.get_by_id(type_id)
        if not lt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing type not found")
        return lt

    async def list_listing_types(self):
        return await self._listing_type_repo.get_all()

    async def update_listing_type(self, type_id: int, dto: ListingTypeUpdateDTO) -> ListingType:
        lt = await self.get_listing_type(type_id)
        if dto.name:
            lt.name = dto.name
        if dto.description is not None:
            lt.description = dto.description
        return await self._listing_type_repo.update(lt)

    async def delete_listing_type(self, type_id: int) -> bool:
        await self.get_listing_type(type_id)
        return await self._listing_type_repo.delete(type_id)

    # ── Regions ─────────────────────────────────────────────────────────────
    async def create_region(self, dto: RegionCreateDTO) -> Region:
        region = Region(name=dto.name, code=dto.code)
        return await self._region_repo.create(region)

    async def get_region(self, region_id: int) -> Region:
        region = await self._region_repo.get_by_id(region_id)
        if not region:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")
        return region

    async def list_regions(self):
        return await self._region_repo.get_all()

    async def update_region(self, region_id: int, dto: RegionUpdateDTO) -> Region:
        region = await self.get_region(region_id)
        if dto.name:
            region.name = dto.name
        if dto.code is not None:
            region.code = dto.code
        return await self._region_repo.update(region)

    async def delete_region(self, region_id: int) -> bool:
        await self.get_region(region_id)
        return await self._region_repo.delete(region_id)

    # ── Districts ───────────────────────────────────────────────────────────
    async def create_district(self, dto: DistrictCreateDTO) -> District:
        await self.get_region(dto.region_id)
        district = District(name=dto.name, region_id=dto.region_id, code=dto.code)
        return await self._district_repo.create(district)

    async def get_district(self, district_id: int) -> District:
        district = await self._district_repo.get_by_id(district_id)
        if not district:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="District not found")
        return district

    async def list_districts(self, region_id: int = None):
        if region_id:
            return await self._district_repo.get_by_region(region_id)
        return await self._district_repo.get_all()

    async def update_district(self, district_id: int, dto: DistrictUpdateDTO) -> District:
        district = await self.get_district(district_id)
        if dto.name:
            district.name = dto.name
        if dto.region_id is not None:
            await self.get_region(dto.region_id)
            district.region_id = dto.region_id
        if dto.code is not None:
            district.code = dto.code
        return await self._district_repo.update(district)

    async def delete_district(self, district_id: int) -> bool:
        await self.get_district(district_id)
        return await self._district_repo.delete(district_id)

    # ── Currencies ──────────────────────────────────────────────────────────
    async def create_currency(self, dto: CurrencyCreateDTO) -> Currency:
        currency = Currency(
            name=dto.name,
            code=dto.code,
            symbol=dto.symbol,
            description=dto.description,
        )
        return await self._currency_repo.create(currency)

    async def get_currency(self, currency_id: int) -> Currency:
        currency = await self._currency_repo.get_by_id(currency_id)
        if not currency:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Currency not found")
        return currency

    async def list_currencies(self):
        return await self._currency_repo.get_all()

    async def update_currency(self, currency_id: int, dto: CurrencyUpdateDTO) -> Currency:
        currency = await self.get_currency(currency_id)
        if dto.name:
            currency.name = dto.name
        if dto.code:
            currency.code = dto.code
        if dto.symbol:
            currency.symbol = dto.symbol
        if dto.description is not None:
            currency.description = dto.description
        return await self._currency_repo.update(currency)

    async def delete_currency(self, currency_id: int) -> bool:
        await self.get_currency(currency_id)
        return await self._currency_repo.delete(currency_id)
