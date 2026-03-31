from typing import Any, Literal
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.public import (
    AboutImageListResponse,
    AboutOut,
    CategoryListResponse,
    CategoryPublicOut,
    ContactResponse,
    HomeProjectImageListResponse,
    HomeProjectImagePublicOut,
    HomeSectionOut,
    ProductDetailOut,
    ProductListItemOut,
    ProductListResponse,
    ProjectCategoryListItemOut,
    ProjectCategoryListResponse,
    ProjectCategoryPublicOut,
    ProjectDetailPublicOut,
    ProjectListItemPublicOut,
    ProjectListResponse,
    ProjectReviewListResponse,
    ProjectReviewPublicOut,
    PublicHomeResponse,
    QuoteRequestCreateIn,
    QuoteRequestOut,
    ReferenceLogoListResponse,
    SiteSettingsPublicOut,
    SocialLinkOut,
)
from app.services import public_service

router = APIRouter(prefix="/public", tags=["public"])

Lang = Literal["tr", "en"]


def _has_value(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, tuple, dict, set)):
        return len(value) > 0
    return True


def _pick_lang(lang: Lang, tr_value: Any, en_value: Any) -> Any:
    if lang == "en" and _has_value(en_value):
        return en_value
    return tr_value


def _to_product_list_item(item: Any, lang: Lang) -> ProductListItemOut:
    out = ProductListItemOut.model_validate(item)
    out.name = _pick_lang(lang, item.name, getattr(item, "name_en", None))
    out.description = _pick_lang(lang, item.description, getattr(item, "description_en", None))
    return out


def _to_project_list_item(item: Any, lang: Lang) -> ProjectListItemPublicOut:
    out = ProjectListItemPublicOut.model_validate(item)
    out.name = _pick_lang(lang, item.name, getattr(item, "name_en", None))
    out.short_info = _pick_lang(lang, item.short_info, getattr(item, "short_info_en", None))
    out.location = _pick_lang(lang, item.location, getattr(item, "location_en", None))
    if out.category and item.category:
        out.category.name = _pick_lang(lang, item.category.name, getattr(item.category, "name_en", None))
    return out


@router.get("/home", response_model=PublicHomeResponse)
def get_home(
    lang: Lang = Query(default="tr"),
    db: Session = Depends(get_db),
) -> PublicHomeResponse:
    settings, sections, social_links = public_service.get_home(db)
    settings_out = SiteSettingsPublicOut.model_validate(settings)
    settings_out.whatsapp_default_message = _pick_lang(
        lang,
        settings.whatsapp_default_message,
        getattr(settings, "whatsapp_default_message_en", None),
    )
    settings_out.office_address = _pick_lang(
        lang,
        settings.office_address,
        getattr(settings, "office_address_en", None),
    )
    settings_out.workshop_address = _pick_lang(
        lang,
        settings.workshop_address,
        getattr(settings, "workshop_address_en", None),
    )

    section_outs: list[HomeSectionOut] = []
    for section in sections:
        section_out = HomeSectionOut.model_validate(section)
        section_out.title = _pick_lang(lang, section.title, getattr(section, "title_en", None))
        section_out.body = _pick_lang(lang, section.body, getattr(section, "body_en", None))
        section_outs.append(section_out)

    social_outs = [SocialLinkOut.model_validate(item) for item in social_links]
    return PublicHomeResponse(settings=settings_out, sections=section_outs, social_links=social_outs)


@router.get("/contact", response_model=ContactResponse)
def get_contact(
    lang: Lang = Query(default="tr"),
    db: Session = Depends(get_db),
) -> ContactResponse:
    settings, social_links = public_service.get_contact(db)
    return ContactResponse(
        phone_number=settings.phone_number,
        whatsapp_number=settings.whatsapp_number,
        email=settings.email,
        office_address=_pick_lang(lang, settings.office_address, getattr(settings, "office_address_en", None)),
        workshop_address=_pick_lang(
            lang, settings.workshop_address, getattr(settings, "workshop_address_en", None)
        ),
        social_links=[SocialLinkOut.model_validate(item) for item in social_links],
        maps_embed_url=settings.maps_embed_url,
        maps_directions_url=settings.maps_directions_url,
    )


