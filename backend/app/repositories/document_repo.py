from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document
from app.repositories.base_repo import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Document)

    async def list_by_property(self, property_id: UUID, tenant_id: Optional[UUID] = None) -> list[Document]:
        query = select(Document).where(Document.property_id == property_id)
        if tenant_id:
            query = query.where(Document.tenant_id == tenant_id)
        result = await self.db.execute(query.order_by(Document.uploaded_at.desc()))
        return list(result.scalars().all())
