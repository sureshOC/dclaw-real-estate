from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.expense import Expense
from app.repositories.base_repo import BaseRepository


class ExpenseRepository(BaseRepository[Expense]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Expense)

    async def list_by_property(self, property_id: UUID, year: int | None = None) -> list[Expense]:
        query = select(Expense).where(Expense.property_id == property_id)
        if year:
            from sqlalchemy import extract
            query = query.where(extract("year", Expense.expense_date) == year)
        result = await self.db.execute(query.order_by(Expense.expense_date.desc()))
        return list(result.scalars().all())

    async def update(self, expense: Expense) -> Expense:
        await self.db.commit()
        await self.db.refresh(expense)
        return expense
