from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.maintenance_request import MaintenanceRequest, MaintenanceStatus, Priority
from app.models.vendor import Vendor
from app.repositories.maintenance_repo import MaintenanceRepository
from app.repositories.vendor_repo import VendorRepository
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


@router.post("/{request_id}/assign", response_model=MaintenanceRequestRead)
async def assign_vendor(
    request_id: UUID,
    vendor_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = MaintenanceRepository(db)
    req = await repo.get_by_id(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")

    vendor_repo = VendorRepository(db)
    vendor = await vendor_repo.get_by_id(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    req.vendor_id = vendor_id
    req.assigned_at = datetime.utcnow()
    req.status = MaintenanceStatus.in_progress
    await db.commit()
    await db.refresh(req)
    return req


@router.post("/{request_id}/resolve", response_model=MaintenanceRequestRead)
async def resolve_request(
    request_id: UUID,
    vendor_rating: Optional[float] = Query(None, ge=1, le=5),
    db: AsyncSession = Depends(get_db),
):
    repo = MaintenanceRepository(db)
    req = await repo.get_by_id(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")

    req.status = MaintenanceStatus.resolved
    req.resolved_at = datetime.utcnow()
    if vendor_rating is not None:
        req.vendor_rating = vendor_rating
        if req.vendor_id:
            vendor_repo = VendorRepository(db)
            vendor = await vendor_repo.get_by_id(req.vendor_id)
            if vendor:
                vendor.rating = vendor_rating
                await vendor_repo.update(vendor)

    await db.commit()
    await db.refresh(req)
    return req


@router.get("/{request_id}/suggest-vendor")
async def suggest_vendor(request_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = MaintenanceRepository(db)
    req = await repo.get_by_id(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")

    # Map request priority/title keywords to specialty
    title_lower = req.title.lower()
    if any(w in title_lower for w in ["pipe", "leak", "water", "drain", "faucet", "toilet"]):
        specialty_hint = "plumbing"
    elif any(w in title_lower for w in ["electric", "outlet", "wire", "circuit", "light", "power"]):
        specialty_hint = "electrical"
    elif any(w in title_lower for w in ["hvac", "heat", "air", "ac", "furnace", "cooling"]):
        specialty_hint = "hvac"
    elif any(w in title_lower for w in ["roof", "gutter", "shingle"]):
        specialty_hint = "roofing"
    elif any(w in title_lower for w in ["lawn", "yard", "grass", "tree", "landscape"]):
        specialty_hint = "landscaping"
    else:
        specialty_hint = "general"

    from app.models.vendor import VendorSpecialty
    try:
        target_specialty = VendorSpecialty(specialty_hint)
    except ValueError:
        target_specialty = VendorSpecialty.general

    result = await db.execute(
        select(Vendor)
        .where(Vendor.specialty == target_specialty)
        .order_by(Vendor.rating.desc().nulls_last())
        .limit(3)
    )
    candidates = list(result.scalars().all())

    if not candidates:
        result = await db.execute(
            select(Vendor).order_by(Vendor.rating.desc().nulls_last()).limit(3)
        )
        candidates = list(result.scalars().all())

    return {
        "detected_specialty": specialty_hint,
        "suggestions": [
            {
                "vendor_id": str(v.id),
                "name": v.name,
                "specialty": v.specialty.value,
                "rating": v.rating,
                "rationale": f"Matched on specialty '{v.specialty.value}' with rating {v.rating or 'N/A'}",
            }
            for v in candidates
        ],
    }
