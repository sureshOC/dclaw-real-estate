from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.property import Property, PropertyStatus
from app.models.rent_payment import RentPayment, PaymentStatus
from app.models.tenant import Tenant

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/rent-roll")
async def get_rent_roll(db: AsyncSession = Depends(get_db)):
    today = date.today()
    year = today.year

    tenants_result = await db.execute(select(Tenant))
    tenants = list(tenants_result.scalars().all())

    rows = []
    for tenant in tenants:
        ytd_paid_result = await db.execute(
            select(func.coalesce(func.sum(RentPayment.paid_amount), 0)).where(
                RentPayment.tenant_id == tenant.id,
                RentPayment.status == PaymentStatus.paid,
                extract("year", RentPayment.paid_date) == year,
            )
        )
        ytd_collected = float(ytd_paid_result.scalar() or 0)

        months_elapsed = today.month
        ytd_expected = (tenant.rent_amount or 0) * months_elapsed

        current_payment_result = await db.execute(
            select(RentPayment).where(
                RentPayment.tenant_id == tenant.id,
                extract("year", RentPayment.due_date) == year,
                extract("month", RentPayment.due_date) == today.month,
            )
        )
        current_payment = current_payment_result.scalar_one_or_none()
        payment_status = current_payment.status.value if current_payment else "pending"

        property_address = None
        if tenant.property:
            property_address = f"{tenant.property.address}, {tenant.property.city}"

        rows.append({
            "tenant_id": str(tenant.id),
            "tenant_name": f"{tenant.first_name} {tenant.last_name}",
            "property_address": property_address,
            "lease_start": tenant.lease_start.isoformat() if tenant.lease_start else None,
            "lease_end": tenant.lease_end.isoformat() if tenant.lease_end else None,
            "monthly_rent": tenant.rent_amount,
            "payment_status": payment_status,
            "ytd_collected": ytd_collected,
            "ytd_expected": ytd_expected,
            "variance": ytd_collected - ytd_expected,
        })

    return {"year": year, "generated_at": today.isoformat(), "rows": rows}


@router.get("/occupancy")
async def get_occupancy_report(
    start: Optional[date] = Query(None),
    end: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    period_end = end or today
    period_start = start or date(today.year, 1, 1)

    props_result = await db.execute(select(Property))
    properties = list(props_result.scalars().all())

    portfolio_occupied = 0
    total_vacancy_cost = 0.0
    property_rows = []

    for prop in properties:
        tenants_result = await db.execute(
            select(Tenant).where(Tenant.property_id == prop.id)
        )
        tenants = list(tenants_result.scalars().all())

        is_occupied = any(
            t.lease_start and t.lease_end
            and t.lease_start <= today <= t.lease_end
            for t in tenants
        )
        if is_occupied:
            portfolio_occupied += 1

        vacancy_days = 0
        vacancy_cost = 0.0
        last_moveout = None

        for t in tenants:
            if t.lease_end and t.lease_end < today:
                last_moveout = t.lease_end if (last_moveout is None or t.lease_end > last_moveout) else last_moveout

        if not is_occupied and last_moveout:
            vacancy_days = (today - last_moveout).days
            daily_rate = (tenants[0].rent_amount or 0) / 30 if tenants else 0
            vacancy_cost = vacancy_days * daily_rate

        total_vacancy_cost += vacancy_cost

        current_tenant = next(
            (t for t in tenants if t.lease_start and t.lease_end and t.lease_start <= today <= t.lease_end),
            None,
        )

        property_rows.append({
            "property_id": str(prop.id),
            "property_title": prop.title,
            "property_address": f"{prop.address}, {prop.city}",
            "status": "occupied" if is_occupied else "vacant",
            "last_moveout": last_moveout.isoformat() if last_moveout else None,
            "vacancy_days": vacancy_days,
            "vacancy_cost": round(vacancy_cost, 2),
            "current_tenant": f"{current_tenant.first_name} {current_tenant.last_name}" if current_tenant else None,
        })

    total = len(properties)
    occupancy_rate = (portfolio_occupied / total * 100) if total > 0 else 0

    return {
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat(),
        "portfolio_occupancy_rate": round(occupancy_rate, 1),
        "total_vacancy_cost": round(total_vacancy_cost, 2),
        "properties": property_rows,
    }
