from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models import (
    AboutPage,
    AboutImage,
    Category,
    Color,
    HomeProjectImage,
    HomeSection,
    Product,
    ProductImage,
    ProductSize,
    Project,
    ProjectCategory,
    ProjectImage,
    ProjectReview,
    QuoteRequest,
    ReferenceLogo,
    SiteSettings,
    SocialLink,
)
from app.schemas.admin import (
    AboutUpdateIn,
    AboutImageCreateIn,
    AboutImageUpdateIn,
    CategoryCreateIn,
    CategoryUpdateIn,
    ColorCreateIn,
    ColorUpdateIn,
    ContactMapsUpdateIn,
    HomeSectionCreateIn,
    HomeSectionUpdateIn,
    HomeProjectImageCreateIn,
    ProductCreateIn,
    ProductImageCreateIn,
    ProductImageUpdateIn,
    ProductSizeCreateIn,
    ProductSizeUpdateIn,
    ProductUpdateIn,
    ProjectCategoryCreateIn,
    ProjectCategoryUpdateIn,
    ProjectCreateIn,
    ProjectImageCreateIn,
    ProjectImageUpdateIn,
    ProjectReviewUpsertIn,
    ProjectUpdateIn,
    QuoteRequestStatusUpdateIn,
    ReferenceLogoCreateIn,
    ReferenceLogoUpdateIn,
    ReorderItem,
    SiteSettingsUpdateIn,
    SocialLinkCreateIn,
    SocialLinkUpdateIn,
)
from .media_utils import delete_media, extract_uuid_from_media_url


def get_site_settings(db: Session) -> SiteSettings:
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
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _resolve_uploaded_file_uuid(url: str | None, file_uuid: str | None) -> str:
    if not url:
        raise ValueError("invalid_media_url")
    extracted = extract_uuid_from_media_url(url)
    if not extracted:
        raise ValueError("invalid_media_url")
    if file_uuid and file_uuid != extracted:
        raise ValueError("file_uuid_mismatch")
    return file_uuid or extracted


def update_site_settings(db: Session, payload: SiteSettingsUpdateIn) -> SiteSettings:
    settings = get_site_settings(db)
    if payload.phone_number is not None:
        settings.phone_number = payload.phone_number
    if payload.email is not None:
        settings.email = payload.email
    if payload.whatsapp_number is not None:
        settings.whatsapp_number = payload.whatsapp_number
    if payload.whatsapp_default_message is not None:
        settings.whatsapp_default_message = payload.whatsapp_default_message
    if payload.whatsapp_default_message_en is not None:
        settings.whatsapp_default_message_en = payload.whatsapp_default_message_en
    if payload.office_address is not None:
        settings.office_address = payload.office_address
    if payload.office_address_en is not None:
        settings.office_address_en = payload.office_address_en
    if payload.workshop_address is not None:
        settings.workshop_address = payload.workshop_address
    if payload.workshop_address_en is not None:
        settings.workshop_address_en = payload.workshop_address_en
    db.commit()
    db.refresh(settings)
    return settings


def update_contact_maps(db: Session, payload: ContactMapsUpdateIn) -> SiteSettings:
    settings = get_site_settings(db)
    data = payload.model_dump(exclude_unset=True)
    if "maps_embed_url" in data:
        settings.maps_embed_url = data["maps_embed_url"]
    if "maps_directions_url" in data:
        settings.maps_directions_url = data["maps_directions_url"]
    db.commit()
    db.refresh(settings)
    return settings


