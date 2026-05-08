import pytest


@pytest.mark.asyncio
async def test_dashboard_stats(client):
    # Create a property
    await client.post("/api/v1/properties/", json={
        "title": "Dash House",
        "address": "300 D St",
        "city": "D City",
        "state": "CA",
        "zip_code": "90000",
        "price": 300000,
        "property_type": "house",
        "status": "available",
    })
    # Create a rented property
    prop_resp = await client.post("/api/v1/properties/", json={
        "title": "Dash Apt",
        "address": "301 D St",
        "city": "D City",
        "state": "CA",
        "zip_code": "90001",
        "price": 200000,
        "property_type": "apartment",
        "status": "rented",
    })
    prop_id = prop_resp.json()["id"]
    # Create a maintenance request
    await client.post("/api/v1/maintenance/", json={
        "property_id": prop_id,
        "title": "Issue",
        "description": "Something broke",
        "priority": "medium",
        "status": "open",
    })

    response = await client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_properties"] >= 2
    assert data["occupied"] >= 1
    assert data["vacant"] >= 1
    assert data["open_maintenance"] >= 1
