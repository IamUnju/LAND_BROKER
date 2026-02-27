from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from enum import Enum


class InquiryStatus(str, Enum):
    PENDING = "PENDING"
    RESPONDED = "RESPONDED"
    CLOSED = "CLOSED"


@dataclass
class Inquiry:
    property_id: int
    user_id: int
    message: str
    status: InquiryStatus = InquiryStatus.PENDING
    response: Optional[str] = None
    responded_at: Optional[datetime] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()
        if isinstance(self.status, str):
            self.status = InquiryStatus(self.status)

    def _validate(self):
        if not self.message or not self.message.strip():
            raise ValueError("Inquiry message cannot be empty")
        if len(self.message) > 1000:
            raise ValueError("Message cannot exceed 1000 characters")

    def respond(self, response: str):
        if not response or not response.strip():
            raise ValueError("Response cannot be empty")
        if self.status == InquiryStatus.CLOSED:
            raise ValueError("Cannot respond to a closed inquiry")
        self.response = response
        self.status = InquiryStatus.RESPONDED
        self.responded_at = datetime.utcnow()

    def close(self):
        self.status = InquiryStatus.CLOSED


@dataclass
class Favorite:
    user_id: int
    property_id: int
    id: Optional[int] = None
    created_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.user_id or self.user_id <= 0:
            raise ValueError("Invalid user ID")
        if not self.property_id or self.property_id <= 0:
            raise ValueError("Invalid property ID")
