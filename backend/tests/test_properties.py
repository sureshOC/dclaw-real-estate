import pytest
from uuid import uuid4


@pytest.mark.asyncio
async def test_create_property(client):
    payload = {
        "title": "Test House",
        "address": "123 Main St",
        "city": "Springfield",
        "state": "IL",
        "zip_code": "62701",
        "price": 250000.0,
        "property_type": "house",
        "bedrooms": 3,
        "bathrooms": 2.5,
        "square_feet": 2000,
        "status": "available",
        "description": "Nice house",
    }
    response = await client.post("/api/v1/properties/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["id"] is not None


@pytest.mark.asyncio
async def test_list_properties(client):
    await client.post("/api/v1/properties/", json={
        "title": "A",
        "address": "1 A St",
        "city": "A City",
        "state": "CA",
        "zip_code": "90001",
        "price": 100000,
        "property_type": "apartment",
        "status": "available",
    })
    await client.post("/api/v1/properties/", json={
        "title": "B",
        "address": "2 B St",
        "city": "B City",
        "state": "NY",
        "zip_code": "10001",
        "price": 200000,
        "property_type": "house",
        "status": "rented",
    })
    response = await client.get("/api/v1/properties/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_list_properties_filter_by_type(client):
    await client.post("/api/v1/properties/", json={
        "title": "C",
        "address": "3 C St",
        "city": "C City",
        "state": "TX",
        "zip_code": "75001",
        "price": 150000,
        "property_type": "condo",
        "status": "available",
    })
    response = await client.get("/api/v1/properties/?property_type=condo")
    assert response.status_code == 200
    data = response.json()
    assert all(p["property_type"] == "condo" for p in data)


@pytest.mark.asyncio
async def test_list_properties_filter_by_status(client):
    await client.post("/api/v1/properties/", json={
        "title": "D",
        "address": "4 D St",
        "city": "D City",
        "state": "FL",
        "zip_code": "33001",
        "price": 300000,
        "property_type": "commercial",
        "status": "sold",
    })
    response = await client.get("/api/v1/properties/?status=sold")
    assert response.status_code == 200
    data = response.json()
    assert all(p["status"] == "sold" for p in data)


@pytest.mark.asyncio
async def test_get_property(client):
    create_resp = await client.post("/api/v1/properties/", json={
        "title": "E",
        "address": "5 E St",
        "city": "E City",
        "state": "WA",
        "zip_code": "98001",
        "price": 400000,
        "property_type": "land",
        "status": "pending",
    })
    prop_id = create_resp.json()["id"]
    response = await client.get(f"/api/v1/properties/{prop_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == prop_id
    assert data["title"] == "E"


@pytest.mark.asyncio
async def test_get_property_not_found(client):
    response = await client.get(f"/api/v1/properties/{uuid4()}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_property(client):
    create_resp = await client.post("/api/v1/properties/", json={
        "title": "F",
        "address": "6 F St",
        "city": "F City",
        "state": "OR",
        "zip_code": "97001",
        "price": 500000,
        "property_type": "house",
        "status": "available",
    })
    prop_id = create_resp.json()["id"]
    response = await client.put(f"/api/v1/properties/{prop_id}", json={"price": 550000})
    assert response.status_code == 200
    data = response.json()
    assert data["price"] == 550000
    assert data["title"] == "F"


@pytest.mark.asyncio
async def test_delete_property(client):
    create_resp = await client.post("/api/v1/properties/", json={
        "title": "G",
        "address": "7 G St",
        "city": "G City",
        "state": "NV",
        "zip_code": "89001",
        "price": 600000,
        "property_type": "apartment",
        "status": "available",
    })
    prop_id = create_resp.json()["id"]
    del_resp = await client.delete(f"/api/v1/properties/{prop_id}")
    assert del_resp.status_code == 204
    get_resp = await client.get(f"/api/v1/properties/{prop_id}")
    assert get_resp.status_code == 404
