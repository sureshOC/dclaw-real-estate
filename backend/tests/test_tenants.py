import pytest
from uuid import uuid4


async def create_property(client):
    resp = await client.post("/api/v1/properties/", json={
        "title": "Tenant House",
        "address": "100 T St",
        "city": "T City",
        "state": "CA",
        "zip_code": "90000",
        "price": 300000,
        "property_type": "house",
        "status": "available",
    })
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_create_tenant(client):
    prop_id = await create_property(client)
    payload = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "555-1234",
        "property_id": prop_id,
        "lease_start": "2024-01-01",
        "lease_end": "2024-12-31",
        "rent_amount": 1500.0,
    }
    response = await client.post("/api/v1/tenants/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "John"
    assert data["property_id"] == prop_id


@pytest.mark.asyncio
async def test_list_tenants(client):
    prop_id = await create_property(client)
    await client.post("/api/v1/tenants/", json={
        "first_name": "A",
        "last_name": "B",
        "email": "a@example.com",
        "property_id": prop_id,
    })
    await client.post("/api/v1/tenants/", json={
        "first_name": "C",
        "last_name": "D",
        "email": "c@example.com",
        "property_id": prop_id,
    })
    response = await client.get("/api/v1/tenants/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_list_tenants_by_property(client):
    prop_id = await create_property(client)
    await client.post("/api/v1/tenants/", json={
        "first_name": "E",
        "last_name": "F",
        "email": "e@example.com",
        "property_id": prop_id,
    })
    response = await client.get(f"/api/v1/tenants/?property_id={prop_id}")
    assert response.status_code == 200
    data = response.json()
    assert all(t["property_id"] == prop_id for t in data)


@pytest.mark.asyncio
async def test_get_tenant(client):
    prop_id = await create_property(client)
    create_resp = await client.post("/api/v1/tenants/", json={
        "first_name": "G",
        "last_name": "H",
        "email": "g@example.com",
        "property_id": prop_id,
    })
    tenant_id = create_resp.json()["id"]
    response = await client.get(f"/api/v1/tenants/{tenant_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == tenant_id


@pytest.mark.asyncio
async def test_get_tenant_not_found(client):
    response = await client.get(f"/api/v1/tenants/{uuid4()}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_tenant(client):
    prop_id = await create_property(client)
    create_resp = await client.post("/api/v1/tenants/", json={
        "first_name": "I",
        "last_name": "J",
        "email": "i@example.com",
        "property_id": prop_id,
        "rent_amount": 1000.0,
    })
    tenant_id = create_resp.json()["id"]
    response = await client.put(f"/api/v1/tenants/{tenant_id}", json={"rent_amount": 1200.0})
    assert response.status_code == 200
    data = response.json()
    assert data["rent_amount"] == 1200.0


@pytest.mark.asyncio
async def test_delete_tenant(client):
    prop_id = await create_property(client)
    create_resp = await client.post("/api/v1/tenants/", json={
        "first_name": "K",
        "last_name": "L",
        "email": "k@example.com",
        "property_id": prop_id,
    })
    tenant_id = create_resp.json()["id"]
    del_resp = await client.delete(f"/api/v1/tenants/{tenant_id}")
    assert del_resp.status_code == 204
    get_resp = await client.get(f"/api/v1/tenants/{tenant_id}")
    assert get_resp.status_code == 404
