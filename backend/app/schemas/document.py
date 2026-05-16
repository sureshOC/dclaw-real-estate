from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.document import DocumentCategory


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    property_id: UUID
    tenant_id: Optional[UUID]
    name: str
    file_key: str
    file_size: Optional[int]
    mime_type: Optional[str]
    category: DocumentCategory
    uploaded_at: datetime
