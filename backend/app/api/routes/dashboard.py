from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.maintenance_request import MaintenanceRequest, MaintenanceStatus
from app.models.property import Property, PropertyStatus

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    total_result = await db.execute(select(func.count()).select_from(Property))
    total = total_result.scalar() or 0

    occupied_result = await db.execute(
        select(func.count()).select_from(Property).where(Property.status == PropertyStatus.rented)
    )
    occupied = occupied_result.scalar() or 0

    vacant_result = await db.execute(
        select(func.count()).select_from(Property).where(Property.status == PropertyStatus.available)
    )
    vacant = vacant_result.scalar() or 0

    open_result = await db.execute(
        select(func.count())
        .select_from(MaintenanceRequest)
        .where(MaintenanceRequest.status == MaintenanceStatus.open)
    )
    open_maint = open_result.scalar() or 0

    return {
        "total_properties": total,
        "occupied": occupied,
        "vacant": vacant,
        "open_maintenance": open_maint,
    }
