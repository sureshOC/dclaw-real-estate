from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.maintenance_request import MaintenanceRequest
from app.models.vendor import Vendor

KEYWORD_SPECIALTY = {
    "plumb": "plumbing", "pipe": "plumbing", "leak": "plumbing", "drain": "plumbing",
    "electric": "electrical", "wir": "electrical", "outlet": "electrical", "circuit": "electrical",
    "hvac": "hvac", "heat": "hvac", "cool": "hvac", "ac ": "hvac", "furnace": "hvac",
    "roof": "roofing", "shingle": "roofing", "gutter": "roofing",
    "landscap": "landscaping", "lawn": "landscaping", "tree": "landscaping", "garden": "landscaping",
}


def _detect_specialty(request: MaintenanceRequest) -> str:
    text = f"{request.title} {request.description}".lower()
    for keyword, specialty in KEYWORD_SPECIALTY.items():
        if keyword in text:
            return specialty
    return "general"


async def suggest_vendor(request: MaintenanceRequest, org_id: UUID, db: AsyncSession) -> Vendor | None:
    specialty = _detect_specialty(request)

    open_counts_r = await db.execute(
        select(MaintenanceRequest.vendor_id, func.count().label("cnt"))
        .where(
            MaintenanceRequest.status.in_(["open", "in_progress"]),
            MaintenanceRequest.vendor_id.isnot(None),
        )
        .group_by(MaintenanceRequest.vendor_id)
    )
    open_counts = {row.vendor_id: row.cnt for row in open_counts_r}

    vendors_r = await db.execute(
        select(Vendor).where(Vendor.specialty == specialty)
    )
    vendors = vendors_r.scalars().all()

    if not vendors:
        vendors_r = await db.execute(select(Vendor).where(Vendor.specialty == "general"))
        vendors = vendors_r.scalars().all()

    if not vendors:
        return None

    return min(vendors, key=lambda v: (-(v.rating or 0), open_counts.get(v.id, 0)))


async def auto_dispatch(request_id: UUID, org_id: UUID, db: AsyncSession) -> dict[str, Any]:
    r = await db.execute(
        select(MaintenanceRequest).where(MaintenanceRequest.id == request_id)
    )
    request = r.scalar_one_or_none()
    if not request:
        return {"dispatched": False, "reason": "Request not found"}

    vendor = await suggest_vendor(request, org_id, db)
    if not vendor:
        return {"dispatched": False, "reason": "No suitable vendor found"}

    request.vendor_id = vendor.id
    request.assigned_at = datetime.utcnow()
    await db.commit()

    return {
        "dispatched": True,
        "vendor_id": str(vendor.id),
        "vendor_name": vendor.name,
        "specialty": vendor.specialty,
        "rating": vendor.rating,
        "rationale": (
            f"Best match for '{request.title}': {vendor.name} "
            f"({vendor.specialty}, rating {vendor.rating or 'N/A'})"
        ),
    }
