from datetime import date, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.maintenance_request import MaintenanceRequest
from app.models.property import Property, PropertyStatus
from app.models.rent_payment import RentPayment
from app.models.tenant import Tenant


async def compute_health_score(org_id: UUID, db: AsyncSession) -> dict[str, Any]:
    today = date.today()

    total_props_r = await db.execute(
        select(func.count()).select_from(Property).where(Property.org_id == org_id)
    )
    total_props = total_props_r.scalar() or 0

    rented_r = await db.execute(
        select(func.count()).select_from(Property).where(
            Property.org_id == org_id, Property.status == PropertyStatus.rented
        )
    )
    rented = rented_r.scalar() or 0
    occupancy_rate = (rented / total_props * 100) if total_props else 0

    payments_r = await db.execute(
        select(RentPayment).where(RentPayment.org_id == org_id)
    )
    payments = payments_r.scalars().all()
    paid = sum(1 for p in payments if p.status == "paid")
    payment_rate = (paid / len(payments) * 100) if payments else 100

    open_maint_r = await db.execute(
        select(func.count()).select_from(MaintenanceRequest).where(
            MaintenanceRequest.org_id == org_id,
            MaintenanceRequest.status.in_(["open", "in_progress"]),
        )
    )
    open_maint = open_maint_r.scalar() or 0
    maint_score = max(0, 100 - (open_maint * 10))

    tenants_r = await db.execute(select(Tenant).where(Tenant.org_id == org_id))
    tenants = tenants_r.scalars().all()
    expiring_soon = sum(
        1 for t in tenants
        if t.lease_end and (t.lease_end - today).days <= 60
    )
    lease_score = max(0, 100 - (expiring_soon * 15))

    score = int(
        occupancy_rate * 0.30
        + payment_rate * 0.25
        + maint_score * 0.20
        + lease_score * 0.15
        + 100 * 0.10
    )
    score = min(100, max(0, score))
    grade = "A" if score >= 90 else "B" if score >= 75 else "C" if score >= 60 else "D" if score >= 45 else "F"

    breakdown = [
        {"component": "Occupancy Rate", "score": round(occupancy_rate), "weight": 30,
         "insight": f"{rented}/{total_props} units rented"},
        {"component": "On-time Payments", "score": round(payment_rate), "weight": 25,
         "insight": f"{paid}/{len(payments)} payments on time" if payments else "No payment data yet"},
        {"component": "Maintenance Backlog", "score": round(maint_score), "weight": 20,
         "insight": f"{open_maint} open requests"},
        {"component": "Lease Renewal Health", "score": round(lease_score), "weight": 15,
         "insight": f"{expiring_soon} leases expiring within 60 days"},
        {"component": "NOI Trend", "score": 100, "weight": 10,
         "insight": "Add expense data for full NOI analysis"},
    ]

    ai_summary = f"Portfolio score: {score}/100 (Grade {grade})."
    if settings.anthropic_api_key:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
            prompt = (
                f"You are a property management advisor. Write a 2-3 sentence executive summary "
                f"for a portfolio health score of {score}/100 (Grade {grade}).\n"
                f"Metrics: {occupancy_rate:.0f}% occupancy, {payment_rate:.0f}% on-time payments, "
                f"{open_maint} open maintenance requests, {expiring_soon} leases expiring soon.\n"
                "Be specific and actionable. No preamble."
            )
            msg = client.messages.create(
                model=settings.anthropic_model,
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}],
            )
            ai_summary = msg.content[0].text.strip()
        except Exception:
            pass

    top_risks: list[str] = []
    if occupancy_rate < 80:
        top_risks.append(f"Low occupancy at {occupancy_rate:.0f}% — target 95%+")
    if payment_rate < 90:
        top_risks.append(f"Payment rate at {payment_rate:.0f}% — investigate late payers")
    if open_maint > 5:
        top_risks.append(f"{open_maint} open maintenance requests need resolution")
    if expiring_soon > 0:
        top_risks.append(f"{expiring_soon} leases expiring within 60 days — begin renewal outreach")

    return {
        "score": score,
        "grade": grade,
        "breakdown": breakdown,
        "ai_summary": ai_summary,
        "top_risks": top_risks,
        "total_properties": total_props,
        "occupied": rented,
        "computed_at": datetime.utcnow().isoformat(),
    }
