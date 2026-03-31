from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Pagination(BaseModel):
    page: int
    page_size: int
    total: int


class ProductDetailsDescription(BaseModel):
    aciklama_detay: str = Field(min_length=1, max_length=5000)


class ProductMaterialItem(BaseModel):
    baslik: str = Field(min_length=1, max_length=255)
    items: list[str] = Field(default_factory=list, min_length=1, max_length=20)


class ProductDetails(BaseModel):
    ozet_ozellik: list[str] = Field(min_length=4, max_length=4)
    aciklama: ProductDetailsDescription
    teknik_ozellikler: list[dict[str, str]] = Field(default_factory=list, max_length=9)
    malzeme_uretim: list[ProductMaterialItem] = Field(default_factory=list)


class SiteSettingsUpdateIn(BaseModel):
    phone_number: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    whatsapp_number: str | None = Field(default=None, max_length=50)
    whatsapp_default_message: str | None = Field(default=None, max_length=255)
    whatsapp_default_message_en: str | None = Field(default=None, max_length=255)
    office_address: str | None = None
    office_address_en: str | None = None
    workshop_address: str | None = None
    workshop_address_en: str | None = None


class SiteSettingsOut(BaseModel):
    id: int
    phone_number: str | None = None
    email: str | None = None
    whatsapp_number: str | None = None
    whatsapp_default_message: str | None = None
    whatsapp_default_message_en: str | None = None
    office_address: str | None = None
    office_address_en: str | None = None
    workshop_address: str | None = None
    workshop_address_en: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ContactMapsUpdateIn(BaseModel):
    maps_embed_url: str | None = Field(default=None, max_length=2000)
    maps_directions_url: str | None = Field(default=None, max_length=2000)

    @field_validator("maps_embed_url")
    @classmethod
    def validate_embed_url(cls, value: str | None) -> str | None:
        if not value:
            return None
        if not value.startswith("https://www.google.com/maps/embed"):
            raise ValueError("maps_embed_url must be a Google Maps embed URL")
        return value

    @field_validator("maps_directions_url")
    @classmethod
    def validate_directions_url(cls, value: str | None) -> str | None:
        if not value:
            return None
        if not (
            value.startswith("https://www.google.com/maps")
            or value.startswith("https://maps.app.goo.gl/")
        ):
            raise ValueError("maps_directions_url must be a Google Maps URL")
        return value


class ContactMapsOut(BaseModel):
    maps_embed_url: str | None = None
    maps_directions_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class HomeSectionCreateIn(BaseModel):
    kind: str = Field(min_length=1, max_length=50)
    title: str | None = Field(default=None, max_length=255)
    title_en: str | None = Field(default=None, max_length=255)
    body: str | None = None
    body_en: str | None = None
    media_url: str | None = Field(default=None, max_length=500)
    link_url: str | None = Field(default=None, max_length=500)
    sort_order: int = 0
    is_active: bool = True


class HomeSectionUpdateIn(BaseModel):
    kind: str | None = Field(default=None, max_length=50)
    title: str | None = Field(default=None, max_length=255)
    title_en: str | None = Field(default=None, max_length=255)
    body: str | None = None
    body_en: str | None = None
    media_url: str | None = Field(default=None, max_length=500)
    link_url: str | None = Field(default=None, max_length=500)
    sort_order: int | None = None
    is_active: bool | None = None


class HomeSectionOut(BaseModel):
    id: int
    kind: str
    title: str | None = None
    title_en: str | None = None
    body: str | None = None
    body_en: str | None = None
    media_url: str | None = None
    link_url: str | None = None
    sort_order: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class HomeSectionListOut(Pagination):
    items: list[HomeSectionOut]


class ReorderItem(BaseModel):
    id: int
    sort_order: int


