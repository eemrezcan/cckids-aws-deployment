"""add contact fields to site settings

Revision ID: 0008_contact_fields
Revises: 0007_projects_and_references
Create Date: 2026-02-02 00:00:00

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0008_contact_fields"
down_revision = "0007_projects_and_references"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("phone_number", sa.String(length=50), nullable=True))
    op.add_column("site_settings", sa.Column("email", sa.String(length=255), nullable=True))
    op.add_column("site_settings", sa.Column("office_address", sa.Text(), nullable=True))
    op.add_column("site_settings", sa.Column("workshop_address", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("site_settings", "workshop_address")
    op.drop_column("site_settings", "office_address")
    op.drop_column("site_settings", "email")
    op.drop_column("site_settings", "phone_number")
