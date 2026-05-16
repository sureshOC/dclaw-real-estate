import os
import uuid
from pathlib import Path
from typing import Optional
from uuid import UUID

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.document import Document, DocumentCategory
from app.repositories.document_repo import DocumentRepository
from app.schemas.document import DocumentRead

router = APIRouter(prefix="/documents", tags=["documents"])


def _upload_dir() -> Path:
    path = Path(settings.upload_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path


@router.get("/", response_model=list[DocumentRead])
async def list_documents(
    property_id: Optional[UUID] = Query(None),
    tenant_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    repo = DocumentRepository(db)
    if property_id:
        return await repo.list_by_property(property_id, tenant_id)
    items, _ = await repo.list_all(limit=100)
    return items


@router.post("/upload", response_model=DocumentRead, status_code=201)
async def upload_document(
    property_id: UUID = Form(...),
    tenant_id: Optional[UUID] = Form(None),
    category: DocumentCategory = Form(DocumentCategory.other),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if file.size and file.size > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="File exceeds maximum upload size")

    upload_dir = _upload_dir()
    file_key = f"{uuid.uuid4()}_{file.filename}"
    dest = upload_dir / file_key

    content = await file.read()
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="File exceeds maximum upload size")

    async with aiofiles.open(dest, "wb") as f:
        await f.write(content)

    repo = DocumentRepository(db)
    doc = Document(
        property_id=property_id,
        tenant_id=tenant_id,
        name=file.filename or file_key,
        file_key=file_key,
        file_size=len(content),
        mime_type=file.content_type,
        category=category,
    )
    return await repo.create(doc)


@router.get("/{doc_id}/download")
async def download_document(doc_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = _upload_dir() / doc.file_key
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=str(file_path),
        filename=doc.name,
        media_type=doc.mime_type or "application/octet-stream",
    )


@router.delete("/{doc_id}", status_code=204)
async def delete_document(doc_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = _upload_dir() / doc.file_key
    if file_path.exists():
        file_path.unlink()

    await repo.delete(doc)
