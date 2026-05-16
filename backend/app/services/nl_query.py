from datetime import date, timedelta
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.maintenance_request import MaintenanceRequest
from app.models.property import Property
from app.models.rent_payment import RentPayment
from app.models.tenant import Tenant


async def run_nl_query(question: str, org_id: UUID, db: AsyncSession) -> dict[str, Any]:
    q = question.lower()
    results: list[Any] = []
    query_interpreted = question
    followups = [
        "Late rent this month",
        "Leases expiring in 60 days",
        "Properties with open maintenance requests",
        "Vacant properties",
    ]

    if any(w in q for w in ["late", "overdue", "unpaid", "missed"]):
        query_interpreted = "Tenants with late or unpaid rent payments"
        r = await db.execute(
            select(RentPayment).where(
                RentPayment.org_id == org_id,
                RentPayment.status.in_(["late", "pending"]),
            )
        )
        results = [
            {"type": "payment", "tenant_id": str(p.tenant_id), "amount": p.amount,
             "status": p.status, "due_date": str(p.due_date)}
            for p in r.scalars().all()
        ]
        followups = ["Apply late fees to overdue payments", "Show payment history by tenant", "Email late tenants"]

    elif any(w in q for w in ["expir", "renew", "lease end", "ending"]):
        days = 90
        for token in ["30", "60", "90"]:
            if token in q:
                days = int(token)
                break
        query_interpreted = f"Leases expiring within {days} days"
        cutoff = date.today() + timedelta(days=days)
        r = await db.execute(
            select(Tenant).where(
                Tenant.org_id == org_id,
                Tenant.lease_end <= cutoff,
                Tenant.lease_end >= date.today(),
            )
        )
        results = [
            {"type": "tenant", "id": str(t.id),
             "name": f"{t.first_name} {t.last_name}",
             "lease_end": str(t.lease_end), "rent_amount": t.rent_amount}
            for t in r.scalars().all()
        ]
        followups = [f"Send renewal notices ({days}d)", "Show lease history", "Renew all expiring leases"]

    elif any(w in q for w in ["mainten", "repair", "open request", "issue", "broken"]):
        query_interpreted = "Open maintenance requests"
        r = await db.execute(
            select(MaintenanceRequest).where(
                MaintenanceRequest.org_id == org_id,
                MaintenanceRequest.status.in_(["open", "in_progress"]),
            )
        )
        results = [
            {"type": "maintenance", "id": str(m.id), "title": m.title,
             "priority": m.priority, "status": m.status}
            for m in r.scalars().all()
        ]
        followups = ["Assign vendors to open requests", "Show emergency requests only", "Auto-dispatch vendors"]

    elif any(w in q for w in ["vacan", "empty", "available", "unoccup"]):
        query_interpreted = "Vacant / available properties"
        r = await db.execute(
            select(Property).where(
                Property.org_id == org_id, Property.status == "available"
            )
        )
        results = [
            {"type": "property", "id": str(p.id), "title": p.title,
             "city": p.city, "price": p.price}
            for p in r.scalars().all()
        ]
        followups = ["Generate listing descriptions", "Show vacancy cost", "Compare to market comps"]

    elif any(w in q for w in ["tenant", "renter", "occupant", "resident"]):
        query_interpreted = "All tenants"
        r = await db.execute(select(Tenant).where(Tenant.org_id == org_id))
        results = [
            {"type": "tenant", "id": str(t.id),
             "name": f"{t.first_name} {t.last_name}",
             "email": t.email, "rent_amount": t.rent_amount}
            for t in r.scalars().all()
        ]

    elif any(w in q for w in ["propert", "unit", "building", "portfolio"]):
        query_interpreted = "All properties"
        r = await db.execute(select(Property).where(Property.org_id == org_id))
        results = [
            {"type": "property", "id": str(p.id), "title": p.title,
             "city": p.city, "status": p.status, "price": p.price}
            for p in r.scalars().all()
        ]

    else:
        # Claude fallback for ambiguous queries
        query_interpreted = f"Searching for: {question}"
        if settings.anthropic_api_key:
            try:
                import anthropic
                client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
                prompt = (
                    f"A property manager asked: '{question}'\n"
                    "Classify as one of: tenants, properties, maintenance, payments, leases, unknown.\n"
                    "Reply with just the single word category."
                )
                msg = client.messages.create(
                    model=settings.anthropic_model,
                    max_tokens=10,
                    messages=[{"role": "user", "content": prompt}],
                )
                category = msg.content[0].text.strip().lower()
                query_interpreted = f"Interpreted as {category} query — showing all {category}"
            except Exception:
                pass

    return {
        "query_interpreted": query_interpreted,
        "results": results,
        "result_count": len(results),
        "suggested_followups": followups,
    }
