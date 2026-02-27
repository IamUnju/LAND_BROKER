from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.commission import Commission


class ICommissionRepository(ABC):

    @abstractmethod
    async def create(self, commission: Commission) -> Commission:
        pass

    @abstractmethod
    async def get_by_id(self, commission_id: int) -> Optional[Commission]:
        pass

    @abstractmethod
    async def get_by_broker(self, broker_id: int) -> List[Commission]:
        pass

    @abstractmethod
    async def get_by_property(self, property_id: int) -> List[Commission]:
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Commission]:
        pass

    @abstractmethod
    async def update(self, commission: Commission) -> Commission:
        pass

    @abstractmethod
    async def delete(self, commission_id: int) -> bool:
        pass
