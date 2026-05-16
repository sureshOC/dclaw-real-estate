import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class CommunicationType(str, enum.Enum):
    call = "call"
    email = "email"
    notice = "notice"
    note = "note"
    visit = "visit"


class CommunicationDirection(str, enum.Enum):
    inbound = "inbound"
    outbound = "outbound"


class CommunicationLog(Base):
    __tablename__ = "communication_logs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    property_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("properties.id", ondelete="SET NULL"), nullable=True
    )
    type: Mapped[CommunicationType] = mapped_column(SQLEnum(CommunicationType))
    direction: Mapped[CommunicationDirection] = mapped_column(SQLEnum(CommunicationDirection))
    summary: Mapped[str] = mapped_column(Text)
    created_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="communications", lazy="selectin")
