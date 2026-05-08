from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import health, properties, tenants, maintenance, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
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
