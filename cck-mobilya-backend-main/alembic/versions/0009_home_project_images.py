"""add home project images

Revision ID: 0009_home_project_images
Revises: 0008_contact_fields
Create Date: 2026-02-02 00:00:00

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0009_home_project_images"
down_revision = "0008_contact_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "home_project_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_image_id", sa.Integer(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["project_image_id"], ["project_images.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("sort_order", name="uq_home_project_images_sort_order"),
    )
    op.create_index("ix_home_project_images_project_image_id", "home_project_images", ["project_image_id"])


def downgrade() -> None:
    op.drop_index("ix_home_project_images_project_image_id", table_name="home_project_images")
    op.drop_table("home_project_images")
