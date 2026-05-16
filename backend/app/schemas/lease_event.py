from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.lease_event import LeaseEventType


class LeaseEventCreate(BaseModel):
    tenant_id: UUID
    event_type: LeaseEventType
    effective_date: date
    rent_amount: Optional[float] = None
    notes: Optional[str] = None


class LeaseRenewRequest(BaseModel):
    new_lease_end: date
    new_rent_amount: float
    notes: Optional[str] = None


class LeaseEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    event_type: LeaseEventType
    effective_date: date
    rent_amount: Optional[float]
    notes: Optional[str]
    created_at: datetime
