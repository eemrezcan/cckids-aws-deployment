"""drop product slug

Revision ID: 0005_drop_product_slug
Revises: 0004_product_details_categories
Create Date: 2026-02-02 00:00:00

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0005_drop_product_slug"
down_revision = "0004_product_details_categories"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index("ix_products_slug", table_name="products")
    op.drop_constraint("uq_products_slug", "products", type_="unique")
    op.drop_column("products", "slug")


def downgrade() -> None:
    op.add_column("products", sa.Column("slug", sa.String(length=255), nullable=False))
    op.create_unique_constraint("uq_products_slug", "products", ["slug"])
    op.create_index("ix_products_slug", "products", ["slug"], unique=False)