def list_home_sections(db: Session, page: int, page_size: int) -> tuple[list[HomeSection], int]:
    total = db.execute(select(func.count()).select_from(HomeSection)).scalar_one()
    items = (
        db.execute(
            select(HomeSection)
            .order_by(HomeSection.sort_order.asc(), HomeSection.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def create_home_section(db: Session, payload: HomeSectionCreateIn) -> HomeSection:
    section = HomeSection(**payload.model_dump())
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


def update_home_section(db: Session, section_id: int, payload: HomeSectionUpdateIn) -> HomeSection | None:
    section = db.get(HomeSection, section_id)
    if not section:
        return None
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(section, key, value)
    db.commit()
    db.refresh(section)
    return section


def delete_home_section(db: Session, section_id: int) -> bool:
    section = db.get(HomeSection, section_id)
    if not section:
        return False
    db.delete(section)
    db.commit()
    return True


def reorder_home_sections(db: Session, items: list[ReorderItem]) -> None:
    ids = [item.id for item in items]
    existing = db.execute(select(HomeSection).where(HomeSection.id.in_(ids))).scalars().all()
    if len(existing) != len(ids):
        raise ValueError("not_found")
    order_map = {item.id: item.sort_order for item in items}
    for section in existing:
        section.sort_order = order_map[section.id]
    db.commit()


def list_products(
    db: Session,
    page: int,
    page_size: int,
    q: str | None,
    is_active: bool | None,
) -> tuple[list[Product], int]:
    stmt = select(Product)
    count_stmt = select(func.count()).select_from(Product)

    filters = []
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
    if is_active is not None:
        filters.append(Product.is_active.is_(is_active))

    if filters:
        stmt = stmt.where(*filters)
        count_stmt = count_stmt.where(*filters)

    total = db.execute(count_stmt).scalar_one()
    items = (
        db.execute(
            stmt.order_by(Product.sort_order.asc(), Product.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def _load_categories(db: Session, category_ids: list[int]) -> list[Category]:
    if not category_ids:
        return []
    categories = db.execute(select(Category).where(Category.id.in_(category_ids))).scalars().all()
    if len(categories) != len(set(category_ids)):
        raise ValueError("category_not_found")
    return categories


def _load_colors(db: Session, color_ids: list[int]) -> list[Color]:
    if not color_ids:
        return []
    colors = db.execute(select(Color).where(Color.id.in_(color_ids))).scalars().all()
    if len(colors) != len(set(color_ids)):
        raise ValueError("color_not_found")
    return colors


def _ensure_image_order_available(
    db: Session,
    product_id: int,
    sort_order: int,
    exclude_id: int | None = None,
) -> None:
    stmt = select(ProductImage).where(
        ProductImage.product_id == product_id,
        ProductImage.sort_order == sort_order,
    )
    if exclude_id is not None:
        stmt = stmt.where(ProductImage.id != exclude_id)
    existing = db.execute(stmt).scalars().first()
    if existing:
        raise ValueError("image_order_taken")


def create_product(db: Session, payload: ProductCreateIn) -> Product:
    data = payload.model_dump()
    category_ids = data.pop("category_ids", [])
    color_ids = data.pop("color_ids", [])
    if not data.get("cover_image_uuid") and data.get("cover_image_url"):
        data["cover_image_uuid"] = extract_uuid_from_media_url(data["cover_image_url"])
    categories = _load_categories(db, category_ids)
    colors = _load_colors(db, color_ids)
    product = Product(**data)
    if categories:
        product.categories = categories
    if colors:
        product.colors = colors
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, payload: ProductUpdateIn) -> Product | None:
    product = db.get(Product, product_id)
    if not product:
        return None
    data = payload.model_dump(exclude_unset=True)
    category_ids = data.pop("category_ids", None)
    color_ids = data.pop("color_ids", None)
    if "cover_image_url" in data:
        new_url = data.get("cover_image_url")
        if new_url != product.cover_image_url and product.cover_image_url:
            delete_media(product.cover_image_url)
        product.cover_image_url = new_url
        if data.get("cover_image_uuid") is not None:
            product.cover_image_uuid = data.get("cover_image_uuid")
        else:
            product.cover_image_uuid = extract_uuid_from_media_url(new_url) if new_url else None
        data.pop("cover_image_uuid", None)
        data.pop("cover_image_url", None)
    elif "cover_image_uuid" in data:
        product.cover_image_uuid = data.get("cover_image_uuid")
        data.pop("cover_image_uuid", None)
    for key, value in data.items():
        setattr(product, key, value)
    if category_ids is not None:
        product.categories = _load_categories(db, category_ids)
    if color_ids is not None:
        product.colors = _load_colors(db, color_ids)
    db.commit()
    db.refresh(product)
    return product


def get_product_detail(db: Session, product_id: int) -> Product | None:
    stmt = (
        select(Product)
        .where(Product.id == product_id)
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


def delete_product(db: Session, product_id: int) -> bool:
    product = (
        db.execute(select(Product).where(Product.id == product_id).options(selectinload(Product.images)))
        .scalars()
        .first()
    )
    if not product:
        return False
    urls = []
    if product.cover_image_url:
        urls.append(product.cover_image_url)
    urls.extend([img.url for img in product.images])
    for url in urls:
        delete_media(url)
    db.delete(product)
    db.commit()
    return True


def add_product_image(db: Session, product_id: int, payload: ProductImageCreateIn) -> ProductImage | None:
    product = db.get(Product, product_id)
    if not product:
        return None
    total = db.execute(
        select(func.count()).select_from(ProductImage).where(ProductImage.product_id == product_id)
    ).scalar_one()
    if total >= 20:
        raise ValueError("image_limit")
    data = payload.model_dump()
    _ensure_image_order_available(db, product_id, data.get("sort_order", 1))
    size_id = data.get("size_id")
    if size_id is not None:
        size = (
            db.execute(
                select(ProductSize).where(
                    ProductSize.id == size_id, ProductSize.product_id == product_id
                )
            )
            .scalars()
            .first()
        )
        if not size:
            raise ValueError("size_not_found")
    color_id = data.get("color_id")
    if color_id is not None:
        color = db.get(Color, color_id)
        if not color:
            raise ValueError("color_not_found")
    file_uuid = _resolve_uploaded_file_uuid(data.get("url"), data.get("file_uuid"))
    image = ProductImage(
        product_id=product_id,
        url=data["url"],
        sort_order=data.get("sort_order", 1),
        size_id=size_id,
        color_id=color_id,
        file_uuid=file_uuid,
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def delete_product_image(db: Session, image_id: int) -> bool:
    image = db.get(ProductImage, image_id)
    if not image:
        return False
    delete_media(image.url)
    db.delete(image)
    db.commit()
    return True


def update_product_image(db: Session, image_id: int, payload: ProductImageUpdateIn) -> ProductImage | None:
    image = db.get(ProductImage, image_id)
    if not image:
        return None
    data = payload.model_dump(exclude_unset=True)
    if "sort_order" in data and data["sort_order"] is not None:
        _ensure_image_order_available(db, image.product_id, data["sort_order"], exclude_id=image_id)
    if "size_id" in data:
        size_id = data.get("size_id")
        if size_id is not None:
            size = (
                db.execute(
                    select(ProductSize).where(
                        ProductSize.id == size_id, ProductSize.product_id == image.product_id
                    )
                )
                .scalars()
                .first()
            )
            if not size:
                raise ValueError("size_not_found")
    if "color_id" in data:
        color_id = data.get("color_id")
        if color_id is not None:
            color = db.get(Color, color_id)
            if not color:
                raise ValueError("color_not_found")
    if "url" in data:
        new_url = data.get("url")
        if new_url != image.url and image.url:
            delete_media(image.url)
        image.url = new_url
        if data.get("file_uuid") is not None:
            image.file_uuid = data.get("file_uuid")
        else:
            image.file_uuid = extract_uuid_from_media_url(new_url) if new_url else None
        data.pop("file_uuid", None)
        data.pop("url", None)
    elif "file_uuid" in data:
        image.file_uuid = data.get("file_uuid")
        data.pop("file_uuid", None)
    for key, value in data.items():
        setattr(image, key, value)
    db.commit()
    db.refresh(image)
    return image


def reorder_product_images(db: Session, product_id: int, items: list[ReorderItem]) -> None:
    ids = [item.id for item in items]
    existing = (
        db.execute(
            select(ProductImage).where(ProductImage.id.in_(ids), ProductImage.product_id == product_id)
        )
        .scalars()
        .all()
    )
    if len(existing) != len(ids):
        raise ValueError("not_found")
    order_map = {item.id: item.sort_order for item in items}
    for image in existing:
        image.sort_order = order_map[image.id]
    db.commit()


def list_categories(db: Session, page: int, page_size: int) -> tuple[list[Category], int]:
    total = db.execute(select(func.count()).select_from(Category)).scalar_one()
    items = (
        db.execute(
            select(Category)
            .order_by(Category.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def create_category(db: Session, payload: CategoryCreateIn) -> Category:
    total = db.execute(select(func.count()).select_from(Category)).scalar_one()
    if total >= 20:
        raise ValueError("category_limit")
    data = payload.model_dump()
    if not data.get("image_uuid") and data.get("image_url"):
        data["image_uuid"] = extract_uuid_from_media_url(data["image_url"])
    category = Category(**data)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: int, payload: CategoryUpdateIn) -> Category | None:
    category = db.get(Category, category_id)
    if not category:
        return None
    data = payload.model_dump(exclude_unset=True)
    if "image_url" in data:
        new_url = data.get("image_url")
        if new_url != category.image_url and category.image_url:
            delete_media(category.image_url)
        category.image_url = new_url
        if data.get("image_uuid") is not None:
            category.image_uuid = data.get("image_uuid")
        else:
            category.image_uuid = extract_uuid_from_media_url(new_url) if new_url else None
        data.pop("image_uuid", None)
        data.pop("image_url", None)
    elif "image_uuid" in data:
        category.image_uuid = data.get("image_uuid")
        data.pop("image_uuid", None)
    for key, value in data.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> bool:
    category = db.get(Category, category_id)
    if not category:
        return False
    if category.image_url:
        delete_media(category.image_url)
    db.delete(category)
    db.commit()
    return True


def list_colors(db: Session, page: int, page_size: int) -> tuple[list[Color], int]:
    total = db.execute(select(func.count()).select_from(Color)).scalar_one()
    items = (
        db.execute(
            select(Color)
            .order_by(Color.name.asc(), Color.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def create_color(db: Session, payload: ColorCreateIn) -> Color:
    existing = db.execute(select(Color).where(Color.name == payload.name)).scalars().first()
    if existing:
        raise ValueError("color_exists")
    color = Color(**payload.model_dump())
    db.add(color)
    db.commit()
    db.refresh(color)
    return color


def update_color(db: Session, color_id: int, payload: ColorUpdateIn) -> Color | None:
    color = db.get(Color, color_id)
    if not color:
        return None
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and data["name"] is not None:
        existing = (
            db.execute(select(Color).where(Color.name == data["name"], Color.id != color_id))
            .scalars()
            .first()
        )
        if existing:
            raise ValueError("color_exists")
    for key, value in data.items():
        setattr(color, key, value)
    db.commit()
    db.refresh(color)
    return color


def delete_color(db: Session, color_id: int) -> bool:
    color = db.get(Color, color_id)
    if not color:
        return False
    db.delete(color)
    db.commit()
    return True


def list_product_sizes(
    db: Session,
    product_id: int,
    page: int,
    page_size: int,
) -> tuple[list[ProductSize], int] | None:
    product = db.get(Product, product_id)
    if not product:
        return None
    total = db.execute(
        select(func.count()).select_from(ProductSize).where(ProductSize.product_id == product_id)
    ).scalar_one()
    items = (
        db.execute(
            select(ProductSize)
            .where(ProductSize.product_id == product_id)
            .order_by(ProductSize.sort_order.asc(), ProductSize.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def add_product_size(
    db: Session, product_id: int, payload: ProductSizeCreateIn
) -> ProductSize | None:
    product = db.get(Product, product_id)
    if not product:
        return None
    size = ProductSize(product_id=product_id, **payload.model_dump())
    db.add(size)
    if not product.has_size:
        product.has_size = True
    db.commit()
    db.refresh(size)
    return size


def update_product_size(
    db: Session, size_id: int, payload: ProductSizeUpdateIn
) -> ProductSize | None:
    size = db.get(ProductSize, size_id)
    if not size:
        return None
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(size, key, value)
    db.commit()
    db.refresh(size)
    return size


def delete_product_size(db: Session, size_id: int) -> bool:
    size = db.get(ProductSize, size_id)
    if not size:
        return False
    product_id = size.product_id
    db.delete(size)
    db.commit()
    remaining = (
        db.execute(
            select(func.count()).select_from(ProductSize).where(ProductSize.product_id == product_id)
        ).scalar_one()
        > 0
    )
    if not remaining:
        product = db.get(Product, product_id)
        if product and product.has_size:
            product.has_size = False
            db.commit()
    return True


def reorder_product_sizes(db: Session, product_id: int, items: list[ReorderItem]) -> None:
    ids = [item.id for item in items]
    existing = (
        db.execute(select(ProductSize).where(ProductSize.id.in_(ids), ProductSize.product_id == product_id))
        .scalars()
        .all()
    )
    if len(existing) != len(ids):
        raise ValueError("not_found")
    order_map = {item.id: item.sort_order for item in items}
    for size in existing:
        size.sort_order = order_map[size.id]
    db.commit()


def get_about(db: Session) -> AboutPage:
    about = db.get(AboutPage, 1)
    if about is None:
        about = AboutPage(id=1, content=None, content_en=None)
        db.add(about)
        db.commit()
        db.refresh(about)
    return about


def list_about_images(db: Session, page: int, page_size: int) -> tuple[list[AboutImage], int]:
    total = db.execute(select(func.count()).select_from(AboutImage)).scalar_one()
    items = (
        db.execute(
            select(AboutImage)
            .order_by(AboutImage.sort_order.asc(), AboutImage.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def _ensure_about_image_order_available(
    db: Session,
    sort_order: int,
    exclude_id: int | None = None,
) -> None:
    stmt = select(AboutImage).where(AboutImage.sort_order == sort_order)
    if exclude_id is not None:
        stmt = stmt.where(AboutImage.id != exclude_id)
    existing = db.execute(stmt).scalars().first()
    if existing:
        raise ValueError("about_image_order_taken")


def add_about_image(db: Session, payload: AboutImageCreateIn) -> AboutImage:
    data = payload.model_dump()
    data["file_uuid"] = _resolve_uploaded_file_uuid(data.get("url"), data.get("file_uuid"))
    if data.get("sort_order") is not None:
        _ensure_about_image_order_available(db, data["sort_order"])
    image = AboutImage(**data)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def update_about_image(db: Session, image_id: int, payload: AboutImageUpdateIn) -> AboutImage | None:
    image = db.get(AboutImage, image_id)
    if not image:
        return None
    data = payload.model_dump(exclude_unset=True)
    if "sort_order" in data and data["sort_order"] is not None:
        _ensure_about_image_order_available(db, data["sort_order"], exclude_id=image_id)
    if "url" in data:
        new_url = data.get("url")
        if new_url != image.url and image.url:
            delete_media(image.url)
        image.url = new_url
        if data.get("file_uuid") is not None:
            image.file_uuid = data.get("file_uuid")
        else:
            image.file_uuid = extract_uuid_from_media_url(new_url) if new_url else None
        data.pop("file_uuid", None)
        data.pop("url", None)
    elif "file_uuid" in data:
        image.file_uuid = data.get("file_uuid")
        data.pop("file_uuid", None)
    for key, value in data.items():
        setattr(image, key, value)
    db.commit()
    db.refresh(image)
    return image


def delete_about_image(db: Session, image_id: int) -> bool:
    image = db.get(AboutImage, image_id)
    if not image:
        return False
    delete_media(image.url)
    db.delete(image)
    db.commit()
    return True


def reorder_about_images(db: Session, items: list[ReorderItem]) -> None:
    ids = [item.id for item in items]
    existing = db.execute(select(AboutImage).where(AboutImage.id.in_(ids))).scalars().all()
    if len(existing) != len(ids):
        raise ValueError("not_found")
    order_map = {item.id: item.sort_order for item in items}
    for image in existing:
        image.sort_order = order_map[image.id]
    db.commit()


def list_project_categories(db: Session, page: int, page_size: int) -> tuple[list[ProjectCategory], int]:
    total = db.execute(select(func.count()).select_from(ProjectCategory)).scalar_one()
    items = (
        db.execute(
            select(ProjectCategory)
            .order_by(ProjectCategory.name.asc(), ProjectCategory.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def create_project_category(db: Session, payload: ProjectCategoryCreateIn) -> ProjectCategory:
    category = ProjectCategory(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_project_category(
    db: Session, category_id: int, payload: ProjectCategoryUpdateIn
) -> ProjectCategory | None:
    category = db.get(ProjectCategory, category_id)
    if not category:
        return None
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


def delete_project_category(db: Session, category_id: int) -> bool:
    category = db.get(ProjectCategory, category_id)
    if not category:
        return False
    db.delete(category)
    db.commit()
    return True


def list_projects(
    db: Session, page: int, page_size: int, q: str | None, is_active: bool | None
) -> tuple[list[Project], int]:
    stmt = select(Project)
    count_stmt = select(func.count()).select_from(Project)
    filters = []
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
    if is_active is not None:
        filters.append(Project.is_active.is_(is_active))
    if filters:
        stmt = stmt.where(*filters)
        count_stmt = count_stmt.where(*filters)
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


def _load_project_category(db: Session, category_id: int | None) -> ProjectCategory | None:
    if category_id is None:
        return None
    return db.get(ProjectCategory, category_id)


def create_project(db: Session, payload: ProjectCreateIn) -> Project:
    data = payload.model_dump()
    category_id = data.pop("category_id", None)
    if not data.get("featured_image_uuid") and data.get("featured_image_url"):
        data["featured_image_uuid"] = extract_uuid_from_media_url(data["featured_image_url"])
    category = _load_project_category(db, category_id)
    if category_id is not None and not category:
        raise ValueError("project_category_not_found")
    project = Project(**data)
    project.category = category
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project_id: int, payload: ProjectUpdateIn) -> Project | None:
    project = db.get(Project, project_id)
    if not project:
        return None
    data = payload.model_dump(exclude_unset=True)
    category_id = data.pop("category_id", None) if "category_id" in data else None
    if "featured_image_url" in data:
        new_url = data.get("featured_image_url")
        if new_url != project.featured_image_url and project.featured_image_url:
            delete_media(project.featured_image_url)
        project.featured_image_url = new_url
        if data.get("featured_image_uuid") is not None:
            project.featured_image_uuid = data.get("featured_image_uuid")
        else:
            project.featured_image_uuid = extract_uuid_from_media_url(new_url) if new_url else None
        data.pop("featured_image_uuid", None)
        data.pop("featured_image_url", None)
    elif "featured_image_uuid" in data:
        project.featured_image_uuid = data.get("featured_image_uuid")
        data.pop("featured_image_uuid", None)
    for key, value in data.items():
        setattr(project, key, value)
    if "category_id" in payload.model_dump(exclude_unset=True):
        category = _load_project_category(db, category_id)
        if category_id is not None and not category:
            raise ValueError("project_category_not_found")
        project.category = category
    db.commit()
    db.refresh(project)
    return project


def get_project_detail(db: Session, project_id: int) -> Project | None:
    stmt = (
        select(Project)
        .where(Project.id == project_id)
        .options(
            selectinload(Project.images),
            selectinload(Project.category),
            selectinload(Project.review),
        )
    )
    project = db.execute(stmt).scalars().first()
    if project:
        project.images.sort(key=lambda img: (img.kind, img.sort_order, img.id))
    return project


def delete_project(db: Session, project_id: int) -> bool:
    project = (
        db.execute(
            select(Project)
            .where(Project.id == project_id)
            .options(selectinload(Project.images), selectinload(Project.review))
        )
        .scalars()
        .first()
    )
    if not project:
        return False
    urls = []
    if project.featured_image_url:
        urls.append(project.featured_image_url)
    urls.extend([img.url for img in project.images])
    for url in urls:
        delete_media(url)
    db.delete(project)
    db.commit()
    return True


def _ensure_project_image_order_available(
    db: Session,
    project_id: int,
    kind: str,
    sort_order: int,
    exclude_id: int | None = None,
) -> None:
    stmt = select(ProjectImage).where(
        ProjectImage.project_id == project_id,
        ProjectImage.kind == kind,
        ProjectImage.sort_order == sort_order,
    )
    if exclude_id is not None:
        stmt = stmt.where(ProjectImage.id != exclude_id)
    existing = db.execute(stmt).scalars().first()
    if existing:
        raise ValueError("project_image_order_taken")


def add_project_image(
    db: Session, project_id: int, payload: ProjectImageCreateIn
) -> ProjectImage | None:
    project = db.get(Project, project_id)
    if not project:
        return None
    data = payload.model_dump()
    kind = data.get("kind")
    if kind not in {"gallery", "before", "after"}:
        raise ValueError("project_image_kind_invalid")
    if data.get("sort_order") is not None:
        _ensure_project_image_order_available(db, project_id, kind, data["sort_order"])
    data["file_uuid"] = _resolve_uploaded_file_uuid(data.get("url"), data.get("file_uuid"))
    image = ProjectImage(project_id=project_id, **data)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def update_project_image(
    db: Session, image_id: int, payload: ProjectImageUpdateIn
) -> ProjectImage | None:
    image = db.get(ProjectImage, image_id)
    if not image:
        return None
    data = payload.model_dump(exclude_unset=True)
    kind = data.get("kind", image.kind)
    if kind not in {"gallery", "before", "after"}:
        raise ValueError("project_image_kind_invalid")
    if "sort_order" in data and data["sort_order"] is not None:
        _ensure_project_image_order_available(db, image.project_id, kind, data["sort_order"], exclude_id=image_id)
    elif "kind" in data and data["kind"] is not None and data["kind"] != image.kind:
        _ensure_project_image_order_available(db, image.project_id, kind, image.sort_order, exclude_id=image_id)
    if "url" in data:
        new_url = data.get("url")
        if new_url != image.url and image.url:
            delete_media(image.url)
        image.url = new_url
        if data.get("file_uuid") is not None:
            image.file_uuid = data.get("file_uuid")
        else:
            image.file_uuid = extract_uuid_from_media_url(new_url) if new_url else None
        data.pop("file_uuid", None)
        data.pop("url", None)
    elif "file_uuid" in data:
        image.file_uuid = data.get("file_uuid")
        data.pop("file_uuid", None)
    if "kind" in data:
        image.kind = data.get("kind")
        data.pop("kind", None)
    for key, value in data.items():
        setattr(image, key, value)
    db.commit()
    db.refresh(image)
    return image


def delete_project_image(db: Session, image_id: int) -> bool:
    image = db.get(ProjectImage, image_id)
    if not image:
        return False
    delete_media(image.url)
    db.delete(image)
    db.commit()
    return True


def reorder_project_images(db: Session, project_id: int, items: list[ReorderItem], kind: str) -> None:
    if kind not in {"gallery", "before", "after"}:
        raise ValueError("project_image_kind_invalid")
    ids = [item.id for item in items]
    existing = (
        db.execute(
            select(ProjectImage).where(
                ProjectImage.id.in_(ids),
                ProjectImage.project_id == project_id,
                ProjectImage.kind == kind,
            )
        )
        .scalars()
        .all()
    )
    if len(existing) != len(ids):
        raise ValueError("not_found")
    order_map = {item.id: item.sort_order for item in items}
    for image in existing:
        image.sort_order = order_map[image.id]
    db.commit()


def upsert_project_review(
    db: Session, project_id: int, payload: ProjectReviewUpsertIn
) -> ProjectReview | None:
    project = db.get(Project, project_id)
    if not project:
        return None
    review = db.execute(select(ProjectReview).where(ProjectReview.project_id == project_id)).scalars().first()
    if review:
        review.customer_name = payload.customer_name
        review.comment = payload.comment
    else:
        review = ProjectReview(project_id=project_id, **payload.model_dump())
        db.add(review)
    db.commit()
    db.refresh(review)
    return review


def delete_project_review(db: Session, project_id: int) -> bool:
    review = db.execute(select(ProjectReview).where(ProjectReview.project_id == project_id)).scalars().first()
    if not review:
        return False
    db.delete(review)
    db.commit()
    return True


def list_reference_logos(db: Session, page: int, page_size: int) -> tuple[list[ReferenceLogo], int]:
    total = db.execute(select(func.count()).select_from(ReferenceLogo)).scalar_one()
    items = (
        db.execute(
            select(ReferenceLogo)
            .order_by(ReferenceLogo.sort_order.asc(), ReferenceLogo.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def _ensure_reference_logo_order_available(
    db: Session,
    sort_order: int,
    exclude_id: int | None = None,
) -> None:
    stmt = select(ReferenceLogo).where(ReferenceLogo.sort_order == sort_order)
    if exclude_id is not None:
        stmt = stmt.where(ReferenceLogo.id != exclude_id)
    existing = db.execute(stmt).scalars().first()
    if existing:
        raise ValueError("reference_logo_order_taken")


def add_reference_logo(db: Session, payload: ReferenceLogoCreateIn) -> ReferenceLogo:
    data = payload.model_dump()
    if data.get("sort_order") is not None:
        _ensure_reference_logo_order_available(db, data["sort_order"])
    data["file_uuid"] = _resolve_uploaded_file_uuid(data.get("url"), data.get("file_uuid"))
    logo = ReferenceLogo(**data)
    db.add(logo)
    db.commit()
    db.refresh(logo)
    return logo


def update_reference_logo(
    db: Session, logo_id: int, payload: ReferenceLogoUpdateIn
) -> ReferenceLogo | None:
    logo = db.get(ReferenceLogo, logo_id)
    if not logo:
        return None
    data = payload.model_dump(exclude_unset=True)
    if "sort_order" in data and data["sort_order"] is not None:
        _ensure_reference_logo_order_available(db, data["sort_order"], exclude_id=logo_id)
    if "url" in data:
        new_url = data.get("url")
        if new_url != logo.url and logo.url:
            delete_media(logo.url)
        logo.url = new_url
        if data.get("file_uuid") is not None:
            logo.file_uuid = data.get("file_uuid")
        else:
            logo.file_uuid = extract_uuid_from_media_url(new_url) if new_url else None
        data.pop("file_uuid", None)
        data.pop("url", None)
    elif "file_uuid" in data:
        logo.file_uuid = data.get("file_uuid")
        data.pop("file_uuid", None)
    for key, value in data.items():
        setattr(logo, key, value)
    db.commit()
    db.refresh(logo)
    return logo


def delete_reference_logo(db: Session, logo_id: int) -> bool:
    logo = db.get(ReferenceLogo, logo_id)
    if not logo:
        return False
    delete_media(logo.url)
    db.delete(logo)
    db.commit()
    return True


def reorder_reference_logos(db: Session, items: list[ReorderItem]) -> None:
    ids = [item.id for item in items]
    existing = db.execute(select(ReferenceLogo).where(ReferenceLogo.id.in_(ids))).scalars().all()
    if len(existing) != len(ids):
        raise ValueError("not_found")
    order_map = {item.id: item.sort_order for item in items}
    for logo in existing:
        logo.sort_order = order_map[logo.id]
    db.commit()


def list_home_project_images(db: Session, page: int, page_size: int) -> tuple[list[HomeProjectImage], int]:
    total = db.execute(select(func.count()).select_from(HomeProjectImage)).scalar_one()
    items = (
        db.execute(
            select(HomeProjectImage)
            .order_by(HomeProjectImage.sort_order.asc(), HomeProjectImage.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def _ensure_home_project_image_order_available(
    db: Session, sort_order: int, exclude_id: int | None = None
) -> None:
    stmt = select(HomeProjectImage).where(HomeProjectImage.sort_order == sort_order)
    if exclude_id is not None:
        stmt = stmt.where(HomeProjectImage.id != exclude_id)
    existing = db.execute(stmt).scalars().first()
    if existing:
        raise ValueError("home_project_image_order_taken")


def add_home_project_image(db: Session, payload: HomeProjectImageCreateIn) -> HomeProjectImage:
    _ensure_home_project_image_order_available(db, payload.sort_order)
    image = db.get(ProjectImage, payload.project_image_id)
    if not image:
        raise ValueError("project_image_not_found")
    home_image = HomeProjectImage(
        project_image_id=payload.project_image_id,
        sort_order=payload.sort_order,
    )
    db.add(home_image)
    db.commit()
    db.refresh(home_image)
    return home_image


def delete_home_project_image(db: Session, image_id: int) -> bool:
    home_image = db.get(HomeProjectImage, image_id)
    if not home_image:
        return False
    db.delete(home_image)
    db.commit()
    return True


def reorder_home_project_images(db: Session, items: list[ReorderItem]) -> None:
    ids = [item.id for item in items]
    existing = db.execute(select(HomeProjectImage).where(HomeProjectImage.id.in_(ids))).scalars().all()
    if len(existing) != len(ids):
        raise ValueError("not_found")
    order_map = {item.id: item.sort_order for item in items}
    for image in existing:
        image.sort_order = order_map[image.id]
    db.commit()


def update_about(db: Session, payload: AboutUpdateIn) -> AboutPage:
    about = get_about(db)
    if payload.content is not None:
        about.content = payload.content
    if payload.content_en is not None:
        about.content_en = payload.content_en
    db.commit()
    db.refresh(about)
    return about


def list_social_links(db: Session, page: int, page_size: int) -> tuple[list[SocialLink], int]:
    total = db.execute(select(func.count()).select_from(SocialLink)).scalar_one()
    items = (
        db.execute(
            select(SocialLink)
            .order_by(SocialLink.sort_order.asc(), SocialLink.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def create_social_link(db: Session, payload: SocialLinkCreateIn) -> SocialLink:
    link = SocialLink(**payload.model_dump())
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def update_social_link(db: Session, link_id: int, payload: SocialLinkUpdateIn) -> SocialLink | None:
    link = db.get(SocialLink, link_id)
    if not link:
        return None
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(link, key, value)
    db.commit()
    db.refresh(link)
    return link


def delete_social_link(db: Session, link_id: int) -> bool:
    link = db.get(SocialLink, link_id)
    if not link:
        return False
    db.delete(link)
    db.commit()
    return True


def reorder_social_links(db: Session, items: list[ReorderItem]) -> None:
    ids = [item.id for item in items]
    existing = db.execute(select(SocialLink).where(SocialLink.id.in_(ids))).scalars().all()
    if len(existing) != len(ids):
        raise ValueError("not_found")
    order_map = {item.id: item.sort_order for item in items}
    for link in existing:
        link.sort_order = order_map[link.id]
    db.commit()


def list_quote_requests(
    db: Session, page: int, page_size: int, status: str | None
) -> tuple[list[QuoteRequest], int]:
    stmt = select(QuoteRequest)
    count_stmt = select(func.count()).select_from(QuoteRequest)
    if status:
        stmt = stmt.where(QuoteRequest.status == status)
        count_stmt = count_stmt.where(QuoteRequest.status == status)
    total = db.execute(count_stmt).scalar_one()
    items = (
        db.execute(
            stmt.order_by(QuoteRequest.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def update_quote_request_status(
    db: Session, request_id: int, payload: QuoteRequestStatusUpdateIn
) -> QuoteRequest | None:
    quote = db.get(QuoteRequest, request_id)
    if not quote:
        return None
    quote.status = payload.status
    db.commit()
    db.refresh(quote)
    return quote
