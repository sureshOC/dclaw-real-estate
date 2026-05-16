import enum
import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Enum as SQLEnum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class LeaseEventType(str, enum.Enum):
    created = "created"
    renewed = "renewed"
    terminated = "terminated"
    extended = "extended"


class LeaseEvent(Base):
    __tablename__ = "lease_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    event_type: Mapped[LeaseEventType] = mapped_column(SQLEnum(LeaseEventType))
    effective_date: Mapped[date] = mapped_column(Date)
    rent_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="lease_events", lazy="selectin")
