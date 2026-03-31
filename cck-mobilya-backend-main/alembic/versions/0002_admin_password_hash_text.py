"""admin password hash to text

Revision ID: 0002_admin_password_hash_text
Revises: 0001_initial
Create Date: 2026-01-30 00:00:01

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0002_admin_password_hash_text"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "admin_users",
        "password_hash",
        existing_type=sa.String(length=255),
        type_=sa.Text(),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "admin_users",
        "password_hash",
        existing_type=sa.Text(),
        type_=sa.String(length=255),
        existing_nullable=False,
    )
