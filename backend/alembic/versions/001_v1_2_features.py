"""v1.2 feature tables: vendors, rent_payments, lease_events, expenses, documents, communication_logs + column additions

Revision ID: 001_v1_2_features
Revises:
Create Date: 2026-05-15
"""
from alembic import op
import sqlalchemy as sa

revision = "001_v1_2_features"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # vendors (must be before maintenance_requests FK)
    op.create_table(
        "vendors",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("specialty", sa.String(50), nullable=False),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("rating", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )

    # Add new columns to tenants
    op.add_column("tenants", sa.Column("income", sa.Float(), nullable=True))
    op.add_column("tenants", sa.Column("prior_eviction", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("tenants", sa.Column("screening_score", sa.Integer(), nullable=True))
    op.add_column("tenants", sa.Column("screening_tier", sa.String(20), nullable=True))
    op.add_column("tenants", sa.Column("screening_notes", sa.Text(), nullable=True))
    op.add_column("tenants", sa.Column("screened_at", sa.DateTime(), nullable=True))

    # Add new columns to properties
    op.add_column("properties", sa.Column("ai_description", sa.Text(), nullable=True))

    # Add new columns to maintenance_requests
    op.add_column("maintenance_requests", sa.Column("vendor_id", sa.UUID(), sa.ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True))
    op.add_column("maintenance_requests", sa.Column("assigned_at", sa.DateTime(), nullable=True))
    op.add_column("maintenance_requests", sa.Column("resolved_at", sa.DateTime(), nullable=True))
    op.add_column("maintenance_requests", sa.Column("vendor_rating", sa.Float(), nullable=True))

    # rent_payments
    op.create_table(
        "rent_payments",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("tenant_id", sa.UUID(), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("property_id", sa.UUID(), sa.ForeignKey("properties.id", ondelete="CASCADE"), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("paid_amount", sa.Float(), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("paid_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("method", sa.String(30), nullable=True),
        sa.Column("late_fee", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    # lease_events
    op.create_table(
        "lease_events",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("tenant_id", sa.UUID(), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(30), nullable=False),
        sa.Column("effective_date", sa.Date(), nullable=False),
        sa.Column("rent_amount", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    # expenses
    op.create_table(
        "expenses",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("property_id", sa.UUID(), sa.ForeignKey("properties.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category", sa.String(30), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("expense_date", sa.Date(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("recurring", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    # documents
    op.create_table(
        "documents",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("property_id", sa.UUID(), sa.ForeignKey("properties.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tenant_id", sa.UUID(), sa.ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("file_key", sa.String(500), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("mime_type", sa.String(100), nullable=True),
        sa.Column("category", sa.String(30), nullable=False, server_default="other"),
        sa.Column("uploaded_at", sa.DateTime(), nullable=False),
    )

    # communication_logs
    op.create_table(
        "communication_logs",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("tenant_id", sa.UUID(), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("property_id", sa.UUID(), sa.ForeignKey("properties.id", ondelete="SET NULL"), nullable=True),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("direction", sa.String(10), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("created_by", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("communication_logs")
    op.drop_table("documents")
    op.drop_table("expenses")
    op.drop_table("lease_events")
    op.drop_table("rent_payments")

    op.drop_column("maintenance_requests", "vendor_rating")
    op.drop_column("maintenance_requests", "resolved_at")
    op.drop_column("maintenance_requests", "assigned_at")
    op.drop_column("maintenance_requests", "vendor_id")

    op.drop_column("properties", "ai_description")

    op.drop_column("tenants", "screened_at")
    op.drop_column("tenants", "screening_notes")
    op.drop_column("tenants", "screening_tier")
    op.drop_column("tenants", "screening_score")
    op.drop_column("tenants", "prior_eviction")
    op.drop_column("tenants", "income")

    op.drop_table("vendors")
