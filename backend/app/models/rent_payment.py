import enum
import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Enum as SQLEnum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    partial = "partial"
    late = "late"


class PaymentMethod(str, enum.Enum):
    bank_transfer = "bank_transfer"
    check = "check"
    cash = "cash"
    other = "other"


class RentPayment(Base):
    __tablename__ = "rent_payments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    property_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("properties.id", ondelete="CASCADE")
    )
    amount: Mapped[float] = mapped_column(Float)
    paid_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    due_date: Mapped[date] = mapped_column(Date)
    paid_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[PaymentStatus] = mapped_column(
        SQLEnum(PaymentStatus), default=PaymentStatus.pending
    )
    method: Mapped[Optional[PaymentMethod]] = mapped_column(
        SQLEnum(PaymentMethod), nullable=True
    )
    late_fee: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="rent_payments", lazy="selectin")
    property: Mapped["Property"] = relationship("Property", lazy="selectin")
