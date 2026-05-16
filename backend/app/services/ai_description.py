from app.core.config import settings
from app.models.property import Property


async def generate_property_description(prop: Property) -> str:
    prompt = (
        f"Write a 2-3 sentence professional marketing description for this rental property.\n"
        f"- Title: {prop.title}\n"
        f"- Address: {prop.address}, {prop.city}, {prop.state}\n"
        f"- Type: {prop.property_type.value}\n"
        f"- Bedrooms: {prop.bedrooms or 'N/A'}, Bathrooms: {prop.bathrooms or 'N/A'}\n"
        f"- Square feet: {prop.square_feet or 'N/A'}\n"
        f"- Price: ${prop.price:,.0f}\n"
        f"- Status: {prop.status.value}\n\n"
        "Write compelling, SEO-friendly copy. Use professional tone. No filler phrases. "
        "Output only the description text."
    )

    if not settings.anthropic_api_key:
        beds = f"{prop.bedrooms}BR" if prop.bedrooms else ""
        baths = f"{prop.bathrooms}BA" if prop.bathrooms else ""
        return (
            f"Welcome to this charming {prop.property_type.value} in {prop.city}, {prop.state}. "
            + (f"Featuring {beds}/{baths}" if beds or baths else "")
            + (f" and {prop.square_feet:,} sq ft of living space" if prop.square_feet else "")
            + f", priced at ${prop.price:,.0f}. Contact us today to schedule a viewing."
        )

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        message = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()
    except Exception:
        return (
            f"Beautiful {prop.property_type.value} located at {prop.address}, {prop.city}. "
            f"Priced at ${prop.price:,.0f}."
        )
