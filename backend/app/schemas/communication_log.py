from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.communication_log import CommunicationDirection, CommunicationType


class CommunicationLogCreate(BaseModel):
    type: CommunicationType
    direction: CommunicationDirection
    summary: str
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None


class CommunicationLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    property_id: Optional[UUID]
    type: CommunicationType
    direction: CommunicationDirection
    summary: str
    created_by: Optional[str]
    created_at: datetime
