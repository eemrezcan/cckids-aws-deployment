"""add maps fields to site settings

Revision ID: 0010_contact_maps_fields
Revises: 0009_home_project_images
Create Date: 2026-02-03 00:00:00

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0010_contact_maps_fields"
down_revision = "0009_home_project_images"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("maps_embed_url", sa.Text(), nullable=True))
    op.add_column("site_settings", sa.Column("maps_directions_url", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("site_settings", "maps_directions_url")
    op.drop_column("site_settings", "maps_embed_url")
