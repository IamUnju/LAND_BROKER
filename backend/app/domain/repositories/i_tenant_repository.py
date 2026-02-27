from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.tenant import Tenant


class ITenantRepository(ABC):

    @abstractmethod
    async def create(self, tenant: Tenant) -> Tenant:
        pass

    @abstractmethod
    async def get_by_id(self, tenant_id: int) -> Optional[Tenant]:
        pass

    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> Optional[Tenant]:
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Tenant]:
        pass

    @abstractmethod
    async def update(self, tenant: Tenant) -> Tenant:
        pass

    @abstractmethod
    async def delete(self, tenant_id: int) -> bool:
        pass
