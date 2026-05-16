from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.expense import ExpenseCategory


class ExpenseCreate(BaseModel):
    property_id: UUID
    category: ExpenseCategory
    amount: float
    expense_date: date
    description: Optional[str] = None
    recurring: bool = False


class ExpenseUpdate(BaseModel):
    category: Optional[ExpenseCategory] = None
    amount: Optional[float] = None
    expense_date: Optional[date] = None
    description: Optional[str] = None
    recurring: Optional[bool] = None


class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    property_id: UUID
    category: ExpenseCategory
    amount: float
    expense_date: date
    description: Optional[str]
    recurring: bool
    created_at: datetime
