from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.property import Property, PropertyStatus, PropertyType
from app.repositories.property_repo import PropertyRepository
from app.schemas.property import PropertyCreate, PropertyRead, PropertyUpdate
from app.services.ai_description import generate_property_description

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("/", response_model=list[PropertyRead])
async def list_properties(
    db: AsyncSession = Depends(get_db),
    property_type: Optional[PropertyType] = Query(None),
    status: Optional[PropertyStatus] = Query(None),
    city: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
):
    query = select(Property)
    if property_type:
        query = query.where(Property.property_type == property_type)
    if status:
        query = query.where(Property.status == status)
    if city:
        query = query.where(Property.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.where(Property.price >= min_price)
    if max_price is not None:
        query = query.where(Property.price <= max_price)
    result = await db.execute(query.offset(skip).limit(limit))
    return list(result.scalars().all())


@router.post("/", response_model=PropertyRead, status_code=201)
async def create_property(data: PropertyCreate, db: AsyncSession = Depends(get_db)):
    repo = PropertyRepository(db)
    prop = Property(**data.model_dump())
    return await repo.create(prop)


@router.get("/{property_id}", response_model=PropertyRead)
async def get_property(property_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = PropertyRepository(db)
    prop = await repo.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.put("/{property_id}", response_model=PropertyRead)
async def update_property(
    property_id: UUID,
    data: PropertyUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = PropertyRepository(db)
    prop = await repo.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(prop, key, value)
    await db.commit()
    await db.refresh(prop)
    return prop


@router.delete("/{property_id}", status_code=204)
async def delete_property(property_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = PropertyRepository(db)
    prop = await repo.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    await repo.delete(prop)
    return None


@router.post("/{property_id}/generate-description")
async def generate_description(property_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = PropertyRepository(db)
    prop = await repo.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    description = await generate_property_description(prop)
    prop.ai_description = description
    await db.commit()
    await db.refresh(prop)
    return {"ai_description": description}


@router.get("/{property_id}/comps")
async def get_property_comps(property_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = PropertyRepository(db)
    prop = await repo.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    if not prop.square_feet:
        return {"property_id": str(property_id), "comps": [], "message": "No square footage on record to compute comps"}

    sqft_min = prop.square_feet * 0.8
    sqft_max = prop.square_feet * 1.2

    result = await db.execute(
        select(Property).where(
            Property.id != property_id,
            Property.city == prop.city,
            Property.property_type == prop.property_type,
            Property.square_feet >= sqft_min,
            Property.square_feet <= sqft_max,
        ).order_by(Property.price)
    )
    comps = list(result.scalars().all())

    comp_rows = [
        {
            "id": str(c.id),
            "address": c.address,
            "city": c.city,
            "bedrooms": c.bedrooms,
            "bathrooms": c.bathrooms,
            "square_feet": c.square_feet,
            "price": c.price,
            "price_per_sqft": round(c.price / c.square_feet, 2) if c.square_feet else None,
            "status": c.status.value,
        }
        for c in comps
    ]

    avg_price = sum(c["price"] for c in comp_rows) / len(comp_rows) if comp_rows else None
    market_diff_pct = ((prop.price - avg_price) / avg_price * 100) if avg_price else None

    return {
        "property_id": str(property_id),
        "subject_price": prop.price,
        "market_avg_price": round(avg_price, 2) if avg_price else None,
        "market_diff_pct": round(market_diff_pct, 1) if market_diff_pct is not None else None,
        "comps": comp_rows,
    }
