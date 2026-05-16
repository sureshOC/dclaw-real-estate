import csv
import io

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.property import Property, PropertyStatus, PropertyType
from app.models.tenant import Tenant
from app.models.user import User

router = APIRouter(prefix="/import", tags=["import"])

PROPERTY_ALIASES: dict[str, list[str]] = {
    "title": ["title", "name", "property name", "property"],
    "address": ["address", "street", "street address"],
    "city": ["city"],
    "state": ["state", "province"],
    "zip_code": ["zip", "zip_code", "zipcode", "postal", "postal code"],
    "price": ["price", "rent", "monthly rent", "monthly_rent", "amount"],
    "property_type": ["type", "property_type", "property type", "kind"],
    "bedrooms": ["beds", "bedrooms", "bedroom", "bd"],
    "bathrooms": ["baths", "bathrooms", "bathroom", "ba"],
    "square_feet": ["sqft", "square_feet", "square feet", "area", "sq ft"],
}

TENANT_ALIASES: dict[str, list[str]] = {
    "first_name": ["first_name", "first name", "firstname", "first"],
    "last_name": ["last_name", "last name", "lastname", "last"],
    "email": ["email", "email address", "e-mail"],
    "phone": ["phone", "phone number", "mobile", "cell"],
    "rent_amount": ["rent", "rent_amount", "monthly rent", "monthly_rent"],
}


def _map_row(row: dict, aliases: dict[str, list[str]]) -> dict:
    lower = {k.lower().strip(): v for k, v in row.items()}
    result: dict = {}
    for field, options in aliases.items():
        for opt in options:
            if opt in lower:
                result[field] = lower[opt]
                break
    return result


@router.post("/properties")
async def import_properties(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    created, errors = 0, []

    for i, row in enumerate(reader, start=2):
        mapped = _map_row(row, PROPERTY_ALIASES)
        if not mapped.get("title") or not mapped.get("address"):
            errors.append({"row": i, "error": "Missing required fields: title, address"})
            continue
        try:
            prop = Property(
                org_id=user.org_id,
                title=str(mapped["title"]),
                address=str(mapped["address"]),
                city=str(mapped.get("city", "")),
                state=str(mapped.get("state", "")),
                zip_code=str(mapped.get("zip_code", "")),
                price=float(mapped.get("price") or 0),
                property_type=PropertyType(mapped.get("property_type", "house")),
                bedrooms=int(mapped["bedrooms"]) if mapped.get("bedrooms") else None,
                bathrooms=float(mapped["bathrooms"]) if mapped.get("bathrooms") else None,
                square_feet=int(mapped["square_feet"]) if mapped.get("square_feet") else None,
                status=PropertyStatus.available,
            )
            db.add(prop)
            created += 1
        except Exception as e:
            errors.append({"row": i, "error": str(e)})

    await db.commit()
    return {"created": created, "error_count": len(errors), "errors": errors, "total_rows": created + len(errors)}


@router.post("/tenants")
async def import_tenants(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    created, errors = 0, []

    for i, row in enumerate(reader, start=2):
        mapped = _map_row(row, TENANT_ALIASES)
        if not mapped.get("email"):
            errors.append({"row": i, "error": "Missing required field: email"})
            continue
        existing = await db.execute(
            select(Tenant).where(Tenant.email == mapped["email"], Tenant.org_id == user.org_id)
        )
        if existing.scalar_one_or_none():
            errors.append({"row": i, "error": f"Tenant {mapped['email']} already exists"})
            continue
        try:
            tenant = Tenant(
                org_id=user.org_id,
                first_name=str(mapped.get("first_name", "")),
                last_name=str(mapped.get("last_name", "")),
                email=str(mapped["email"]),
                phone=mapped.get("phone"),
                rent_amount=float(mapped["rent_amount"]) if mapped.get("rent_amount") else None,
            )
            db.add(tenant)
            created += 1
        except Exception as e:
            errors.append({"row": i, "error": str(e)})

    await db.commit()
    return {"created": created, "error_count": len(errors), "errors": errors, "total_rows": created + len(errors)}
