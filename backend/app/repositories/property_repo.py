from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import Property
from app.repositories.base_repo import BaseRepository


class PropertyRepository(BaseRepository[Property]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Property)
