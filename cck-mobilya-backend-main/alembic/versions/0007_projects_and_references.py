"""add projects, reviews, images, references

Revision ID: 0007_projects_and_references
Revises: 0006_add_about_images
Create Date: 2026-02-02 00:00:00

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "0007_projects_and_references"
down_revision = "0006_add_about_images"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "project_categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.UniqueConstraint("uuid", name="uq_project_categories_uuid"),
    )

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("short_info", sa.String(length=500), nullable=True),
        sa.Column("about_text", sa.Text(), nullable=True),
        sa.Column("featured_image_url", sa.String(length=500), nullable=True),
        sa.Column("featured_image_uuid", sa.String(length=36), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("completed_at", sa.String(length=255), nullable=True),
        sa.Column("duration", sa.String(length=255), nullable=True),
        sa.Column("capacity", sa.String(length=255), nullable=True),
        sa.Column("total_products", sa.String(length=255), nullable=True),
        sa.Column("general_info", postgresql.JSONB(), nullable=True),
        sa.Column("category_id", sa.Integer(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["category_id"], ["project_categories.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("uuid", name="uq_projects_uuid"),
    )
    op.create_index("ix_projects_is_active", "projects", ["is_active"])
    op.create_index("ix_projects_sort_order", "projects", ["sort_order"])
    op.create_index("ix_projects_category_id", "projects", ["category_id"])

    op.create_table(
        "project_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("kind", sa.String(length=20), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("file_uuid", sa.String(length=36), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("uuid", name="uq_project_images_uuid"),
        sa.UniqueConstraint("project_id", "kind", "sort_order", name="uq_project_images_kind_order"),
    )
    op.create_index("ix_project_images_project_id", "project_images", ["project_id"])

    op.create_table(
        "project_reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("customer_name", sa.String(length=255), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("uuid", name="uq_project_reviews_uuid"),
        sa.UniqueConstraint("project_id", name="uq_project_reviews_project_id"),
    )
    op.create_index("ix_project_reviews_project_id", "project_reviews", ["project_id"])

    op.create_table(
        "reference_logos",
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
        sa.UniqueConstraint("uuid", name="uq_reference_logos_uuid"),
        sa.UniqueConstraint("sort_order", name="uq_reference_logos_sort_order"),
    )


def downgrade() -> None:
    op.drop_table("reference_logos")
    op.drop_index("ix_project_reviews_project_id", table_name="project_reviews")
    op.drop_table("project_reviews")
    op.drop_index("ix_project_images_project_id", table_name="project_images")
    op.drop_table("project_images")
    op.drop_index("ix_projects_category_id", table_name="projects")
    op.drop_index("ix_projects_sort_order", table_name="projects")
    op.drop_index("ix_projects_is_active", table_name="projects")
    op.drop_table("projects")
    op.drop_table("project_categories")
