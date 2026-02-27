from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.inquiry import Inquiry, Favorite


class IInquiryRepository(ABC):

    @abstractmethod
    async def create(self, inquiry: Inquiry) -> Inquiry:
        pass

    @abstractmethod
    async def get_by_id(self, inquiry_id: int) -> Optional[Inquiry]:
        pass

    @abstractmethod
    async def get_by_property(self, property_id: int) -> List[Inquiry]:
        pass

    @abstractmethod
    async def get_by_user(self, user_id: int) -> List[Inquiry]:
        pass

    @abstractmethod
    async def update(self, inquiry: Inquiry) -> Inquiry:
        pass

    @abstractmethod
    async def delete(self, inquiry_id: int) -> bool:
        pass

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Inquiry]:
        pass


class IFavoriteRepository(ABC):

    @abstractmethod
    async def create(self, favorite: Favorite) -> Favorite:
        pass

    @abstractmethod
    async def delete(self, user_id: int, property_id: int) -> bool:
        pass

    @abstractmethod
    async def get_by_user(self, user_id: int) -> List[Favorite]:
        pass

    @abstractmethod
    async def exists(self, user_id: int, property_id: int) -> bool:
        pass
