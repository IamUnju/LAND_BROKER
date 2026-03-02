from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.domain.entities.property import Property


class IPropertyRepository(ABC):

    @abstractmethod
    async def create(self, prop: Property) -> Property:
        pass

    @abstractmethod
    async def get_by_id(self, property_id: int) -> Optional[Property]:
        pass

    @abstractmethod
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Property]:
        pass

    @abstractmethod
    async def update(self, prop: Property) -> Property:
        pass

    @abstractmethod
    async def delete(self, property_id: int) -> bool:
        pass

    @abstractmethod
    async def get_by_owner(self, owner_id: int, skip: int = 0, limit: int = 20) -> List[Property]:
        pass

    @abstractmethod
    async def get_by_broker(self, broker_id: int, skip: int = 0, limit: int = 20) -> List[Property]:
        pass

    @abstractmethod
    async def get_published(
        self,
        skip: int = 0,
        limit: int = 20,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Property]:
        pass

    @abstractmethod
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        pass

    @abstractmethod
    async def count_published(self, filters: Optional[Dict[str, Any]] = None) -> int:
        pass
