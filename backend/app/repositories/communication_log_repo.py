from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.communication_log import CommunicationLog
from app.repositories.base_repo import BaseRepository


class CommunicationLogRepository(BaseRepository[CommunicationLog]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, CommunicationLog)

    async def list_by_tenant(self, tenant_id: UUID) -> list[CommunicationLog]:
        result = await self.db.execute(
            select(CommunicationLog).where(CommunicationLog.tenant_id == tenant_id)
            .order_by(CommunicationLog.created_at.desc())
        )
        return list(result.scalars().all())
