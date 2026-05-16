from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # ensure all models are imported so create_all sees them
from app.core.config import settings
from app.core.database import init_db
from app.api.routes import (
    dashboard,
    documents,
    financials,
    health,
    leases,
    maintenance,
    payments,
    properties,
    reports,
    tenants,
    vendors,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.2.0",
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
