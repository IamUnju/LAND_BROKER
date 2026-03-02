from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.unit import Unit


class IUnitRepository(ABC):

    @abstractmethod
    async def create(self, unit: Unit) -> Unit:
        pass

    @abstractmethod
    async def get_by_id(self, unit_id: int) -> Optional[Unit]:
        pass

    @abstractmethod
    async def get_by_property(self, property_id: int) -> List[Unit]:
        pass

    @abstractmethod
    async def update(self, unit: Unit) -> Unit:
        pass

    @abstractmethod
    async def delete(self, unit_id: int) -> bool:
        pass

    @abstractmethod
    async def get_by_owner(self, owner_id: int) -> List[Unit]:
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Unit]:
        pass
