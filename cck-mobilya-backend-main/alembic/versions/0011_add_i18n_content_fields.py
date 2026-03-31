"""add i18n content fields

Revision ID: 0011_add_i18n_content_fields
Revises: 0010_contact_maps_fields
Create Date: 2026-02-18 00:00:00

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "0011_add_i18n_content_fields"
down_revision = "0010_contact_maps_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("whatsapp_default_message_en", sa.String(length=255), nullable=True))
    op.add_column("site_settings", sa.Column("office_address_en", sa.Text(), nullable=True))
    op.add_column("site_settings", sa.Column("workshop_address_en", sa.Text(), nullable=True))

    op.add_column("home_sections", sa.Column("title_en", sa.String(length=255), nullable=True))
    op.add_column("home_sections", sa.Column("body_en", sa.Text(), nullable=True))

    op.add_column("about_page", sa.Column("content_en", sa.Text(), nullable=True))

    op.add_column("products", sa.Column("name_en", sa.String(length=255), nullable=True))
    op.add_column("products", sa.Column("description_en", sa.Text(), nullable=True))
    op.add_column("products", sa.Column("details_en", postgresql.JSONB(astext_type=sa.Text()), nullable=True))

    op.add_column("categories", sa.Column("name_en", sa.String(length=255), nullable=True))
    op.add_column("project_categories", sa.Column("name_en", sa.String(length=255), nullable=True))

    op.add_column("projects", sa.Column("name_en", sa.String(length=255), nullable=True))
    op.add_column("projects", sa.Column("short_info_en", sa.String(length=500), nullable=True))
    op.add_column("projects", sa.Column("about_text_en", sa.Text(), nullable=True))
    op.add_column("projects", sa.Column("location_en", sa.String(length=255), nullable=True))
    op.add_column("projects", sa.Column("general_info_en", postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    op.drop_column("projects", "general_info_en")
    op.drop_column("projects", "location_en")
    op.drop_column("projects", "about_text_en")
    op.drop_column("projects", "short_info_en")
    op.drop_column("projects", "name_en")

    op.drop_column("project_categories", "name_en")
    op.drop_column("categories", "name_en")

    op.drop_column("products", "details_en")
    op.drop_column("products", "description_en")
    op.drop_column("products", "name_en")

    op.drop_column("about_page", "content_en")

    op.drop_column("home_sections", "body_en")
    op.drop_column("home_sections", "title_en")

    op.drop_column("site_settings", "workshop_address_en")
    op.drop_column("site_settings", "office_address_en")
    op.drop_column("site_settings", "whatsapp_default_message_en")
