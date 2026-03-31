from __future__ import annotations

from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth import create_access_token, decode_token, TokenError
from app.db import get_db
from app.models import AdminUser
from app.schemas.admin import (
    AboutOut,
    AboutUpdateIn,
    AboutImageCreateIn,
    AboutImageListOut,
    AboutImageOut,
    AboutImageUpdateIn,
    CategoryCreateIn,
    CategoryListOut,
    CategoryOut,
    CategoryUpdateIn,
    ColorCreateIn,
    ColorListOut,
    ColorOut,
    ColorUpdateIn,
    HomeSectionCreateIn,
    HomeSectionListOut,
    HomeSectionOut,
    HomeSectionUpdateIn,
    HomeProjectImageCreateIn,
    HomeProjectImageListOut,
    HomeProjectImageOut,
    ProductCreateIn,
    ProductDetailOut,
    ProductImageCreateIn,
    ProductImageOut,
    ProductImageUpdateIn,
    ProductListOut,
    ProductOut,
    ProductSizeCreateIn,
    ProductSizeListOut,
    ProductSizeOut,
    ProductSizeUpdateIn,
    ProductUpdateIn,
    ProjectCategoryCreateIn,
    ProjectCategoryListOut,
    ProjectCategoryOut,
    ProjectCategoryUpdateIn,
    ProjectCreateIn,
    ProjectDetailOut,
    ProjectImageCreateIn,
    ProjectImageOut,
    ProjectImageUpdateIn,
    ProjectListOut,
    ProjectOut,
    ProjectReviewOut,
    ProjectReviewUpsertIn,
    ProjectUpdateIn,
    QuoteRequestListOut,
    QuoteRequestOut,
    QuoteRequestStatusUpdateIn,
    ReorderItem,
    ContactMapsOut,
    ContactMapsUpdateIn,
    SiteSettingsOut,
    SiteSettingsUpdateIn,
    SocialLinkCreateIn,
    SocialLinkListOut,
    SocialLinkOut,
    SocialLinkUpdateIn,
    UploadOut,
    ReferenceLogoCreateIn,
    ReferenceLogoListOut,
    ReferenceLogoOut,
    ReferenceLogoUpdateIn,
)
from app.schemas.auth import AdminLoginRequest, AdminMeResponse, TokenResponse
from app.services import admin_service
from app.services.admin_auth import authenticate_admin
from app.services import media_utils

router = APIRouter(prefix="/admin", tags=["admin"])

security = HTTPBearer()


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> AdminUser:
    try:
        subject = decode_token(credentials.credentials)
    except TokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    admin = db.get(AdminUser, int(subject))
    if not admin or not admin.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return admin


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: AdminLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    admin = authenticate_admin(db, payload.email, payload.password)
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(str(admin.id))
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=AdminMeResponse)
def me(current_admin: AdminUser = Depends(get_current_admin)) -> AdminMeResponse:
    return current_admin


@router.post("/uploads", response_model=UploadOut, status_code=status.HTTP_201_CREATED)
def upload_media(
    file: UploadFile = File(...),
    current_admin: AdminUser = Depends(get_current_admin),
) -> UploadOut:
    try:
        file_uuid, url = media_utils.save_upload(file)
    except ValueError as exc:
        if str(exc) == "invalid_extension":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type") from exc
        if str(exc) == "file_too_large":
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large") from exc
        raise
    return UploadOut(uuid=file_uuid, url=url)


