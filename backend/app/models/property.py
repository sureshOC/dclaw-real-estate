import enum
import uuid
from typing import Optional

from sqlalchemy import Enum as SQLEnum, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class PropertyType(str, enum.Enum):
    house = "house"
    apartment = "apartment"
    condo = "condo"
    commercial = "commercial"
    land = "land"


class PropertyStatus(str, enum.Enum):
    available = "available"
    rented = "rented"
    sold = "sold"
    pending = "pending"


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255))
    address: Mapped[str] = mapped_column(String(255))
    city: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(100))
    zip_code: Mapped[str] = mapped_column(String(20))
    price: Mapped[float] = mapped_column(Float)
    property_type: Mapped[PropertyType] = mapped_column(
        SQLEnum(PropertyType), default=PropertyType.house
    )
    bedrooms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    bathrooms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    square_feet: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[PropertyStatus] = mapped_column(
        SQLEnum(PropertyStatus), default=PropertyStatus.available
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    tenants: Mapped[list["Tenant"]] = relationship(
        "Tenant", back_populates="property", lazy="selectin"
    )
    maintenance_requests: Mapped[list["MaintenanceRequest"]] = relationship(
        "MaintenanceRequest", back_populates="property", lazy="selectin"
    )
    expenses: Mapped[list["Expense"]] = relationship(
        "Expense", back_populates="property", lazy="selectin"
    )
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="property", lazy="selectin"
    )
