from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.maintenance_request import MaintenanceRequest, MaintenanceStatus, Priority
from app.repositories.maintenance_repo import MaintenanceRepository
from app.schemas.maintenance_request import (
    MaintenanceRequestCreate,
    MaintenanceRequestRead,
    MaintenanceRequestUpdate,
)

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


@router.get("/", response_model=list[MaintenanceRequestRead])
async def list_maintenance_requests(
    db: AsyncSession = Depends(get_db),
    property_id: Optional[UUID] = Query(None),
    tenant_id: Optional[UUID] = Query(None),
    priority: Optional[Priority] = Query(None),
    status: Optional[MaintenanceStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
):
    query = select(MaintenanceRequest)
    if property_id:
        query = query.where(MaintenanceRequest.property_id == property_id)
    if tenant_id:
        query = query.where(MaintenanceRequest.tenant_id == tenant_id)
    if priority:
        query = query.where(MaintenanceRequest.priority == priority)
    if status:
        query = query.where(MaintenanceRequest.status == status)
    result = await db.execute(query.offset(skip).limit(limit))
    return list(result.scalars().all())


@router.post("/", response_model=MaintenanceRequestRead, status_code=201)
async def create_maintenance_request(
    data: MaintenanceRequestCreate, db: AsyncSession = Depends(get_db)
):
    repo = MaintenanceRepository(db)
    req = MaintenanceRequest(**data.model_dump())
    return await repo.create(req)


@router.get("/{request_id}", response_model=MaintenanceRequestRead)
async def get_maintenance_request(
    request_id: UUID, db: AsyncSession = Depends(get_db)
):
    repo = MaintenanceRepository(db)
    req = await repo.get_by_id(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    return req


@router.put("/{request_id}", response_model=MaintenanceRequestRead)
async def update_maintenance_request(
    request_id: UUID,
    data: MaintenanceRequestUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = MaintenanceRepository(db)
    req = await repo.get_by_id(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(req, key, value)
    await db.commit()
    await db.refresh(req)
    return req


@router.delete("/{request_id}", status_code=204)
async def delete_maintenance_request(
    request_id: UUID, db: AsyncSession = Depends(get_db)
):
    repo = MaintenanceRepository(db)
    req = await repo.get_by_id(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    await repo.delete(req)
    return None
