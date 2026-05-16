from datetime import date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.lease_event import LeaseEvent, LeaseEventType
from app.models.tenant import Tenant
from app.repositories.lease_event_repo import LeaseEventRepository
from app.repositories.tenant_repo import TenantRepository
from app.schemas.lease_event import LeaseEventRead, LeaseRenewRequest

router = APIRouter(prefix="/leases", tags=["leases"])


@router.get("/expiring", response_model=list[dict])
async def get_expiring_leases(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    cutoff = date.today() + timedelta(days=days)
    result = await db.execute(
        select(Tenant).where(
            Tenant.lease_end != None,
            Tenant.lease_end <= cutoff,
            Tenant.lease_end >= date.today(),
        ).order_by(Tenant.lease_end.asc())
    )
    tenants = list(result.scalars().all())
    return [
        {
            "tenant_id": str(t.id),
            "name": f"{t.first_name} {t.last_name}",
            "email": t.email,
            "property_id": str(t.property_id) if t.property_id else None,
            "lease_end": t.lease_end.isoformat() if t.lease_end else None,
            "days_remaining": (t.lease_end - date.today()).days if t.lease_end else None,
            "rent_amount": t.rent_amount,
        }
        for t in tenants
    ]


@router.post("/{tenant_id}/renew", response_model=LeaseEventRead)
async def renew_lease(
    tenant_id: UUID,
    data: LeaseRenewRequest,
    db: AsyncSession = Depends(get_db),
):
    tenant_repo = TenantRepository(db)
    tenant = await tenant_repo.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    tenant.lease_end = data.new_lease_end
    tenant.rent_amount = data.new_rent_amount
    await db.commit()
    await db.refresh(tenant)

    event_repo = LeaseEventRepository(db)
    event = LeaseEvent(
        tenant_id=tenant_id,
        event_type=LeaseEventType.renewed,
        effective_date=data.new_lease_end,
        rent_amount=data.new_rent_amount,
        notes=data.notes,
    )
    return await event_repo.create(event)


@router.get("/{tenant_id}/history", response_model=list[LeaseEventRead])
async def get_lease_history(tenant_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = LeaseEventRepository(db)
    return await repo.list_by_tenant(tenant_id)
