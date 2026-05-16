import json
from typing import Any

from app.core.config import settings
from app.models.tenant import Tenant


def _rule_based_score(tenant: Tenant) -> tuple[int, list[str]]:
    score = 100
    flags: list[str] = []

    if tenant.prior_eviction:
        score -= 40
        flags.append("Prior eviction on record")

    if tenant.income and tenant.rent_amount:
        ratio = tenant.income / tenant.rent_amount
        if ratio < 2.0:
            score -= 30
            flags.append(f"Income-to-rent ratio critically low ({ratio:.1f}x, minimum 2x)")
        elif ratio < 3.0:
            score -= 15
            flags.append(f"Income-to-rent ratio below recommended threshold ({ratio:.1f}x, target ≥3x)")
    elif not tenant.income:
        score -= 10
        flags.append("Income not provided")

    return max(score, 0), flags


def _tier(score: int) -> str:
    if score >= 75:
        return "low"
    if score >= 45:
        return "medium"
    return "high"


async def run_screening(tenant: Tenant) -> dict[str, Any]:
    score, flags = _rule_based_score(tenant)
    tier = _tier(score)

    if not settings.anthropic_api_key:
        recommendation = (
            f"Score {score}/100 — {tier} risk. "
            + (f"Flags: {'; '.join(flags)}." if flags else "No major risk flags identified.")
        )
        return {"score": score, "tier": tier, "flags": flags, "recommendation": recommendation}

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        prompt = (
            f"Tenant screening report for {tenant.first_name} {tenant.last_name}.\n"
            f"- Monthly rent: ${tenant.rent_amount}\n"
            f"- Monthly income: ${tenant.income if tenant.income else 'not provided'}\n"
            f"- Prior eviction: {'Yes' if tenant.prior_eviction else 'No'}\n"
            f"- Rule-based score: {score}/100 ({tier} risk)\n"
            f"- Flags: {'; '.join(flags) if flags else 'None'}\n\n"
            "Write a concise 2-3 sentence professional screening recommendation for a property manager. "
            "Be direct and factual."
        )
        message = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=256,
            messages=[{"role": "user", "content": prompt}],
        )
        recommendation = message.content[0].text.strip()
    except Exception:
        recommendation = (
            f"Score {score}/100 — {tier} risk. "
            + (f"Flags: {'; '.join(flags)}." if flags else "No major risk flags identified.")
        )

    return {"score": score, "tier": tier, "flags": flags, "recommendation": recommendation}
