from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import date
from app.domain.entities.payment import Payment


class IPaymentRepository(ABC):

    @abstractmethod
    async def create(self, payment: Payment) -> Payment:
        pass

    @abstractmethod
    async def get_by_id(self, payment_id: int) -> Optional[Payment]:
        pass

    @abstractmethod
    async def get_by_lease(self, lease_id: int) -> List[Payment]:
        pass

    @abstractmethod
    async def get_overdue(self, as_of_date: date) -> List[Payment]:
        pass

    @abstractmethod
    async def update(self, payment: Payment) -> Payment:
        pass

    @abstractmethod
    async def delete(self, payment_id: int) -> bool:
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Payment]:
        pass

    @abstractmethod
    async def get_monthly_summary(self, year: int, month: int) -> dict:
        pass
