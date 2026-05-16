from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.communication_log import CommunicationLog
from app.models.tenant import Tenant
from app.repositories.communication_log_repo import CommunicationLogRepository
from app.repositories.tenant_repo import TenantRepository
from app.schemas.communication_log import CommunicationLogCreate, CommunicationLogRead
from app.schemas.tenant import TenantCreate, TenantRead, TenantUpdate
from app.services.tenant_screening import run_screening

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("/", response_model=list[TenantRead])
async def list_tenants(
    db: AsyncSession = Depends(get_db),
    property_id: Optional[UUID] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
):
    query = select(Tenant)
    if property_id:
        query = query.where(Tenant.property_id == property_id)
    result = await db.execute(query.offset(skip).limit(limit))
    return list(result.scalars().all())


@router.post("/", response_model=TenantRead, status_code=201)
async def create_tenant(data: TenantCreate, db: AsyncSession = Depends(get_db)):
    repo = TenantRepository(db)
    tenant = Tenant(**data.model_dump())
    return await repo.create(tenant)


@router.get("/{tenant_id}", response_model=TenantRead)
async def get_tenant(tenant_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = TenantRepository(db)
    tenant = await repo.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=TenantRead)
async def update_tenant(
    tenant_id: UUID,
    data: TenantUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = TenantRepository(db)
    tenant = await repo.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(tenant, key, value)
    await db.commit()
    await db.refresh(tenant)
    return tenant


@router.delete("/{tenant_id}", status_code=204)
async def delete_tenant(tenant_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = TenantRepository(db)
    tenant = await repo.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    await repo.delete(tenant)
    return None


@router.post("/{tenant_id}/screen")
async def screen_tenant(tenant_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = TenantRepository(db)
    tenant = await repo.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    result = await run_screening(tenant)

    tenant.screening_score = result["score"]
    tenant.screening_tier = result["tier"]
    tenant.screening_notes = result["recommendation"]
    tenant.screened_at = datetime.utcnow()
    await db.commit()
    await db.refresh(tenant)

    return result


@router.get("/{tenant_id}/communications", response_model=list[CommunicationLogRead])
async def list_communications(tenant_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = TenantRepository(db)
    tenant = await repo.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    comm_repo = CommunicationLogRepository(db)
    return await comm_repo.list_by_tenant(tenant_id)


@router.post("/{tenant_id}/communications", response_model=CommunicationLogRead, status_code=201)
async def create_communication(
    tenant_id: UUID,
    data: CommunicationLogCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = TenantRepository(db)
    tenant = await repo.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    comm_repo = CommunicationLogRepository(db)
    log_data = data.model_dump()
    if log_data.get("created_at") is None:
        log_data["created_at"] = datetime.utcnow()
    log = CommunicationLog(
        tenant_id=tenant_id,
        property_id=tenant.property_id,
        **log_data,
    )
    return await comm_repo.create(log)
