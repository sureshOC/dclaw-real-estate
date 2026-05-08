from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class TenantBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    property_id: Optional[UUID] = None
    lease_start: Optional[date] = None
    lease_end: Optional[date] = None
    rent_amount: Optional[float] = None


class TenantCreate(TenantBase):
    pass


class TenantUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    property_id: Optional[UUID] = None
    lease_start: Optional[date] = None
    lease_end: Optional[date] = None
    rent_amount: Optional[float] = None


class TenantRead(TenantBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
