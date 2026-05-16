from datetime import date
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.rent_payment import RentPayment
from app.repositories.base_repo import BaseRepository


class RentPaymentRepository(BaseRepository[RentPayment]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, RentPayment)

    async def list_by_tenant(self, tenant_id: UUID, month: Optional[date] = None) -> list[RentPayment]:
        query = select(RentPayment).where(RentPayment.tenant_id == tenant_id)
        if month:
            query = query.where(
                RentPayment.due_date >= date(month.year, month.month, 1)
            )
        result = await self.db.execute(query.order_by(RentPayment.due_date.desc()))
        return list(result.scalars().all())

    async def list_by_property(self, property_id: UUID) -> list[RentPayment]:
        result = await self.db.execute(
            select(RentPayment).where(RentPayment.property_id == property_id)
            .order_by(RentPayment.due_date.desc())
        )
        return list(result.scalars().all())

    async def update(self, payment: RentPayment) -> RentPayment:
        await self.db.commit()
        await self.db.refresh(payment)
        return payment
