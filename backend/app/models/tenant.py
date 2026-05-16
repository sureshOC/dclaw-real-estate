import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    org_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True
    )
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

    # Screening fields
    income: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    prior_eviction: Mapped[bool] = mapped_column(Boolean, default=False)
    screening_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    screening_tier: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    screening_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    screened_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    property: Mapped[Optional["Property"]] = relationship(
        "Property", back_populates="tenants", lazy="selectin"
    )
    maintenance_requests: Mapped[list["MaintenanceRequest"]] = relationship(
        "MaintenanceRequest", back_populates="tenant", lazy="selectin"
    )
    rent_payments: Mapped[list["RentPayment"]] = relationship(
        "RentPayment", back_populates="tenant", lazy="selectin"
    )
    lease_events: Mapped[list["LeaseEvent"]] = relationship(
        "LeaseEvent", back_populates="tenant", lazy="selectin"
    )
    communications: Mapped[list["CommunicationLog"]] = relationship(
        "CommunicationLog", back_populates="tenant", lazy="selectin"
    )
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="tenant", lazy="selectin"
    )
