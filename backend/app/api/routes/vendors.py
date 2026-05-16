from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.vendor import Vendor, VendorSpecialty
from app.repositories.vendor_repo import VendorRepository
from app.schemas.vendor import VendorCreate, VendorRead, VendorUpdate

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get("/", response_model=list[VendorRead])
async def list_vendors(
    specialty: Optional[VendorSpecialty] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Vendor)
    if specialty:
        query = query.where(Vendor.specialty == specialty)
    result = await db.execute(query.order_by(Vendor.name))
    return list(result.scalars().all())


@router.post("/", response_model=VendorRead, status_code=201)
async def create_vendor(data: VendorCreate, db: AsyncSession = Depends(get_db)):
    repo = VendorRepository(db)
    vendor = Vendor(**data.model_dump())
    return await repo.create(vendor)


@router.get("/{vendor_id}", response_model=VendorRead)
async def get_vendor(vendor_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = VendorRepository(db)
    vendor = await repo.get_by_id(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.put("/{vendor_id}", response_model=VendorRead)
async def update_vendor(
    vendor_id: UUID, data: VendorUpdate, db: AsyncSession = Depends(get_db)
):
    repo = VendorRepository(db)
    vendor = await repo.get_by_id(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(vendor, key, value)
    return await repo.update(vendor)


@router.delete("/{vendor_id}", status_code=204)
async def delete_vendor(vendor_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = VendorRepository(db)
    vendor = await repo.get_by_id(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    await repo.delete(vendor)