@router.get("/home/project-images", response_model=HomeProjectImageListResponse)
def list_home_project_images(
    limit: int = Query(default=12, ge=1, le=100),
    db: Session = Depends(get_db),
) -> HomeProjectImageListResponse:
    items = public_service.list_home_project_images(db, limit)
    payload: list[HomeProjectImagePublicOut] = []
    for item in items:
        project_image = item.project_image
        if not project_image or not project_image.project:
            continue
        payload.append(
            HomeProjectImagePublicOut(
                project_uuid=project_image.project.uuid,
                image_url=project_image.url,
                image_uuid=project_image.file_uuid,
                kind=project_image.kind,
                sort_order=item.sort_order,
            )
        )
    return HomeProjectImageListResponse(items=payload)


@router.get("/products", response_model=ProductListResponse)
def list_products(
    q: str | None = Query(default=None, max_length=100),
    lang: Lang = Query(default="tr"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> ProductListResponse:
    items, total = public_service.list_products(db, q, page, page_size)
    payload = [_to_product_list_item(item, lang) for item in items]
    return ProductListResponse(items=payload, page=page, page_size=page_size, total=total)


@router.get("/categories", response_model=CategoryListResponse)
def list_categories(
    lang: Lang = Query(default="tr"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> CategoryListResponse:
    items, total = public_service.list_categories(db, page, page_size, lang)
    payload: list[CategoryPublicOut] = []
    for item in items:
        out = CategoryPublicOut.model_validate(item)
        out.name = _pick_lang(lang, item.name, getattr(item, "name_en", None))
        payload.append(out)
    return CategoryListResponse(items=payload, page=page, page_size=page_size, total=total)


@router.get("/projects", response_model=ProjectListResponse)
def list_projects(
    lang: Lang = Query(default="tr"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    category_uuid: UUID | None = None,
    q: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
) -> ProjectListResponse:
    items, total = public_service.list_projects(db, page, page_size, category_uuid, q)
    payload = [_to_project_list_item(item, lang) for item in items]
    return ProjectListResponse(items=payload, page=page, page_size=page_size, total=total)


@router.get("/project-categories", response_model=ProjectCategoryListResponse)
def list_project_categories(
    lang: Lang = Query(default="tr"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> ProjectCategoryListResponse:
    items, total = public_service.list_project_categories(db, page, page_size, lang)
    payload: list[ProjectCategoryListItemOut] = []
    for item in items:
        out = ProjectCategoryListItemOut.model_validate(item)
        out.name = _pick_lang(lang, item.name, getattr(item, "name_en", None))
        payload.append(out)
    return ProjectCategoryListResponse(items=payload, page=page, page_size=page_size, total=total)


@router.get("/project-categories/{category_uuid}/projects", response_model=ProjectListResponse)
def list_projects_by_category(
    category_uuid: UUID,
    lang: Lang = Query(default="tr"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    q: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
) -> ProjectListResponse:
    items, total = public_service.list_projects(db, page, page_size, category_uuid, q)
    payload = [_to_project_list_item(item, lang) for item in items]
    return ProjectListResponse(items=payload, page=page, page_size=page_size, total=total)


@router.get("/projects/{project_uuid}", response_model=ProjectDetailPublicOut)
def get_project_detail(
    project_uuid: UUID,
    lang: Lang = Query(default="tr"),
    db: Session = Depends(get_db),
) -> ProjectDetailPublicOut:
    project = public_service.get_project_detail(db, project_uuid)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    images = getattr(project, "images", []) or []
    before_images = [img for img in images if img.kind == "before"]
    after_images = [img for img in images if img.kind == "after"]
    gallery_images = [img for img in images if img.kind == "gallery"]

    category_out: ProjectCategoryPublicOut | None = None
    if project.category:
        category_out = ProjectCategoryPublicOut.model_validate(project.category)
        category_out.name = _pick_lang(
            lang, project.category.name, getattr(project.category, "name_en", None)
        )

    return ProjectDetailPublicOut(
        uuid=project.uuid,
        name=_pick_lang(lang, project.name, getattr(project, "name_en", None)),
        short_info=_pick_lang(lang, project.short_info, getattr(project, "short_info_en", None)),
        about_text=_pick_lang(lang, project.about_text, getattr(project, "about_text_en", None)),
        featured_image_url=project.featured_image_url,
        location=_pick_lang(lang, project.location, getattr(project, "location_en", None)),
        completed_at=project.completed_at,
        duration=project.duration,
        capacity=project.capacity,
        total_products=project.total_products,
        general_info=_pick_lang(lang, project.general_info or [], getattr(project, "general_info_en", None))
        or [],
        category=category_out,
        images=images,
        before_images=before_images,
        after_images=after_images,
        gallery_images=gallery_images,
        review=project.review,
    )


@router.get("/project-reviews", response_model=ProjectReviewListResponse)
def list_project_reviews(
    lang: Lang = Query(default="tr"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> ProjectReviewListResponse:
    items, total = public_service.list_project_reviews(db, page, page_size)
    payload = [
        ProjectReviewPublicOut(
            customer_name=item.customer_name,
            project_name=(
                _pick_lang(lang, item.project.name, getattr(item.project, "name_en", None))
                if item.project
                else "-"
            ),
            comment=item.comment,
        )
        for item in items
    ]
    return ProjectReviewListResponse(items=payload, page=page, page_size=page_size, total=total)


@router.get("/references", response_model=ReferenceLogoListResponse)
def list_reference_logos(
    limit: int = Query(default=6, ge=1, le=50),
    db: Session = Depends(get_db),
) -> ReferenceLogoListResponse:
    items = public_service.list_reference_logos(db, limit)
    return ReferenceLogoListResponse(items=items)


@router.get("/products/{product_uuid}", response_model=ProductDetailOut)
def get_product(
    product_uuid: UUID,
    lang: Lang = Query(default="tr"),
    db: Session = Depends(get_db),
) -> ProductDetailOut:
    product = public_service.get_product_by_uuid(db, product_uuid)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    out = ProductDetailOut.model_validate(product)
    payload = out.model_dump()
    payload["name"] = _pick_lang(lang, product.name, getattr(product, "name_en", None))
    payload["description"] = _pick_lang(
        lang, product.description, getattr(product, "description_en", None)
    )
    payload["details"] = _pick_lang(lang, product.details, getattr(product, "details_en", None))

    category_name_by_uuid = {
        str(item.uuid): _pick_lang(lang, item.name, getattr(item, "name_en", None))
        for item in product.categories
    }
    for category_payload in payload["categories"]:
        category_payload["name"] = category_name_by_uuid.get(
            str(category_payload["uuid"]), category_payload["name"]
        )

    return ProductDetailOut.model_validate(payload)


@router.get("/categories/{category_uuid}/products", response_model=ProductListResponse)
def list_products_by_category(
    category_uuid: UUID,
    q: str | None = Query(default=None, max_length=100),
    lang: Lang = Query(default="tr"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> ProductListResponse:
    result = public_service.list_products_by_category_uuid(db, category_uuid, page, page_size, q)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    items, total = result
    payload = [_to_product_list_item(item, lang) for item in items]
    return ProductListResponse(items=payload, page=page, page_size=page_size, total=total)


@router.get("/about", response_model=AboutOut)
def get_about(
    lang: Lang = Query(default="tr"),
    db: Session = Depends(get_db),
) -> AboutOut:
    about = public_service.get_about(db)
    return AboutOut(content=_pick_lang(lang, about.content, getattr(about, "content_en", None)))


@router.get("/about/images", response_model=AboutImageListResponse)
def list_about_images(db: Session = Depends(get_db)) -> AboutImageListResponse:
    items = public_service.list_about_images(db)
    return AboutImageListResponse(items=items)


@router.post("/quote-requests", response_model=QuoteRequestOut, status_code=status.HTTP_201_CREATED)
def create_quote_request(
    payload: QuoteRequestCreateIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> QuoteRequestOut:
    try:
        quote = public_service.create_quote_request(db, payload, background_tasks)
    except ValueError as exc:
        if str(exc) == "product_not_found":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found") from exc
        raise
    return quote
