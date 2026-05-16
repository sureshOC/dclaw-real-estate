from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.maintenance_request import MaintenanceStatus, Priority


class MaintenanceRequestBase(BaseModel):
    property_id: UUID
    tenant_id: Optional[UUID] = None
    title: str
    description: str
    priority: Priority
    status: MaintenanceStatus


class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass


class MaintenanceRequestUpdate(BaseModel):
    property_id: Optional[UUID] = None
    tenant_id: Optional[UUID] = None
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[MaintenanceStatus] = None


class MaintenanceRequestRead(MaintenanceRequestBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    vendor_id: Optional[UUID] = None
    assigned_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    vendor_rating: Optional[float] = None