@router.get("/site-settings", response_model=SiteSettingsOut)
def get_site_settings(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> SiteSettingsOut:
    return admin_service.get_site_settings(db)


@router.put("/site-settings", response_model=SiteSettingsOut)
def update_site_settings(
    payload: SiteSettingsUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> SiteSettingsOut:
    return admin_service.update_site_settings(db, payload)


@router.put("/contact-maps", response_model=ContactMapsOut)
def update_contact_maps(
    payload: ContactMapsUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ContactMapsOut:
    settings = admin_service.update_contact_maps(db, payload)
    return ContactMapsOut(
        maps_embed_url=settings.maps_embed_url,
        maps_directions_url=settings.maps_directions_url,
    )


@router.get("/home-sections", response_model=HomeSectionListOut)
def list_home_sections(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> HomeSectionListOut:
    items, total = admin_service.list_home_sections(db, page, page_size)
    return HomeSectionListOut(items=items, page=page, page_size=page_size, total=total)


@router.post("/home-sections", response_model=HomeSectionOut, status_code=status.HTTP_201_CREATED)
def create_home_section(
    payload: HomeSectionCreateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> HomeSectionOut:
    return admin_service.create_home_section(db, payload)


@router.put("/home-sections/{section_id}", response_model=HomeSectionOut)
def update_home_section(
    section_id: int,
    payload: HomeSectionUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> HomeSectionOut:
    section = admin_service.update_home_section(db, section_id, payload)
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return section


@router.delete("/home-sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_home_section(
    section_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_home_section(db, section_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.post("/home-sections/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_home_sections(
    payload: list[ReorderItem],
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    try:
        admin_service.reorder_home_sections(db, payload)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/products", response_model=ProductListOut)
def list_products(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    q: str | None = Query(default=None, max_length=100),
    is_active: bool | None = None,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductListOut:
    items, total = admin_service.list_products(db, page, page_size, q, is_active)
    return ProductListOut(items=items, page=page, page_size=page_size, total=total)


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductOut:
    try:
        return admin_service.create_product(db, payload)
    except ValueError as exc:
        if str(exc) == "category_not_found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found") from exc
        if str(exc) == "color_not_found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Color not found") from exc
        raise


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductOut:
    try:
        product = admin_service.update_product(db, product_id, payload)
    except ValueError as exc:
        if str(exc) == "category_not_found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found") from exc
        if str(exc) == "color_not_found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Color not found") from exc
        raise
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return product


@router.get("/products/{product_id}", response_model=ProductDetailOut)
def get_product_detail(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductDetailOut:
    product = admin_service.get_product_detail(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_product(db, product_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.post(
    "/products/{product_id}/images", response_model=ProductImageOut, status_code=status.HTTP_201_CREATED
)
def add_product_image(
    product_id: int,
    file: UploadFile = File(...),
    sort_order: int = Form(default=1, ge=1),
    size_id: int | None = Form(default=None),
    color_id: int | None = Form(default=None),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductImageOut:
    try:
        file_uuid, url = media_utils.save_upload(file)
    except ValueError as exc:
        if str(exc) == "invalid_extension":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type") from exc
        if str(exc) == "file_too_large":
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large") from exc
        raise
    payload = ProductImageCreateIn(
        url=url,
        file_uuid=file_uuid,
        sort_order=sort_order,
        size_id=size_id,
        color_id=color_id,
    )
    try:
        image = admin_service.add_product_image(db, product_id, payload)
    except ValueError as exc:
        media_utils.delete_media(url)
        if str(exc) == "image_limit":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image limit reached") from exc
        if str(exc) == "image_order_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Image order already used") from exc
        if str(exc) == "size_not_found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Size not found") from exc
        if str(exc) == "color_not_found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Color not found") from exc
        if str(exc) == "invalid_media_url":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid media URL. Upload via /admin/uploads",
            ) from exc
        if str(exc) == "file_uuid_mismatch":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File UUID mismatch") from exc
        raise
    if not image:
        media_utils.delete_media(url)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return image


@router.delete("/product-images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_product_image(db, image_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.put("/product-images/{image_id}", response_model=ProductImageOut)
def update_product_image(
    image_id: int,
    payload: ProductImageUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductImageOut:
    try:
        image = admin_service.update_product_image(db, image_id, payload)
    except ValueError as exc:
        if str(exc) == "image_order_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Image order already used") from exc
        if str(exc) == "size_not_found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Size not found") from exc
        if str(exc) == "color_not_found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Color not found") from exc
        raise
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return image


@router.post("/products/{product_id}/images/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_product_images(
    product_id: int,
    payload: list[ReorderItem],
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    try:
        admin_service.reorder_product_images(db, product_id, payload)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/categories", response_model=CategoryListOut)
def list_categories(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> CategoryListOut:
    items, total = admin_service.list_categories(db, page, page_size)
    return CategoryListOut(items=items, page=page, page_size=page_size, total=total)


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> CategoryOut:
    try:
        return admin_service.create_category(db, payload)
    except ValueError as exc:
        if str(exc) == "category_limit":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category limit reached") from exc
        raise


@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    payload: CategoryUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> CategoryOut:
    category = admin_service.update_category(db, category_id, payload)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_category(db, category_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/colors", response_model=ColorListOut)
def list_colors(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ColorListOut:
    items, total = admin_service.list_colors(db, page, page_size)
    return ColorListOut(items=items, page=page, page_size=page_size, total=total)


@router.post("/colors", response_model=ColorOut, status_code=status.HTTP_201_CREATED)
def create_color(
    payload: ColorCreateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ColorOut:
    try:
        return admin_service.create_color(db, payload)
    except ValueError as exc:
        if str(exc) == "color_exists":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Color already exists") from exc
        raise


@router.put("/colors/{color_id}", response_model=ColorOut)
def update_color(
    color_id: int,
    payload: ColorUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ColorOut:
    try:
        color = admin_service.update_color(db, color_id, payload)
    except ValueError as exc:
        if str(exc) == "color_exists":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Color already exists") from exc
        raise
    if not color:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return color


@router.delete("/colors/{color_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_color(
    color_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_color(db, color_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/products/{product_id}/sizes", response_model=ProductSizeListOut)
def list_product_sizes(
    product_id: int,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductSizeListOut:
    result = admin_service.list_product_sizes(db, product_id, page, page_size)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    items, total = result
    return ProductSizeListOut(items=items, page=page, page_size=page_size, total=total)


@router.post("/products/{product_id}/sizes", response_model=ProductSizeOut, status_code=status.HTTP_201_CREATED)
def add_product_size(
    product_id: int,
    payload: ProductSizeCreateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductSizeOut:
    size = admin_service.add_product_size(db, product_id, payload)
    if not size:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return size


@router.put("/product-sizes/{size_id}", response_model=ProductSizeOut)
def update_product_size(
    size_id: int,
    payload: ProductSizeUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductSizeOut:
    size = admin_service.update_product_size(db, size_id, payload)
    if not size:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return size


@router.delete("/product-sizes/{size_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_size(
    size_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_product_size(db, size_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.post("/products/{product_id}/sizes/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_product_sizes(
    product_id: int,
    payload: list[ReorderItem],
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    try:
        admin_service.reorder_product_sizes(db, product_id, payload)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/project-categories", response_model=ProjectCategoryListOut)
def list_project_categories(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProjectCategoryListOut:
    items, total = admin_service.list_project_categories(db, page, page_size)
    return ProjectCategoryListOut(items=items, page=page, page_size=page_size, total=total)


@router.post("/project-categories", response_model=ProjectCategoryOut, status_code=status.HTTP_201_CREATED)
def create_project_category(
    payload: ProjectCategoryCreateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProjectCategoryOut:
    return admin_service.create_project_category(db, payload)


@router.put("/project-categories/{category_id}", response_model=ProjectCategoryOut)
def update_project_category(
    category_id: int,
    payload: ProjectCategoryUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProjectCategoryOut:
    category = admin_service.update_project_category(db, category_id, payload)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return category


@router.delete("/project-categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_project_category(db, category_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/projects", response_model=ProjectListOut)
def list_projects(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    q: str | None = Query(default=None, max_length=100),
    is_active: bool | None = None,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProjectListOut:
    items, total = admin_service.list_projects(db, page, page_size, q, is_active)
    return ProjectListOut(items=items, page=page, page_size=page_size, total=total)


@router.post("/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProjectOut:
    try:
        return admin_service.create_project(db, payload)
    except ValueError as exc:
        if str(exc) == "project_category_not_found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found") from exc
        raise


@router.put("/projects/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    payload: ProjectUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProjectOut:
    try:
        project = admin_service.update_project(db, project_id, payload)
    except ValueError as exc:
        if str(exc) == "project_category_not_found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found") from exc
        raise
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return project


@router.get("/projects/{project_id}", response_model=ProjectDetailOut)
def get_project_detail(
    project_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProjectDetailOut:
    project = admin_service.get_project_detail(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_project(db, project_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.post("/projects/{project_id}/images", response_model=ProjectImageOut, status_code=status.HTTP_201_CREATED)
def add_project_image(
    project_id: int,
    file: UploadFile = File(...),
    kind: str = Form(..., max_length=20),
    sort_order: int = Form(default=0, ge=0),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProjectImageOut:
    try:
        file_uuid, url = media_utils.save_upload(file)
    except ValueError as exc:
        if str(exc) == "invalid_extension":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type") from exc
        if str(exc) == "file_too_large":
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large") from exc
        raise
    payload = ProjectImageCreateIn(
        kind=kind,
        url=url,
        file_uuid=file_uuid,
        sort_order=sort_order,
    )
    try:
        image = admin_service.add_project_image(db, project_id, payload)
    except ValueError as exc:
        media_utils.delete_media(url)
        if str(exc) == "project_image_order_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Image order already used") from exc
        if str(exc) == "project_image_kind_invalid":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image kind") from exc
        if str(exc) == "invalid_media_url":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid media URL. Upload via /admin/uploads",
            ) from exc
        if str(exc) == "file_uuid_mismatch":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File UUID mismatch") from exc
        raise
    if not image:
        media_utils.delete_media(url)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return image


@router.put("/project-images/{image_id}", response_model=ProjectImageOut)
def update_project_image(
    image_id: int,
    payload: ProjectImageUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProjectImageOut:
    try:
        image = admin_service.update_project_image(db, image_id, payload)
    except ValueError as exc:
        if str(exc) == "project_image_order_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Image order already used") from exc
        if str(exc) == "project_image_kind_invalid":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image kind") from exc
        raise
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return image


@router.delete("/project-images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_project_image(db, image_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.post("/projects/{project_id}/images/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_project_images(
    project_id: int,
    kind: str = Query(..., max_length=20),
    payload: list[ReorderItem] = Body(...),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    try:
        admin_service.reorder_project_images(db, project_id, payload, kind)
    except ValueError as exc:
        if str(exc) == "project_image_kind_invalid":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image kind") from exc
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found") from exc


@router.put("/projects/{project_id}/review", response_model=ProjectReviewOut)
def upsert_project_review(
    project_id: int,
    payload: ProjectReviewUpsertIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProjectReviewOut:
    review = admin_service.upsert_project_review(db, project_id, payload)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return review


@router.delete("/projects/{project_id}/review", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_review(
    project_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_project_review(db, project_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/reference-logos", response_model=ReferenceLogoListOut)
def list_reference_logos(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ReferenceLogoListOut:
    items, total = admin_service.list_reference_logos(db, page, page_size)
    return ReferenceLogoListOut(items=items, page=page, page_size=page_size, total=total)


@router.post("/reference-logos", response_model=ReferenceLogoOut, status_code=status.HTTP_201_CREATED)
def add_reference_logo(
    file: UploadFile = File(...),
    sort_order: int = Form(default=0, ge=0),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ReferenceLogoOut:
    try:
        file_uuid, url = media_utils.save_upload(file)
    except ValueError as exc:
        if str(exc) == "invalid_extension":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type") from exc
        if str(exc) == "file_too_large":
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large") from exc
        raise
    payload = ReferenceLogoCreateIn(url=url, file_uuid=file_uuid, sort_order=sort_order)
    try:
        return admin_service.add_reference_logo(db, payload)
    except ValueError as exc:
        media_utils.delete_media(url)
        if str(exc) == "reference_logo_order_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Sort order already used") from exc
        if str(exc) == "invalid_media_url":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid media URL. Upload via /admin/uploads",
            ) from exc
        if str(exc) == "file_uuid_mismatch":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File UUID mismatch") from exc
        raise


@router.put("/reference-logos/{logo_id}", response_model=ReferenceLogoOut)
def update_reference_logo(
    logo_id: int,
    payload: ReferenceLogoUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ReferenceLogoOut:
    try:
        logo = admin_service.update_reference_logo(db, logo_id, payload)
    except ValueError as exc:
        if str(exc) == "reference_logo_order_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Sort order already used") from exc
        raise
    if not logo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return logo


@router.delete("/reference-logos/{logo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reference_logo(
    logo_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_reference_logo(db, logo_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.post("/reference-logos/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_reference_logos(
    payload: list[ReorderItem],
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    try:
        admin_service.reorder_reference_logos(db, payload)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/home-project-images", response_model=HomeProjectImageListOut)
def list_home_project_images(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> HomeProjectImageListOut:
    items, total = admin_service.list_home_project_images(db, page, page_size)
    return HomeProjectImageListOut(items=items, page=page, page_size=page_size, total=total)


@router.post("/home-project-images", response_model=HomeProjectImageOut, status_code=status.HTTP_201_CREATED)
def add_home_project_image(
    payload: HomeProjectImageCreateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> HomeProjectImageOut:
    try:
        return admin_service.add_home_project_image(db, payload)
    except ValueError as exc:
        if str(exc) == "home_project_image_order_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Sort order already used") from exc
        if str(exc) == "project_image_not_found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project image not found") from exc
        raise


@router.delete("/home-project-images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_home_project_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_home_project_image(db, image_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.post("/home-project-images/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_home_project_images(
    payload: list[ReorderItem],
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    try:
        admin_service.reorder_home_project_images(db, payload)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/about", response_model=AboutOut)
def get_about(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> AboutOut:
    return admin_service.get_about(db)


@router.put("/about", response_model=AboutOut)
def update_about(
    payload: AboutUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> AboutOut:
    return admin_service.update_about(db, payload)


@router.get("/about/images", response_model=AboutImageListOut)
def list_about_images(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> AboutImageListOut:
    items, total = admin_service.list_about_images(db, page, page_size)
    return AboutImageListOut(items=items, page=page, page_size=page_size, total=total)


@router.post("/about/images", response_model=AboutImageOut, status_code=status.HTTP_201_CREATED)
def add_about_image(
    file: UploadFile = File(...),
    sort_order: int = Form(default=0, ge=0),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> AboutImageOut:
    try:
        file_uuid, url = media_utils.save_upload(file)
    except ValueError as exc:
        if str(exc) == "invalid_extension":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type") from exc
        if str(exc) == "file_too_large":
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large") from exc
        raise
    payload = AboutImageCreateIn(url=url, file_uuid=file_uuid, sort_order=sort_order)
    try:
        return admin_service.add_about_image(db, payload)
    except ValueError as exc:
        media_utils.delete_media(url)
        if str(exc) == "about_image_order_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Sort order already used") from exc
        if str(exc) == "invalid_media_url":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid media URL. Upload via /admin/uploads",
            ) from exc
        if str(exc) == "file_uuid_mismatch":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File UUID mismatch") from exc
        raise


@router.put("/about/images/{image_id}", response_model=AboutImageOut)
def update_about_image(
    image_id: int,
    payload: AboutImageUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> AboutImageOut:
    try:
        image = admin_service.update_about_image(db, image_id, payload)
    except ValueError as exc:
        if str(exc) == "about_image_order_taken":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Sort order already used") from exc
        raise
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return image


@router.delete("/about/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_about_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_about_image(db, image_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.post("/about/images/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_about_images(
    payload: list[ReorderItem],
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    try:
        admin_service.reorder_about_images(db, payload)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/social-links", response_model=SocialLinkListOut)
def list_social_links(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> SocialLinkListOut:
    items, total = admin_service.list_social_links(db, page, page_size)
    return SocialLinkListOut(items=items, page=page, page_size=page_size, total=total)


@router.post("/social-links", response_model=SocialLinkOut, status_code=status.HTTP_201_CREATED)
def create_social_link(
    payload: SocialLinkCreateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> SocialLinkOut:
    return admin_service.create_social_link(db, payload)


@router.put("/social-links/{link_id}", response_model=SocialLinkOut)
def update_social_link(
    link_id: int,
    payload: SocialLinkUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> SocialLinkOut:
    link = admin_service.update_social_link(db, link_id, payload)
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return link


@router.delete("/social-links/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_social_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    ok = admin_service.delete_social_link(db, link_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.post("/social-links/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_social_links(
    payload: list[ReorderItem],
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> None:
    try:
        admin_service.reorder_social_links(db, payload)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/quote-requests", response_model=QuoteRequestListOut)
def list_quote_requests(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status", max_length=30),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> QuoteRequestListOut:
    items, total = admin_service.list_quote_requests(db, page, page_size, status_filter)
    return QuoteRequestListOut(items=items, page=page, page_size=page_size, total=total)


@router.put("/quote-requests/{request_id}", response_model=QuoteRequestOut)
def update_quote_request_status(
    request_id: int,
    payload: QuoteRequestStatusUpdateIn,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> QuoteRequestOut:
    quote = admin_service.update_quote_request_status(db, request_id, payload)
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return quote
