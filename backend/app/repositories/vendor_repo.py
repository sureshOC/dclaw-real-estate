from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vendor import Vendor
from app.repositories.base_repo import BaseRepository


class VendorRepository(BaseRepository[Vendor]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Vendor)

    async def update(self, vendor: Vendor) -> Vendor:
        await self.db.commit()
        await self.db.refresh(vendor)
        return vendor
