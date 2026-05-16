from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.rent_payment import PaymentMethod, PaymentStatus


class RentPaymentCreate(BaseModel):
    tenant_id: UUID
    property_id: UUID
    amount: float
    due_date: date
    paid_amount: Optional[float] = None
    paid_date: Optional[date] = None
    status: PaymentStatus = PaymentStatus.pending
    method: Optional[PaymentMethod] = None
    notes: Optional[str] = None


class RentPaymentUpdate(BaseModel):
    paid_amount: Optional[float] = None
    paid_date: Optional[date] = None
    status: Optional[PaymentStatus] = None
    method: Optional[PaymentMethod] = None
    late_fee: Optional[float] = None
    notes: Optional[str] = None


class RentPaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    property_id: UUID
    amount: float
    paid_amount: Optional[float]
    due_date: date
    paid_date: Optional[date]
    status: PaymentStatus
    method: Optional[PaymentMethod]
    late_fee: Optional[float]
    notes: Optional[str]
    created_at: datetime
