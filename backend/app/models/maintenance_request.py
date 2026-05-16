import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum as SQLEnum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    emergency = "emergency"


class MaintenanceStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    org_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True
    )
    property_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("properties.id", ondelete="CASCADE")
    )
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    priority: Mapped[Priority] = mapped_column(
        SQLEnum(Priority), default=Priority.low
    )
    status: Mapped[MaintenanceStatus] = mapped_column(
        SQLEnum(MaintenanceStatus), default=MaintenanceStatus.open
    )

    # Vendor assignment
    vendor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True
    )
    assigned_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    vendor_rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    property: Mapped["Property"] = relationship(
        "Property", back_populates="maintenance_requests", lazy="selectin"
    )
    tenant: Mapped[Optional["Tenant"]] = relationship(
        "Tenant", back_populates="maintenance_requests", lazy="selectin"
    )
    vendor: Mapped[Optional["Vendor"]] = relationship(
        "Vendor", back_populates="maintenance_requests", lazy="selectin"
    )
