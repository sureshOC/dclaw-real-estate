import enum
import uuid
from typing import Optional

from sqlalchemy import Enum as SQLEnum, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class VendorSpecialty(str, enum.Enum):
    plumbing = "plumbing"
    electrical = "electrical"
    hvac = "hvac"
    general = "general"
    landscaping = "landscaping"
    roofing = "roofing"


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    specialty: Mapped[VendorSpecialty] = mapped_column(SQLEnum(VendorSpecialty))
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    maintenance_requests: Mapped[list["MaintenanceRequest"]] = relationship(
        "MaintenanceRequest", back_populates="vendor", lazy="selectin"
    )
