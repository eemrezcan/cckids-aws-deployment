from __future__ import annotations

import logging
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.emailer import send_email
from app.models import (
    AboutPage,
    AboutImage,
    Category,
    HomeProjectImage,
    HomeSection,
    Product,
    ProductImage,
    Project,
    ProjectCategory,
    ProjectImage,
    ProjectReview,
    QuoteRequest,
    ReferenceLogo,
    SiteSettings,
    SocialLink,
)
from app.schemas.public import QuoteRequestCreateIn
from app.settings import settings

logger = logging.getLogger(__name__)


def get_home(db: Session) -> tuple[SiteSettings, list[HomeSection], list[SocialLink]]:
    settings = db.get(SiteSettings, 1)
    if settings is None:
        settings = SiteSettings(
            id=1,
            phone_number=None,
            email=None,
            whatsapp_number=None,
            whatsapp_default_message=None,
            whatsapp_default_message_en=None,
            office_address=None,
            office_address_en=None,
            workshop_address=None,
            workshop_address_en=None,
        )

    sections = (
        db.execute(
            select(HomeSection)
            .where(HomeSection.is_active.is_(True))
            .order_by(HomeSection.sort_order.asc(), HomeSection.id.asc())
        )
        .scalars()
        .all()
    )

    social_links = (
        db.execute(
            select(SocialLink)
            .where(SocialLink.is_active.is_(True))
            .order_by(SocialLink.sort_order.asc(), SocialLink.id.asc())
        )
        .scalars()
        .all()
    )

    return settings, sections, social_links


def get_contact(db: Session) -> tuple[SiteSettings, list[SocialLink]]:
    settings = db.get(SiteSettings, 1)
    if settings is None:
        settings = SiteSettings(
            id=1,
            phone_number=None,
            email=None,
            whatsapp_number=None,
            whatsapp_default_message=None,
            whatsapp_default_message_en=None,
            office_address=None,
            office_address_en=None,
            workshop_address=None,
            workshop_address_en=None,
        )
    social_links = (
        db.execute(
            select(SocialLink)
            .where(
                SocialLink.is_active.is_(True),
                SocialLink.platform.in_(["instagram", "facebook", "whatsapp"]),
            )
            .order_by(SocialLink.sort_order.asc(), SocialLink.id.asc())
        )
        .scalars()
        .all()
    )
    return settings, social_links


