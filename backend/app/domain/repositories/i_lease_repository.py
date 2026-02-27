from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.lease import Lease


class ILeaseRepository(ABC):

    @abstractmethod
    async def create(self, lease: Lease) -> Lease:
        pass

    @abstractmethod
    async def get_by_id(self, lease_id: int) -> Optional[Lease]:
        pass

    @abstractmethod
    async def get_by_unit(self, unit_id: int) -> List[Lease]:
        pass

    @abstractmethod
    async def get_by_tenant(self, tenant_id: int) -> List[Lease]:
        pass

    @abstractmethod
    async def get_active_lease_for_unit(self, unit_id: int) -> Optional[Lease]:
        pass

    @abstractmethod
    async def update(self, lease: Lease) -> Lease:
        pass

    @abstractmethod
    async def delete(self, lease_id: int) -> bool:
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Lease]:
        pass
