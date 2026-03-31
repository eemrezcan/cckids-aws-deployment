"""add media uuid columns

Revision ID: 0003_add_media_uuids
Revises: 0002_admin_password_hash_text
Create Date: 2026-01-31 00:00:00

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0003_add_media_uuids"
down_revision = "0002_admin_password_hash_text"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("products", sa.Column("cover_image_uuid", sa.String(length=36), nullable=True))
    op.add_column("product_images", sa.Column("file_uuid", sa.String(length=36), nullable=True))


def downgrade() -> None:
    op.drop_column("product_images", "file_uuid")
    op.drop_column("products", "cover_image_uuid")
