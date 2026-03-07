from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.role import Role
from app.domain.entities.property_type import PropertyType, ListingType
from app.domain.entities.location import Region, District
from app.domain.entities.currency import Currency


class IRoleRepository(ABC):

    @abstractmethod
    async def create(self, role: Role) -> Role:
        pass

    @abstractmethod
    async def get_by_id(self, role_id: int) -> Optional[Role]:
        pass

    @abstractmethod
    async def get_by_name(self, name: str) -> Optional[Role]:
        pass

    @abstractmethod
    async def get_all(self) -> List[Role]:
        pass

    @abstractmethod
    async def update(self, role: Role) -> Role:
        pass

    @abstractmethod
    async def delete(self, role_id: int) -> bool:
        pass


class IPropertyTypeRepository(ABC):

    @abstractmethod
    async def create(self, prop_type: PropertyType) -> PropertyType:
        pass

    @abstractmethod
    async def get_by_id(self, type_id: int) -> Optional[PropertyType]:
        pass

    @abstractmethod
    async def get_all(self) -> List[PropertyType]:
        pass

    @abstractmethod
    async def update(self, prop_type: PropertyType) -> PropertyType:
        pass

    @abstractmethod
    async def delete(self, type_id: int) -> bool:
        pass


class IListingTypeRepository(ABC):

    @abstractmethod
    async def create(self, listing_type: ListingType) -> ListingType:
        pass

    @abstractmethod
    async def get_by_id(self, type_id: int) -> Optional[ListingType]:
        pass

    @abstractmethod
    async def get_all(self) -> List[ListingType]:
        pass

    @abstractmethod
    async def update(self, listing_type: ListingType) -> ListingType:
        pass

    @abstractmethod
    async def delete(self, type_id: int) -> bool:
        pass


class IRegionRepository(ABC):

    @abstractmethod
    async def create(self, region: Region) -> Region:
        pass

    @abstractmethod
    async def get_by_id(self, region_id: int) -> Optional[Region]:
        pass

    @abstractmethod
    async def get_all(self) -> List[Region]:
        pass

    @abstractmethod
    async def update(self, region: Region) -> Region:
        pass

    @abstractmethod
    async def delete(self, region_id: int) -> bool:
        pass


class IDistrictRepository(ABC):

    @abstractmethod
    async def create(self, district: District) -> District:
        pass

    @abstractmethod
    async def get_by_id(self, district_id: int) -> Optional[District]:
        pass

    @abstractmethod
    async def get_all(self) -> List[District]:
        pass

    @abstractmethod
    async def get_by_region(self, region_id: int) -> List[District]:
        pass

    @abstractmethod
    async def update(self, district: District) -> District:
        pass

    @abstractmethod
    async def delete(self, district_id: int) -> bool:
        pass


class ICurrencyRepository(ABC):

    @abstractmethod
    async def create(self, currency: Currency) -> Currency:
        pass

    @abstractmethod
    async def get_by_id(self, currency_id: int) -> Optional[Currency]:
        pass

    @abstractmethod
    async def get_all(self) -> List[Currency]:
        pass

    @abstractmethod
    async def update(self, currency: Currency) -> Currency:
        pass

    @abstractmethod
    async def delete(self, currency_id: int) -> bool:
        pass
