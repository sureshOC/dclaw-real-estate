from sqlalchemy.ext.asyncio import AsyncSession

from app.models.maintenance_request import MaintenanceRequest
from app.repositories.base_repo import BaseRepository


class MaintenanceRepository(BaseRepository[MaintenanceRequest]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, MaintenanceRequest)
