from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.vendor import VendorSpecialty


class VendorCreate(BaseModel):
    name: str
    specialty: VendorSpecialty
    phone: Optional[str] = None
    email: Optional[str] = None
    rating: Optional[float] = None
    notes: Optional[str] = None


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[VendorSpecialty] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    rating: Optional[float] = None
    notes: Optional[str] = None


class VendorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    specialty: VendorSpecialty
    phone: Optional[str]
    email: Optional[str]
    rating: Optional[float]
    notes: Optional[str]
