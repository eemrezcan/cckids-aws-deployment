"""add about images

Revision ID: 0006_add_about_images
Revises: 0005_drop_product_slug
Create Date: 2026-02-02 00:00:00

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "0006_add_about_images"
down_revision = "0005_drop_product_slug"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "about_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("file_uuid", sa.String(length=36), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("uuid", name="uq_about_images_uuid"),
        sa.UniqueConstraint("sort_order", name="uq_about_images_sort_order"),
    )


def downgrade() -> None:
    op.drop_table("about_images")