class ProductCreateIn(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    name_en: str | None = Field(default=None, max_length=255)
    description: str | None = None
    description_en: str | None = None
    has_size: bool = False
    details: ProductDetails | None = None
    details_en: ProductDetails | None = None
    cover_image_url: str | None = Field(default=None, max_length=500)
    cover_image_uuid: str | None = Field(default=None, max_length=36)
    sort_order: int = 0
    is_active: bool = True
    category_ids: list[int] = Field(default_factory=list)
    color_ids: list[int] = Field(default_factory=list)


class ProductUpdateIn(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    name_en: str | None = Field(default=None, max_length=255)
    description: str | None = None
    description_en: str | None = None
    has_size: bool | None = None
    details: ProductDetails | None = None
    details_en: ProductDetails | None = None
    cover_image_url: str | None = Field(default=None, max_length=500)
    cover_image_uuid: str | None = Field(default=None, max_length=36)
    sort_order: int | None = None
    is_active: bool | None = None
    category_ids: list[int] | None = None
    color_ids: list[int] | None = None


class ProductOut(BaseModel):
    id: int
    uuid: UUID
    name: str
    name_en: str | None = None
    description: str | None = None
    description_en: str | None = None
    has_size: bool
    cover_image_url: str | None = None
    cover_image_uuid: str | None = None
    sort_order: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ProductListOut(Pagination):
    items: list[ProductOut]


class CategoryCreateIn(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    name_en: str | None = Field(default=None, max_length=255)
    emoji: str | None = Field(default=None, max_length=20)
    image_url: str | None = Field(default=None, max_length=500)
    image_uuid: str | None = Field(default=None, max_length=36)


class CategoryUpdateIn(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    name_en: str | None = Field(default=None, max_length=255)
    emoji: str | None = Field(default=None, max_length=20)
    image_url: str | None = Field(default=None, max_length=500)
    image_uuid: str | None = Field(default=None, max_length=36)


class CategoryOut(BaseModel):
    id: int
    uuid: UUID
    name: str
    name_en: str | None = None
    emoji: str | None = None
    image_url: str | None = None
    image_uuid: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CategoryListOut(Pagination):
    items: list[CategoryOut]


class ColorCreateIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    hex: str = Field(min_length=1, max_length=20)


class ColorUpdateIn(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    hex: str | None = Field(default=None, max_length=20)


class ColorOut(BaseModel):
    id: int
    uuid: UUID
    name: str
    hex: str

    model_config = ConfigDict(from_attributes=True)


class ColorListOut(Pagination):
    items: list[ColorOut]


class ProductSizeCreateIn(BaseModel):
    width: int = Field(ge=1)
    height: int = Field(ge=1)
    depth: int = Field(ge=1)
    unit: str = Field(default="cm", min_length=1, max_length=20)
    sort_order: int = Field(default=0, ge=0)


class ProductSizeUpdateIn(BaseModel):
    width: int | None = Field(default=None, ge=1)
    height: int | None = Field(default=None, ge=1)
    depth: int | None = Field(default=None, ge=1)
    unit: str | None = Field(default=None, min_length=1, max_length=20)
    sort_order: int | None = Field(default=None, ge=0)


class ProductSizeOut(BaseModel):
    id: int
    uuid: UUID
    product_id: int
    width: int
    height: int
    depth: int
    unit: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ProductSizeListOut(Pagination):
    items: list[ProductSizeOut]


class ProductImageCreateIn(BaseModel):
    url: str = Field(min_length=1, max_length=500)
    file_uuid: str | None = Field(default=None, max_length=36, validation_alias="uuid")
    sort_order: int = Field(default=1, ge=1)
    size_id: int | None = None
    color_id: int | None = None


class ProductImageOut(BaseModel):
    id: int
    uuid: UUID
    product_id: int
    file_uuid: str | None = None
    url: str
    sort_order: int
    size_id: int | None = None
    color_id: int | None = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ProductImageUpdateIn(BaseModel):
    url: str | None = Field(default=None, max_length=500)
    file_uuid: str | None = Field(default=None, max_length=36, validation_alias="uuid")
    sort_order: int | None = Field(default=None, ge=1)
    size_id: int | None = None
    color_id: int | None = None


class ProductDetailOut(ProductOut):
    images: list[ProductImageOut] = Field(default_factory=list)
    details: ProductDetails | None = None
    details_en: ProductDetails | None = None
    categories: list[CategoryOut] = Field(default_factory=list)
    colors: list[ColorOut] = Field(default_factory=list)
    sizes: list[ProductSizeOut] = Field(default_factory=list)


class UploadOut(BaseModel):
    uuid: str
    url: str


class AboutUpdateIn(BaseModel):
    content: str | None = None
    content_en: str | None = None


class AboutOut(BaseModel):
    id: int
    content: str | None = None
    content_en: str | None = None

    model_config = ConfigDict(from_attributes=True)


class AboutImageCreateIn(BaseModel):
    url: str = Field(min_length=1, max_length=500)
    file_uuid: str | None = Field(default=None, max_length=36, validation_alias="uuid")
    sort_order: int = Field(default=0, ge=0)


class AboutImageUpdateIn(BaseModel):
    url: str | None = Field(default=None, max_length=500)
    file_uuid: str | None = Field(default=None, max_length=36, validation_alias="uuid")
    sort_order: int | None = Field(default=None, ge=0)


class AboutImageOut(BaseModel):
    id: int
    uuid: UUID
    url: str
    file_uuid: str | None = None
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class AboutImageListOut(Pagination):
    items: list[AboutImageOut]


class ProjectCategoryCreateIn(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    name_en: str | None = Field(default=None, max_length=255)


class ProjectCategoryUpdateIn(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    name_en: str | None = Field(default=None, max_length=255)


class ProjectCategoryOut(BaseModel):
    id: int
    uuid: UUID
    name: str
    name_en: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ProjectCategoryListOut(Pagination):
    items: list[ProjectCategoryOut]


class ProjectCreateIn(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    name_en: str | None = Field(default=None, max_length=255)
    short_info: str | None = Field(default=None, max_length=500)
    short_info_en: str | None = Field(default=None, max_length=500)
    about_text: str | None = None
    about_text_en: str | None = None
    featured_image_url: str | None = Field(default=None, max_length=500)
    featured_image_uuid: str | None = Field(default=None, max_length=36)
    location: str | None = Field(default=None, max_length=255)
    location_en: str | None = Field(default=None, max_length=255)
    completed_at: str | None = Field(default=None, max_length=255)
    duration: str | None = Field(default=None, max_length=255)
    capacity: str | None = Field(default=None, max_length=255)
    total_products: str | None = Field(default=None, max_length=255)
    general_info: list[dict[str, str]] = Field(default_factory=list, max_length=4)
    general_info_en: list[dict[str, str]] | None = Field(default=None, max_length=4)
    category_id: int | None = None
    sort_order: int = 0
    is_active: bool = True


class ProjectUpdateIn(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    name_en: str | None = Field(default=None, max_length=255)
    short_info: str | None = Field(default=None, max_length=500)
    short_info_en: str | None = Field(default=None, max_length=500)
    about_text: str | None = None
    about_text_en: str | None = None
    featured_image_url: str | None = Field(default=None, max_length=500)
    featured_image_uuid: str | None = Field(default=None, max_length=36)
    location: str | None = Field(default=None, max_length=255)
    location_en: str | None = Field(default=None, max_length=255)
    completed_at: str | None = Field(default=None, max_length=255)
    duration: str | None = Field(default=None, max_length=255)
    capacity: str | None = Field(default=None, max_length=255)
    total_products: str | None = Field(default=None, max_length=255)
    general_info: list[dict[str, str]] | None = None
    general_info_en: list[dict[str, str]] | None = Field(default=None, max_length=4)
    category_id: int | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class ProjectOut(BaseModel):
    id: int
    uuid: UUID
    name: str
    name_en: str | None = None
    short_info: str | None = None
    short_info_en: str | None = None
    featured_image_url: str | None = None
    featured_image_uuid: str | None = None
    location: str | None = None
    location_en: str | None = None
    category_id: int | None = None
    sort_order: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ProjectListOut(Pagination):
    items: list[ProjectOut]


class ProjectImageCreateIn(BaseModel):
    kind: str = Field(min_length=1, max_length=20)
    url: str = Field(min_length=1, max_length=500)
    file_uuid: str | None = Field(default=None, max_length=36, validation_alias="uuid")
    sort_order: int = Field(default=0, ge=0)


class ProjectImageUpdateIn(BaseModel):
    kind: str | None = Field(default=None, max_length=20)
    url: str | None = Field(default=None, max_length=500)
    file_uuid: str | None = Field(default=None, max_length=36, validation_alias="uuid")
    sort_order: int | None = Field(default=None, ge=0)


class ProjectImageOut(BaseModel):
    id: int
    uuid: UUID
    project_id: int
    kind: str
    url: str
    file_uuid: str | None = None
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ProjectReviewUpsertIn(BaseModel):
    customer_name: str = Field(min_length=1, max_length=255)
    comment: str = Field(min_length=1, max_length=5000)


class ProjectReviewOut(BaseModel):
    id: int
    uuid: UUID
    project_id: int
    customer_name: str
    comment: str

    model_config = ConfigDict(from_attributes=True)


class ProjectDetailOut(ProjectOut):
    about_text: str | None = None
    about_text_en: str | None = None
    completed_at: str | None = None
    duration: str | None = None
    capacity: str | None = None
    total_products: str | None = None
    general_info: list[dict[str, str]] = Field(default_factory=list)
    general_info_en: list[dict[str, str]] | None = None
    category: ProjectCategoryOut | None = None
    images: list[ProjectImageOut] = Field(default_factory=list)
    review: ProjectReviewOut | None = None


class ReferenceLogoCreateIn(BaseModel):
    url: str = Field(min_length=1, max_length=500)
    file_uuid: str | None = Field(default=None, max_length=36, validation_alias="uuid")
    sort_order: int = Field(default=0, ge=0)


class ReferenceLogoUpdateIn(BaseModel):
    url: str | None = Field(default=None, max_length=500)
    file_uuid: str | None = Field(default=None, max_length=36, validation_alias="uuid")
    sort_order: int | None = Field(default=None, ge=0)


class ReferenceLogoOut(BaseModel):
    id: int
    uuid: UUID
    url: str
    file_uuid: str | None = None
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ReferenceLogoListOut(Pagination):
    items: list[ReferenceLogoOut]


class HomeProjectImageCreateIn(BaseModel):
    project_image_id: int
    sort_order: int = Field(default=0, ge=0)


class HomeProjectImageOut(BaseModel):
    id: int
    project_image_id: int
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class HomeProjectImageListOut(Pagination):
    items: list[HomeProjectImageOut]


class SocialLinkCreateIn(BaseModel):
    platform: str = Field(min_length=1, max_length=50)
    url: str = Field(min_length=1, max_length=500)
    sort_order: int = 0
    is_active: bool = True


class SocialLinkUpdateIn(BaseModel):
    platform: str | None = Field(default=None, max_length=50)
    url: str | None = Field(default=None, max_length=500)
    sort_order: int | None = None
    is_active: bool | None = None


class SocialLinkOut(BaseModel):
    id: int
    platform: str
    url: str
    sort_order: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class SocialLinkListOut(Pagination):
    items: list[SocialLinkOut]


class QuoteRequestOut(BaseModel):
    id: int
    name: str
    phone: str | None = None
    email: str | None = None
    message: str
    product_id: int | None = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuoteRequestListOut(Pagination):
    items: list[QuoteRequestOut]


class QuoteRequestStatusUpdateIn(BaseModel):
    status: str = Field(min_length=1, max_length=30)
