import pytest
from uuid import uuid4


async def create_property(client):
    resp = await client.post("/api/v1/properties/", json={
        "title": "Maint House",
        "address": "200 M St",
        "city": "M City",
        "state": "CA",
        "zip_code": "90000",
        "price": 300000,
        "property_type": "house",
        "status": "available",
    })
    return resp.json()["id"]


async def create_tenant(client, property_id):
    resp = await client.post("/api/v1/tenants/", json={
        "first_name": "Maint",
        "last_name": "Tenant",
        "email": f"maint{property_id}@example.com",
        "property_id": property_id,
    })
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_create_maintenance_request(client):
    prop_id = await create_property(client)
    payload = {
        "property_id": prop_id,
        "title": "Leaky faucet",
        "description": "The kitchen faucet is leaking.",
        "priority": "high",
        "status": "open",
    }
    response = await client.post("/api/v1/maintenance/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Leaky faucet"
    assert data["property_id"] == prop_id


@pytest.mark.asyncio
async def test_list_maintenance_requests(client):
    prop_id = await create_property(client)
    await client.post("/api/v1/maintenance/", json={
        "property_id": prop_id,
        "title": "A",
        "description": "Desc A",
        "priority": "low",
        "status": "open",
    })
    await client.post("/api/v1/maintenance/", json={
        "property_id": prop_id,
        "title": "B",
        "description": "Desc B",
        "priority": "medium",
        "status": "in_progress",
    })
    response = await client.get("/api/v1/maintenance/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_list_maintenance_filter_by_property(client):
    prop_id = await create_property(client)
    await client.post("/api/v1/maintenance/", json={
        "property_id": prop_id,
        "title": "C",
        "description": "Desc C",
        "priority": "emergency",
        "status": "open",
    })
    response = await client.get(f"/api/v1/maintenance/?property_id={prop_id}")
    assert response.status_code == 200
    data = response.json()
    assert all(m["property_id"] == prop_id for m in data)


@pytest.mark.asyncio
async def test_list_maintenance_filter_by_priority(client):
    prop_id = await create_property(client)
    await client.post("/api/v1/maintenance/", json={
        "property_id": prop_id,
        "title": "D",
        "description": "Desc D",
        "priority": "high",
        "status": "open",
    })
    response = await client.get("/api/v1/maintenance/?priority=high")
    assert response.status_code == 200
    data = response.json()
    assert all(m["priority"] == "high" for m in data)


@pytest.mark.asyncio
async def test_list_maintenance_filter_by_status(client):
    prop_id = await create_property(client)
    await client.post("/api/v1/maintenance/", json={
        "property_id": prop_id,
        "title": "E",
        "description": "Desc E",
        "priority": "low",
        "status": "resolved",
    })
    response = await client.get("/api/v1/maintenance/?status=resolved")
    assert response.status_code == 200
    data = response.json()
    assert all(m["status"] == "resolved" for m in data)


@pytest.mark.asyncio
async def test_get_maintenance_request(client):
    prop_id = await create_property(client)
    create_resp = await client.post("/api/v1/maintenance/", json={
        "property_id": prop_id,
        "title": "F",
        "description": "Desc F",
        "priority": "medium",
        "status": "open",
    })
    req_id = create_resp.json()["id"]
    response = await client.get(f"/api/v1/maintenance/{req_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == req_id


@pytest.mark.asyncio
async def test_get_maintenance_request_not_found(client):
    response = await client.get(f"/api/v1/maintenance/{uuid4()}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_maintenance_request(client):
    prop_id = await create_property(client)
    create_resp = await client.post("/api/v1/maintenance/", json={
        "property_id": prop_id,
        "title": "G",
        "description": "Desc G",
        "priority": "low",
        "status": "open",
    })
    req_id = create_resp.json()["id"]
    response = await client.put(f"/api/v1/maintenance/{req_id}", json={"status": "in_progress"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "in_progress"


@pytest.mark.asyncio
async def test_delete_maintenance_request(client):
    prop_id = await create_property(client)
    create_resp = await client.post("/api/v1/maintenance/", json={
        "property_id": prop_id,
        "title": "H",
        "description": "Desc H",
        "priority": "low",
        "status": "open",
    })
    req_id = create_resp.json()["id"]
    del_resp = await client.delete(f"/api/v1/maintenance/{req_id}")
    assert del_resp.status_code == 204
    get_resp = await client.get(f"/api/v1/maintenance/{req_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_create_maintenance_with_tenant(client):
    prop_id = await create_property(client)
    tenant_id = await create_tenant(client, prop_id)
    payload = {
        "property_id": prop_id,
        "tenant_id": tenant_id,
        "title": "Broken window",
        "description": "Window is cracked.",
        "priority": "high",
        "status": "open",
    }
    response = await client.post("/api/v1/maintenance/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["tenant_id"] == tenant_id
