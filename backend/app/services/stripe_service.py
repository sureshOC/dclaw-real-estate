from typing import Any

from app.core.config import settings

try:
    import stripe as _stripe
    _stripe.api_key = settings.stripe_secret_key
except ImportError:
    _stripe = None  # type: ignore

PLAN_PRICE_MAP = {
    "starter": settings.stripe_price_starter,
    "pro": settings.stripe_price_pro,
}


async def create_customer(org_name: str, email: str) -> str:
    if not _stripe or not settings.stripe_secret_key:
        return "cus_mock"
    customer = _stripe.Customer.create(name=org_name, email=email)
    return customer["id"]


async def create_subscription(customer_id: str, price_id: str) -> dict[str, Any]:
    if not _stripe or not settings.stripe_secret_key or not price_id:
        return {"id": "sub_mock", "status": "active"}
    return _stripe.Subscription.create(
        customer=customer_id,
        items=[{"price": price_id}],
        payment_behavior="default_incomplete",
        expand=["latest_invoice.payment_intent"],
    )


async def create_billing_portal(customer_id: str, return_url: str) -> str:
    if not _stripe or not settings.stripe_secret_key:
        return return_url
    session = _stripe.billing_portal.Session.create(
        customer=customer_id, return_url=return_url
    )
    return session["url"]
