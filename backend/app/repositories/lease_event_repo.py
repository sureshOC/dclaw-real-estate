from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lease_event import LeaseEvent
from app.repositories.base_repo import BaseRepository


class LeaseEventRepository(BaseRepository[LeaseEvent]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, LeaseEvent)

    async def list_by_tenant(self, tenant_id: UUID) -> list[LeaseEvent]:
        result = await self.db.execute(
            select(LeaseEvent).where(LeaseEvent.tenant_id == tenant_id)
            .order_by(LeaseEvent.created_at.desc())
        )
        return list(result.scalars().all())
