from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.expense import Expense, ExpenseCategory
from app.models.property import Property
from app.models.rent_payment import RentPayment, PaymentStatus
from app.models.tenant import Tenant
from app.repositories.expense_repo import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseRead, ExpenseUpdate

router = APIRouter(prefix="/financials", tags=["financials"])


@router.get("/properties/{property_id}")
async def get_property_financials(
    property_id: UUID,
    year: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    prop_result = await db.execute(select(Property).where(Property.id == property_id))
    prop = prop_result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    target_year = year or date.today().year

    income_query = select(func.coalesce(func.sum(RentPayment.paid_amount), 0)).where(
        RentPayment.property_id == property_id,
        RentPayment.status == PaymentStatus.paid,
        extract("year", RentPayment.paid_date) == target_year,
    )
    income_result = await db.execute(income_query)
    gross_income = float(income_result.scalar() or 0)

    expense_rows = await db.execute(
        select(Expense.category, func.sum(Expense.amount))
        .where(
            Expense.property_id == property_id,
            extract("year", Expense.expense_date) == target_year,
        )
        .group_by(Expense.category)
    )
    expenses_by_category = {row[0].value: float(row[1]) for row in expense_rows}
    total_expenses = sum(expenses_by_category.values())

    noi = gross_income - total_expenses
    cap_rate = (noi / prop.price * 100) if prop.price > 0 else 0

    tenant_count = await db.execute(
        select(func.count()).select_from(Tenant).where(Tenant.property_id == property_id)
    )
    occupied = (tenant_count.scalar() or 0) > 0

    return {
        "property_id": str(property_id),
        "year": target_year,
        "gross_rent_income": gross_income,
        "expenses_by_category": expenses_by_category,
        "total_expenses": total_expenses,
        "noi": noi,
        "cap_rate": round(cap_rate, 2),
        "occupancy_rate": 100.0 if occupied else 0.0,
        "property_value": prop.price,
    }


@router.get("/portfolio")
async def get_portfolio_financials(
    year: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    target_year = year or date.today().year

    income_result = await db.execute(
        select(func.coalesce(func.sum(RentPayment.paid_amount), 0)).where(
            RentPayment.status == PaymentStatus.paid,
            extract("year", RentPayment.paid_date) == target_year,
        )
    )
    gross_income = float(income_result.scalar() or 0)

    expense_result = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            extract("year", Expense.expense_date) == target_year
        )
    )
    total_expenses = float(expense_result.scalar() or 0)

    props_result = await db.execute(select(func.count(), func.coalesce(func.sum(Property.price), 0)).select_from(Property))
    row = props_result.one()
    total_props = row[0]
    total_value = float(row[1])

    noi = gross_income - total_expenses
    cap_rate = (noi / total_value * 100) if total_value > 0 else 0

    return {
        "year": target_year,
        "total_properties": total_props,
        "gross_rent_income": gross_income,
        "total_expenses": total_expenses,
        "noi": noi,
        "cap_rate": round(cap_rate, 2),
        "total_portfolio_value": total_value,
    }


@router.post("/expenses", response_model=ExpenseRead, status_code=201)
async def create_expense(data: ExpenseCreate, db: AsyncSession = Depends(get_db)):
    from app.models.expense import Expense as ExpenseModel
    repo = ExpenseRepository(db)
    expense = ExpenseModel(**data.model_dump())
    return await repo.create(expense)


@router.get("/expenses", response_model=list[ExpenseRead])
async def list_expenses(
    property_id: Optional[UUID] = Query(None),
    year: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    repo = ExpenseRepository(db)
    if property_id:
        return await repo.list_by_property(property_id, year)
    items, _ = await repo.list_all(limit=100)
    return items


@router.put("/expenses/{expense_id}", response_model=ExpenseRead)
async def update_expense(
    expense_id: UUID, data: ExpenseUpdate, db: AsyncSession = Depends(get_db)
):
    repo = ExpenseRepository(db)
    expense = await repo.get_by_id(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, key, value)
    return await repo.update(expense)


@router.delete("/expenses/{expense_id}", status_code=204)
async def delete_expense(expense_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = ExpenseRepository(db)
    expense = await repo.get_by_id(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    await repo.delete(expense)
