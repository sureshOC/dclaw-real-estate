from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.property import PropertyStatus, PropertyType


class PropertyBase(BaseModel):
    title: str
    address: str
    city: str
    state: str
    zip_code: str
    price: float
    property_type: PropertyType
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    square_feet: Optional[int] = None
    status: PropertyStatus
    description: Optional[str] = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    price: Optional[float] = None
    property_type: Optional[PropertyType] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    square_feet: Optional[int] = None
    status: Optional[PropertyStatus] = None
    description: Optional[str] = None


class PropertyRead(PropertyBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
