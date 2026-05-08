import uuid
from datetime import date
from typing import Optional

from sqlalchemy import Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    property_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("properties.id", ondelete="SET NULL"), nullable=True
    )
    lease_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    lease_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    rent_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    property: Mapped[Optional["Property"]] = relationship(
        "Property", back_populates="tenants", lazy="selectin"
    )
    maintenance_requests: Mapped[list["MaintenanceRequest"]] = relationship(
        "MaintenanceRequest", back_populates="tenant", lazy="selectin"
    )