def list_products(db: Session, q: str | None, page: int, page_size: int) -> tuple[list[Product], int]:
    filters = [Product.is_active.is_(True)]
    if q:
        like = f"%{q}%"
        filters.append(
            or_(
                Product.name.ilike(like),
                Product.name_en.ilike(like),
                Product.description.ilike(like),
                Product.description_en.ilike(like),
            )
        )

    total = db.execute(select(func.count()).select_from(Product).where(*filters)).scalar_one()

    items = (
        db.execute(
            select(Product)
            .where(*filters)
            .order_by(Product.sort_order.asc(), Product.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )

    return items, total


def list_categories(db: Session, page: int, page_size: int, lang: str = "tr") -> tuple[list[Category], int]:
    total = db.execute(select(func.count()).select_from(Category)).scalar_one()
    order_by_name = (
        func.lower(func.coalesce(Category.name_en, Category.name))
        if lang == "en"
        else func.lower(Category.name)
    )
    items = (
        db.execute(
            select(Category)
            .order_by(order_by_name.asc(), Category.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def list_projects(
    db: Session,
    page: int,
    page_size: int,
    category_uuid: UUID | None = None,
    q: str | None = None,
) -> tuple[list[Project], int]:
    filters = [Project.is_active.is_(True)]
    if q:
        like = f"%{q}%"
        filters.append(
            or_(
                Project.name.ilike(like),
                Project.name_en.ilike(like),
                Project.short_info.ilike(like),
                Project.short_info_en.ilike(like),
                Project.location.ilike(like),
                Project.location_en.ilike(like),
            )
        )
    stmt = select(Project).where(*filters).options(selectinload(Project.category))
    count_stmt = select(func.count()).select_from(Project).where(*filters)
    if category_uuid:
        category = (
            db.execute(select(ProjectCategory).where(ProjectCategory.uuid == category_uuid))
            .scalars()
            .first()
        )
        if not category:
            return [], 0
        stmt = stmt.where(Project.category_id == category.id)
        count_stmt = count_stmt.where(Project.category_id == category.id)
    total = db.execute(count_stmt).scalar_one()
    items = (
        db.execute(
            stmt.order_by(Project.sort_order.asc(), Project.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def get_project_detail(db: Session, project_uuid: UUID) -> Project | None:
    stmt = (
        select(Project)
        .where(Project.uuid == project_uuid, Project.is_active.is_(True))
        .options(
            selectinload(Project.category),
            selectinload(Project.images),
            selectinload(Project.review),
        )
    )
    project = db.execute(stmt).scalars().first()
    if project:
        project.images.sort(key=lambda img: (img.kind, img.sort_order, img.id))
    return project


def list_project_categories(
    db: Session, page: int, page_size: int, lang: str = "tr"
) -> tuple[list[ProjectCategory], int]:
    total = db.execute(select(func.count()).select_from(ProjectCategory)).scalar_one()
    order_by_name = (
        func.lower(func.coalesce(ProjectCategory.name_en, ProjectCategory.name))
        if lang == "en"
        else func.lower(ProjectCategory.name)
    )
    items = (
        db.execute(
            select(ProjectCategory)
            .order_by(order_by_name.asc(), ProjectCategory.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def list_project_reviews(db: Session, page: int, page_size: int) -> tuple[list[ProjectReview], int]:
    stmt = (
        select(ProjectReview)
        .join(Project)
        .where(Project.is_active.is_(True))
        .options(selectinload(ProjectReview.project))
    )
    count_stmt = (
        select(func.count())
        .select_from(ProjectReview)
        .join(Project)
        .where(Project.is_active.is_(True))
    )
    total = db.execute(count_stmt).scalar_one()
    items = (
        db.execute(
            stmt.order_by(ProjectReview.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def list_reference_logos(db: Session, limit: int) -> list[ReferenceLogo]:
    items = (
        db.execute(
            select(ReferenceLogo)
            .order_by(ReferenceLogo.sort_order.asc(), ReferenceLogo.id.asc())
            .limit(limit)
        )
        .scalars()
        .all()
    )
    return items


def list_home_project_images(db: Session, limit: int) -> list[HomeProjectImage]:
    items = (
        db.execute(
            select(HomeProjectImage)
            .options(
                selectinload(HomeProjectImage.project_image).selectinload(ProjectImage.project),
            )
            .order_by(HomeProjectImage.sort_order.asc(), HomeProjectImage.id.asc())
            .limit(limit)
        )
        .scalars()
        .all()
    )
    return items


def get_product_by_uuid(db: Session, product_uuid: UUID) -> Product | None:
    stmt = (
        select(Product)
        .where(Product.uuid == product_uuid, Product.is_active.is_(True))
        .options(
            selectinload(Product.images).selectinload(ProductImage.color),
            selectinload(Product.images).selectinload(ProductImage.size),
            selectinload(Product.categories),
            selectinload(Product.colors),
            selectinload(Product.sizes),
        )
    )
    product = db.execute(stmt).scalars().first()
    if product:
        product.images.sort(key=lambda img: (img.sort_order, img.id))
        product.sizes.sort(key=lambda size: (size.sort_order, size.id))
    return product


def list_products_by_category_uuid(
    db: Session, category_uuid: UUID, page: int, page_size: int, q: str | None = None
) -> tuple[list[Product], int] | None:
    category = db.execute(select(Category).where(Category.uuid == category_uuid)).scalars().first()
    if not category:
        return None
    filters = [Product.is_active.is_(True)]
    if q:
        like = f"%{q}%"
        filters.append(
            or_(
                Product.name.ilike(like),
                Product.name_en.ilike(like),
                Product.description.ilike(like),
                Product.description_en.ilike(like),
            )
        )
    total = (
        db.execute(
            select(func.count())
            .select_from(Product)
            .join(Product.categories)
            .where(*filters, Category.id == category.id)
        ).scalar_one()
    )
    items = (
        db.execute(
            select(Product)
            .join(Product.categories)
            .where(*filters, Category.id == category.id)
            .order_by(Product.sort_order.asc(), Product.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def get_about(db: Session) -> AboutPage:
    about = db.get(AboutPage, 1)
    if about is None:
        about = AboutPage(id=1, content=None, content_en=None)
    return about


def list_about_images(db: Session) -> list[AboutImage]:
    items = (
        db.execute(select(AboutImage).order_by(AboutImage.sort_order.asc(), AboutImage.id.asc()))
        .scalars()
        .all()
    )
    return items[:5]


def _send_quote_email_safe(
    payload: QuoteRequestCreateIn,
    quote_id: int,
    created_at: str,
    product_label: str | None,
) -> None:
    try:
        subject = f"Yeni Teklif Talebi: {payload.name} ({payload.phone or '-'})"
        body = (
            f"Ad Soyad: {payload.name}\n"
            f"Telefon: {payload.phone or '-'}\n"
            f"E-posta: {payload.email or '-'}\n"
            f"Urun: {product_label or payload.product_uuid or payload.product_id or '-'}\n"
            f"Tarih: {created_at}\n"
            f"Mesaj:\n{payload.message}\n"
        )
        send_email(settings.smtp_to, subject, body)
    except Exception:
        logger.exception("Failed to send quote request email")


def create_quote_request(
    db: Session,
    payload: QuoteRequestCreateIn,
    background_tasks: object | None = None,
) -> QuoteRequest:
    product_id = payload.product_id
    product_label: str | None = None
    if payload.product_uuid:
        product = (
            db.execute(
                select(Product).where(Product.uuid == payload.product_uuid, Product.is_active.is_(True))
            )
            .scalars()
            .first()
        )
        if not product:
            raise ValueError("product_not_found")
        product_id = product.id
        product_label = product.name
    elif product_id is not None:
        product = (
            db.execute(select(Product).where(Product.id == product_id, Product.is_active.is_(True)))
            .scalars()
            .first()
        )
        if not product:
            raise ValueError("product_not_found")
        product_label = product.name

    quote = QuoteRequest(
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        message=payload.message,
        product_id=product_id,
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)

    if background_tasks is not None:
        try:
            from fastapi import BackgroundTasks

            if isinstance(background_tasks, BackgroundTasks):
                background_tasks.add_task(
                    _send_quote_email_safe,
                    payload,
                    quote.id,
                    quote.created_at.isoformat(),
                    product_label,
                )
        except Exception:
            logger.exception("Failed to schedule quote request email")

    return quote
