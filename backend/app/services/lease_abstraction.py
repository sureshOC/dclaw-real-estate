import io
import json
from typing import Any

from app.core.config import settings

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None  # type: ignore


def extract_pdf_text(file_bytes: bytes) -> str:
    if not PdfReader:
        return ""
    reader = PdfReader(io.BytesIO(file_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


async def abstract_lease(pdf_text: str) -> dict[str, Any]:
    empty = {
        "tenant_name": None, "landlord_name": None, "rent_amount": None,
        "deposit": None, "lease_start": None, "lease_end": None,
        "notice_days": None, "pet_policy": None, "late_fee_clause": None,
        "renewal_terms": None, "key_clauses": [],
    }

    if not settings.anthropic_api_key:
        return {**empty, "error": "Anthropic API key not configured"}

    if not pdf_text.strip():
        return {**empty, "error": "No text extracted from PDF"}

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        prompt = (
            "Extract structured data from this lease agreement. Return a JSON object with these exact keys:\n"
            "tenant_name (string), landlord_name (string), rent_amount (number or null),\n"
            "deposit (number or null), lease_start (YYYY-MM-DD or null), lease_end (YYYY-MM-DD or null),\n"
            "notice_days (number or null), pet_policy (string), late_fee_clause (string),\n"
            "renewal_terms (string), key_clauses (array of strings).\n"
            "Return ONLY valid JSON. No markdown, no explanation.\n\n"
            f"LEASE TEXT:\n{pdf_text[:8000]}"
        )
        msg = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        text = msg.content[0].text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
        return json.loads(text)
    except Exception as e:
        return {**empty, "error": str(e)}
