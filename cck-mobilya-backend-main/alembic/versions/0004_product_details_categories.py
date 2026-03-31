"""add product details, categories, colors, sizes, uuids

Revision ID: 0004_product_details_categories
Revises: 0003_add_media_uuids
Create Date: 2026-02-02 00:00:00

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "0004_product_details_categories"
down_revision = "0003_add_media_uuids"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "colors",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("hex", sa.String(length=20), nullable=False),
        sa.UniqueConstraint("name", name="uq_colors_name"),
        sa.UniqueConstraint("uuid", name="uq_colors_uuid"),
    )

    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("emoji", sa.String(length=20), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("image_uuid", sa.String(length=36), nullable=True),
        sa.UniqueConstraint("uuid", name="uq_categories_uuid"),
    )

    op.create_table(
        "product_sizes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("width", sa.Integer(), nullable=False),
        sa.Column("height", sa.Integer(), nullable=False),
        sa.Column("depth", sa.Integer(), nullable=False),
        sa.Column("unit", sa.String(length=20), nullable=False, server_default="cm"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("uuid", name="uq_product_sizes_uuid"),
    )
    op.create_index("ix_product_sizes_product_id", "product_sizes", ["product_id"])

    op.create_table(
        "product_colors",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("color_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["color_id"], ["colors.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("product_id", "color_id", name="uq_product_colors"),
    )

    op.create_table(
        "product_categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("product_id", "category_id", name="uq_product_categories"),
    )

    op.add_column(
        "products",
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            nullable=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
    )
    op.add_column(
        "products",
        sa.Column("has_size", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.add_column("products", sa.Column("details", postgresql.JSONB(), nullable=True))

    op.execute("UPDATE products SET uuid = gen_random_uuid() WHERE uuid IS NULL")
    op.alter_column("products", "uuid", nullable=False)
    op.create_unique_constraint("uq_products_uuid", "products", ["uuid"])

    op.add_column(
        "product_images",
        sa.Column(
            "uuid",
            postgresql.UUID(as_uuid=True),
            nullable=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
    )
    op.add_column("product_images", sa.Column("size_id", sa.Integer(), nullable=True))
    op.add_column("product_images", sa.Column("color_id", sa.Integer(), nullable=True))

    op.execute("UPDATE product_images SET uuid = gen_random_uuid() WHERE uuid IS NULL")
    op.alter_column("product_images", "uuid", nullable=False)
    op.create_unique_constraint("uq_product_images_uuid", "product_images", ["uuid"])

    op.create_foreign_key(
        "fk_product_images_size_id",
        "product_images",
        "product_sizes",
        ["size_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_product_images_color_id",
        "product_images",
        "colors",
        ["color_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_unique_constraint(
        "uq_product_images_product_order",
        "product_images",
        ["product_id", "sort_order"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_product_images_product_order", "product_images", type_="unique")
    op.drop_constraint("fk_product_images_color_id", "product_images", type_="foreignkey")
    op.drop_constraint("fk_product_images_size_id", "product_images", type_="foreignkey")
    op.drop_constraint("uq_product_images_uuid", "product_images", type_="unique")
    op.drop_column("product_images", "color_id")
    op.drop_column("product_images", "size_id")
    op.drop_column("product_images", "uuid")

    op.drop_constraint("uq_products_uuid", "products", type_="unique")
    op.drop_column("products", "details")
    op.drop_column("products", "has_size")
    op.drop_column("products", "uuid")

    op.drop_table("product_categories")
    op.drop_table("product_colors")
    op.drop_index("ix_product_sizes_product_id", table_name="product_sizes")
    op.drop_table("product_sizes")
    op.drop_table("categories")
    op.drop_table("colors")
