from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user, require_roles
from app.core.config import settings
from app.core.database import get_db
from app.models.org import Organization, PlanTier
from app.models.user import User, UserRole
from app.services.stripe_service import (
    PLAN_PRICE_MAP,
    create_billing_portal,
    create_customer,
    create_subscription,
)

router = APIRouter(prefix="/billing", tags=["billing"])

PLAN_LIMITS = {"free": 3, "starter": 20, "pro": 100, "enterprise": 9999}
PLAN_PRICES = {"free": 0, "starter": 49, "pro": 99, "enterprise": 0}


class SubscribeRequest(BaseModel):
    plan: str


class BillingStatusResponse(BaseModel):
    plan_tier: str
    unit_limit: int
    monthly_price: int
    stripe_customer_id: str | None
    stripe_subscription_id: str | None


@router.get("/status", response_model=BillingStatusResponse)
async def billing_status(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Organization).where(Organization.id == user.org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return BillingStatusResponse(
        plan_tier=org.plan_tier,
        unit_limit=PLAN_LIMITS.get(org.plan_tier, 3),
        monthly_price=PLAN_PRICES.get(org.plan_tier, 0),
        stripe_customer_id=org.stripe_customer_id,
        stripe_subscription_id=org.stripe_subscription_id,
    )


@router.post("/subscribe")
async def subscribe(
    data: SubscribeRequest,
    user: User = Depends(require_roles(UserRole.owner)),
    db: AsyncSession = Depends(get_db),
):
    if data.plan not in PLAN_PRICE_MAP:
        raise HTTPException(status_code=400, detail="Invalid plan. Choose: starter, pro")
    result = await db.execute(select(Organization).where(Organization.id == user.org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if not org.stripe_customer_id:
        org.stripe_customer_id = await create_customer(org.name, user.email)

    price_id = PLAN_PRICE_MAP.get(data.plan, "")
    if price_id:
        sub = await create_subscription(org.stripe_customer_id, price_id)
        org.stripe_subscription_id = sub["id"]

    org.plan_tier = PlanTier(data.plan)
    await db.commit()
    return {"status": "subscribed", "plan": data.plan, "monthly_price": PLAN_PRICES[data.plan]}


@router.post("/portal")
async def billing_portal(
    user: User = Depends(require_roles(UserRole.owner)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Organization).where(Organization.id == user.org_id))
    org = result.scalar_one_or_none()
    if not org or not org.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account. Subscribe first.")
    url = await create_billing_portal(
        org.stripe_customer_id, f"{settings.frontend_url}/billing"
    )
    return {"url": url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        import stripe as _stripe
        event = _stripe.Webhook.construct_event(body, sig, settings.stripe_webhook_secret)
    except Exception:
        return {"status": "ignored"}

    if event["type"] == "customer.subscription.deleted":
        customer_id = event["data"]["object"]["customer"]
        result = await db.execute(
            select(Organization).where(Organization.stripe_customer_id == customer_id)
        )
        org = result.scalar_one_or_none()
        if org:
            org.plan_tier = PlanTier.free
            org.stripe_subscription_id = None
            await db.commit()

    return {"status": "ok"}
