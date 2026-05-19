"""Add organizations, users tables and org_id to core tables

Revision ID: 002_multi_tenancy
Revises: 001_v1_2_features
Create Date: 2026-05-19
"""
from alembic import op
import sqlalchemy as sa

revision = "002_multi_tenancy"
down_revision = "001_v1_2_features"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # organizations
    op.create_table(
        "organizations",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "plan_tier",
            sa.Enum("free", "starter", "pro", "enterprise", name="plantier"),
            nullable=False,
            server_default="free",
        ),
        sa.Column("stripe_customer_id", sa.String(100), nullable=True),
        sa.Column("stripe_subscription_id", sa.String(100), nullable=True),
        sa.Column("auto_dispatch_enabled", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    # users
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("org_id", sa.UUID(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("owner", "manager", "tech", "accountant", name="userrole"),
            nullable=False,
            server_default="manager",
        ),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    # Add org_id to core tables (nullable so existing rows stay valid)
    for table in ("properties", "tenants", "maintenance_requests", "rent_payments"):
        op.add_column(
            table,
            sa.Column(
                "org_id",
                sa.UUID(),
                sa.ForeignKey("organizations.id", ondelete="CASCADE"),
                nullable=True,
                index=True,
            ),
        )


def downgrade() -> None:
    for table in ("rent_payments", "maintenance_requests", "tenants", "properties"):
        op.drop_column(table, "org_id")

    op.drop_table("users")
    op.drop_table("organizations")
    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP TYPE IF EXISTS plantier")
