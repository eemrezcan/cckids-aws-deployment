from __future__ import annotations

from datetime import datetime
import uuid as uuid_pkg

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    phone_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    whatsapp_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    whatsapp_default_message: Mapped[str | None] = mapped_column(String(255), nullable=True)
    whatsapp_default_message_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    office_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    office_address_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    workshop_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    workshop_address_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    maps_embed_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    maps_directions_url: Mapped[str | None] = mapped_column(Text, nullable=True)


class AboutPage(Base):
    __tablename__ = "about_page"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    content_en: Mapped[str | None] = mapped_column(Text, nullable=True)


class AboutImage(Base):
    __tablename__ = "about_images"
    __table_args__ = (UniqueConstraint("sort_order", name="uq_about_images_sort_order"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    url: Mapped[str] = mapped_column(String(500))
    file_uuid: Mapped[str | None] = mapped_column(String(36), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ProjectCategory(Base):
    __tablename__ = "project_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(String(255))
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)

    projects: Mapped[list[Project]] = relationship("Project", back_populates="category")


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (
        Index("ix_projects_is_active", "is_active"),
        Index("ix_projects_sort_order", "sort_order"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(String(255))
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    short_info: Mapped[str | None] = mapped_column(String(500), nullable=True)
    short_info_en: Mapped[str | None] = mapped_column(String(500), nullable=True)
    about_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    about_text_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    featured_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    featured_image_uuid: Mapped[str | None] = mapped_column(String(36), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    completed_at: Mapped[str | None] = mapped_column(String(255), nullable=True)
    duration: Mapped[str | None] = mapped_column(String(255), nullable=True)
    capacity: Mapped[str | None] = mapped_column(String(255), nullable=True)
    total_products: Mapped[str | None] = mapped_column(String(255), nullable=True)
    general_info: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    general_info_en: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    category_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("project_categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    category: Mapped[ProjectCategory | None] = relationship("ProjectCategory", back_populates="projects")
    images: Mapped[list[ProjectImage]] = relationship(
        "ProjectImage",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    review: Mapped[ProjectReview | None] = relationship(
        "ProjectReview",
        back_populates="project",
        cascade="all, delete-orphan",
        uselist=False,
        passive_deletes=True,
    )


class ProjectImage(Base):
    __tablename__ = "project_images"
    __table_args__ = (
        UniqueConstraint("project_id", "kind", "sort_order", name="uq_project_images_kind_order"),
        Index("ix_project_images_project_id", "project_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    project_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        index=True,
    )
    kind: Mapped[str] = mapped_column(String(20))
    url: Mapped[str] = mapped_column(String(500))
    file_uuid: Mapped[str | None] = mapped_column(String(36), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project: Mapped[Project] = relationship("Project", back_populates="images")


class ProjectReview(Base):
    __tablename__ = "project_reviews"
    __table_args__ = (UniqueConstraint("project_id", name="uq_project_reviews_project_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    project_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        index=True,
    )
    customer_name: Mapped[str] = mapped_column(String(255))
    comment: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project: Mapped[Project] = relationship("Project", back_populates="review")


class ReferenceLogo(Base):
    __tablename__ = "reference_logos"
    __table_args__ = (UniqueConstraint("sort_order", name="uq_reference_logos_sort_order"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    url: Mapped[str] = mapped_column(String(500))
    file_uuid: Mapped[str | None] = mapped_column(String(36), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class HomeProjectImage(Base):
    __tablename__ = "home_project_images"
    __table_args__ = (UniqueConstraint("sort_order", name="uq_home_project_images_sort_order"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_image_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("project_images.id", ondelete="CASCADE"),
        index=True,
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    project_image: Mapped[ProjectImage] = relationship("ProjectImage")


class HomeSection(Base):
    __tablename__ = "home_sections"
    __table_args__ = (
        Index("ix_home_sections_is_active", "is_active"),
        Index("ix_home_sections_sort_order", "sort_order"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kind: Mapped[str] = mapped_column(String(50))
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    title_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    body_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    media_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        Index("ix_products_is_active", "is_active"),
        Index("ix_products_sort_order", "sort_order"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(String(255))
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    has_size: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    details_en: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cover_image_uuid: Mapped[str | None] = mapped_column(String(36), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    categories: Mapped[list[Category]] = relationship(
        "Category",
        secondary="product_categories",
        back_populates="products",
    )
    colors: Mapped[list[Color]] = relationship(
        "Color",
        secondary="product_colors",
        back_populates="products",
    )
    images: Mapped[list[ProductImage]] = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    sizes: Mapped[list[ProductSize]] = relationship(
        "ProductSize",
        back_populates="product",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    quote_requests: Mapped[list[QuoteRequest]] = relationship(
        "QuoteRequest",
        back_populates="product",
        passive_deletes=True,
    )


class ProductImage(Base):
    __tablename__ = "product_images"
    __table_args__ = (UniqueConstraint("product_id", "sort_order", name="uq_product_images_product_order"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
    )
    size_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("product_sizes.id", ondelete="SET NULL"),
        nullable=True,
    )
    color_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("colors.id", ondelete="SET NULL"),
        nullable=True,
    )
    url: Mapped[str] = mapped_column(String(500))
    file_uuid: Mapped[str | None] = mapped_column(String(36), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

    product: Mapped[Product] = relationship("Product", back_populates="images")
    size: Mapped[ProductSize | None] = relationship("ProductSize", back_populates="images")
    color: Mapped[Color | None] = relationship("Color", back_populates="images")


class ProductSize(Base):
    __tablename__ = "product_sizes"
    __table_args__ = (Index("ix_product_sizes_product_id", "product_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        index=True,
    )
    width: Mapped[int] = mapped_column(Integer)
    height: Mapped[int] = mapped_column(Integer)
    depth: Mapped[int] = mapped_column(Integer)
    unit: Mapped[str] = mapped_column(String(20), default="cm", server_default="cm")
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

    product: Mapped[Product] = relationship("Product", back_populates="sizes")
    images: Mapped[list[ProductImage]] = relationship("ProductImage", back_populates="size")


class Color(Base):
    __tablename__ = "colors"
    __table_args__ = (UniqueConstraint("name", name="uq_colors_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(String(120))
    hex: Mapped[str] = mapped_column(String(20))

    products: Mapped[list[Product]] = relationship(
        "Product",
        secondary="product_colors",
        back_populates="colors",
    )
    images: Mapped[list[ProductImage]] = relationship("ProductImage", back_populates="color")


class ProductColor(Base):
    __tablename__ = "product_colors"
    __table_args__ = (UniqueConstraint("product_id", "color_id", name="uq_product_colors"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
    )
    color_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("colors.id", ondelete="CASCADE"),
    )


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(String(255))
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    emoji: Mapped[str | None] = mapped_column(String(20), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_uuid: Mapped[str | None] = mapped_column(String(36), nullable=True)

    products: Mapped[list[Product]] = relationship(
        "Product",
        secondary="product_categories",
        back_populates="categories",
    )


class ProductCategory(Base):
    __tablename__ = "product_categories"
    __table_args__ = (UniqueConstraint("product_id", "category_id", name="uq_product_categories"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
    )
    category_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("categories.id", ondelete="CASCADE"),
    )


class SocialLink(Base):
    __tablename__ = "social_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    platform: Mapped[str] = mapped_column(String(50))
    url: Mapped[str] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")


class QuoteRequest(Base):
    __tablename__ = "quote_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str] = mapped_column(Text)
    product_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(String(30), default="new", server_default="new")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    product: Mapped[Product | None] = relationship("Product", back_populates="quote_requests")
