from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, decode_token
from app.models.maintenance_request import MaintenanceRequest
from app.models.tenant import Tenant

router = APIRouter(prefix="/portal", tags=["portal"])
_bearer = HTTPBearer(auto_error=False)


class PortalLoginRequest(BaseModel):
    email: str
    portal_code: str


class PortalLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tenant_id: str
    tenant_name: str


async def _get_portal_tenant(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> Tenant:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "portal":
        raise HTTPException(status_code=401, detail="Invalid portal token")
    tenant_id = payload.get("sub")
    if not tenant_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    result = await db.execute(select(Tenant).where(Tenant.id == UUID(tenant_id)))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=401, detail="Tenant not found")
    return tenant


@router.post("/auth", response_model=PortalLoginResponse)
async def portal_login(data: PortalLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tenant).where(Tenant.email == data.email))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # In production: verify against a portal_code field on Tenant (emailed on lease creation)
    # Dev mode: accept any 6-char code
    if not data.portal_code or len(data.portal_code) < 6:
        raise HTTPException(status_code=401, detail="Invalid portal code — must be 6 characters")

    token = create_access_token(
        {"sub": str(tenant.id), "type": "portal"},
        expires_minutes=60 * 24 * 7,
    )
    return PortalLoginResponse(
        access_token=token,
        tenant_id=str(tenant.id),
        tenant_name=f"{tenant.first_name} {tenant.last_name}",
    )


@router.get("/dashboard")
async def portal_dashboard(tenant: Tenant = Depends(_get_portal_tenant)):
    return {
        "tenant": {
            "id": str(tenant.id),
            "name": f"{tenant.first_name} {tenant.last_name}",
            "email": tenant.email,
            "lease_start": str(tenant.lease_start) if tenant.lease_start else None,
            "lease_end": str(tenant.lease_end) if tenant.lease_end else None,
            "rent_amount": tenant.rent_amount,
        },
        "open_requests": len(
            [m for m in tenant.maintenance_requests if m.status in ("open", "in_progress")]
        ),
        "recent_payments": [
            {"amount": p.amount, "status": p.status, "due_date": str(p.due_date)}
            for p in sorted(tenant.rent_payments, key=lambda x: x.due_date, reverse=True)[:3]
        ],
        "documents": [
            {"id": str(d.id), "name": d.name, "category": d.category}
            for d in tenant.documents
        ],
    }


@router.post("/maintenance")
async def portal_submit_maintenance(
    data: dict,
    tenant: Tenant = Depends(_get_portal_tenant),
    db: AsyncSession = Depends(get_db),
):
    if not tenant.property_id:
        raise HTTPException(status_code=400, detail="No property linked to this tenant account")
    req = MaintenanceRequest(
        property_id=tenant.property_id,
        tenant_id=tenant.id,
        org_id=tenant.org_id,
        title=str(data.get("title", "Maintenance Request"))[:255],
        description=str(data.get("description", "")),
        priority="medium",
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return {"id": str(req.id), "status": "created", "message": "Request submitted successfully"}
