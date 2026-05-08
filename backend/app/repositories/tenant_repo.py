from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tenant import Tenant
from app.repositories.base_repo import BaseRepository


class TenantRepository(BaseRepository[Tenant]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Tenant)
