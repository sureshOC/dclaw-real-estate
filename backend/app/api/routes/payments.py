from datetime import date, datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.rent_payment import RentPayment, PaymentStatus
from app.repositories.rent_payment_repo import RentPaymentRepository
from app.schemas.rent_payment import RentPaymentCreate, RentPaymentRead, RentPaymentUpdate

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/", response_model=list[RentPaymentRead])
async def list_payments(
    tenant_id: Optional[UUID] = Query(None),
    property_id: Optional[UUID] = Query(None),
    month: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    repo = RentPaymentRepository(db)
    if tenant_id:
        return await repo.list_by_tenant(tenant_id, month)
    if property_id:
        return await repo.list_by_property(property_id)
    items, _ = await repo.list_all(limit=100)
    return items


@router.post("/", response_model=RentPaymentRead, status_code=201)
async def create_payment(data: RentPaymentCreate, db: AsyncSession = Depends(get_db)):
    repo = RentPaymentRepository(db)
    payment = RentPayment(**data.model_dump())
    return await repo.create(payment)


@router.get("/{payment_id}", response_model=RentPaymentRead)
async def get_payment(payment_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = RentPaymentRepository(db)
    payment = await repo.get_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.put("/{payment_id}", response_model=RentPaymentRead)
async def update_payment(
    payment_id: UUID, data: RentPaymentUpdate, db: AsyncSession = Depends(get_db)
):
    repo = RentPaymentRepository(db)
    payment = await repo.get_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(payment, key, value)
    return await repo.update(payment)


@router.post("/{payment_id}/apply-late-fee", response_model=RentPaymentRead)
async def apply_late_fee(payment_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = RentPaymentRepository(db)
    payment = await repo.get_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    today = date.today()
    grace_cutoff = date(payment.due_date.year, payment.due_date.month,
                        payment.due_date.day)
    days_late = (today - grace_cutoff).days

    if days_late <= settings.late_fee_grace_days:
        raise HTTPException(
            status_code=400,
            detail=f"Payment is within the {settings.late_fee_grace_days}-day grace period"
        )

    payment.late_fee = settings.late_fee_flat
    payment.status = PaymentStatus.late
    return await repo.update(payment)
