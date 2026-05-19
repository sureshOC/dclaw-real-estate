from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # ensure all models are imported so create_all sees them
from app.core.config import settings
from app.core.database import init_db
from app.core.seed import seed_demo_data
from app.api.routes import (
    ai_tools,
    auth,
    billing,
    dashboard,
    documents,
    financials,
    health,
    import_data,
    leases,
    maintenance,
    payments,
    portal,
    properties,
    reports,
    tenants,
    vendors,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_demo_data()
    yield


app = FastAPI(
    title="DClaw Real Estate — YC Edition",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(properties.router, prefix="/api/v1", tags=["properties"])
app.include_router(tenants.router, prefix="/api/v1", tags=["tenants"])
app.include_router(maintenance.router, prefix="/api/v1", tags=["maintenance"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["dashboard"])
app.include_router(payments.router, prefix="/api/v1", tags=["payments"])
app.include_router(leases.router, prefix="/api/v1", tags=["leases"])
app.include_router(vendors.router, prefix="/api/v1", tags=["vendors"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
app.include_router(financials.router, prefix="/api/v1", tags=["financials"])
app.include_router(reports.router, prefix="/api/v1", tags=["reports"])
app.include_router(billing.router, prefix="/api/v1", tags=["billing"])
app.include_router(portal.router, prefix="/api/v1", tags=["portal"])
app.include_router(import_data.router, prefix="/api/v1", tags=["import"])
app.include_router(ai_tools.router, prefix="/api/v1", tags=["ai"])
