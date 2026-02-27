from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.maintenance import MaintenanceRequest


class IMaintenanceRepository(ABC):

    @abstractmethod
    async def create(self, request: MaintenanceRequest) -> MaintenanceRequest:
        pass

    @abstractmethod
    async def get_by_id(self, request_id: int) -> Optional[MaintenanceRequest]:
        pass

    @abstractmethod
    async def get_by_unit(self, unit_id: int) -> List[MaintenanceRequest]:
        pass

    @abstractmethod
    async def get_by_tenant(self, tenant_id: int) -> List[MaintenanceRequest]:
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[MaintenanceRequest]:
        pass

    @abstractmethod
    async def update(self, request: MaintenanceRequest) -> MaintenanceRequest:
        pass

    @abstractmethod
    async def delete(self, request_id: int) -> bool:
        pass
