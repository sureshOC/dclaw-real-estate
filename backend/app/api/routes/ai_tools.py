from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.auto_dispatch import auto_dispatch
from app.services.health_score import compute_health_score
from app.services.nl_query import run_nl_query

router = APIRouter(prefix="/ai", tags=["ai"])


class NLQueryRequest(BaseModel):
    question: str


class DispatchRequest(BaseModel):
    request_id: UUID


@router.post("/query")
async def nl_query(
    data: NLQueryRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not data.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    return await run_nl_query(data.question, user.org_id, db)


@router.get("/health-score")
async def health_score(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await compute_health_score(user.org_id, db)


@router.post("/dispatch")
async def dispatch_maintenance(
    data: DispatchRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await auto_dispatch(data.request_id, user.org_id, db)
