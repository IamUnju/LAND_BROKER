from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from enum import Enum


class MaintenanceStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class MaintenancePriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


@dataclass
class MaintenanceRequest:
    unit_id: int
    tenant_id: int
    title: str
    description: str
    priority: MaintenancePriority = MaintenancePriority.MEDIUM
    status: MaintenanceStatus = MaintenanceStatus.PENDING
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()
        if isinstance(self.status, str):
            self.status = MaintenanceStatus(self.status)
        if isinstance(self.priority, str):
            self.priority = MaintenancePriority(self.priority)

    def _validate(self):
        if not self.title or not self.title.strip():
            raise ValueError("Maintenance request title cannot be empty")
        if not self.description or not self.description.strip():
            raise ValueError("Maintenance request description cannot be empty")
        if len(self.title) > 255:
            raise ValueError("Title cannot exceed 255 characters")

    def start_work(self, assigned_to: Optional[str] = None):
        if self.status != MaintenanceStatus.PENDING:
            raise ValueError("Only pending requests can be started")
        self.status = MaintenanceStatus.IN_PROGRESS
        self.assigned_to = assigned_to

    def complete(self, resolution_notes: Optional[str] = None):
        if self.status != MaintenanceStatus.IN_PROGRESS:
            raise ValueError("Only in-progress requests can be completed")
        self.status = MaintenanceStatus.COMPLETED
        self.resolution_notes = resolution_notes
        self.resolved_at = datetime.utcnow()

    def cancel(self):
        if self.status == MaintenanceStatus.COMPLETED:
            raise ValueError("Cannot cancel a completed request")
        self.status = MaintenanceStatus.CANCELLED
