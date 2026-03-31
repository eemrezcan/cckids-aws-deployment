from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SiteSettingsPublicOut(BaseModel):
    phone_number: str | None = None
    email: str | None = None
    whatsapp_number: str | None = None
    whatsapp_default_message: str | None = None
    office_address: str | None = None
    workshop_address: str | None = None

    model_config = ConfigDict(from_attributes=True)


class HomeSectionOut(BaseModel):
    id: int
    kind: str
    title: str | None = None
    body: str | None = None
    media_url: str | None = None
    link_url: str | None = None
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class SocialLinkOut(BaseModel):
    id: int
    platform: str
    url: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


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


class CategoryPublicOut(BaseModel):
    uuid: UUID
    name: str
    emoji: str | None = None
    image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ColorPublicOut(BaseModel):
    uuid: UUID
    name: str
    hex: str

    model_config = ConfigDict(from_attributes=True)


class ProductSizePublicOut(BaseModel):
    uuid: UUID
    width: int
    height: int
    depth: int
    unit: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ProductImageOut(BaseModel):
    id: int
    uuid: UUID
    url: str
    sort_order: int
    color: ColorPublicOut | None = None
    size: ProductSizePublicOut | None = None

    model_config = ConfigDict(from_attributes=True)


class ProductListItemOut(BaseModel):
    id: int
    uuid: UUID
    name: str
    description: str | None = None
    cover_image_url: str | None = None
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ProductDetailOut(ProductListItemOut):
    has_size: bool
    details: ProductDetails | None = None
    categories: list[CategoryPublicOut] = Field(default_factory=list)
    colors: list[ColorPublicOut] = Field(default_factory=list)
    sizes: list[ProductSizePublicOut] = Field(default_factory=list)
    images: list[ProductImageOut] = Field(default_factory=list)


class AboutOut(BaseModel):
    content: str | None = None

    model_config = ConfigDict(from_attributes=True)


class AboutImagePublicOut(BaseModel):
    uuid: UUID
    url: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class AboutImageListResponse(BaseModel):
    items: list[AboutImagePublicOut]


class QuoteRequestCreateIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    email: EmailStr | None = Field(default=None, max_length=254)
    message: str = Field(min_length=1, max_length=2000)
    product_id: int | None = None
    product_uuid: UUID | None = None


class QuoteRequestOut(BaseModel):
    id: int
    status: str
    created_at: datetime
    name: str
    phone: str | None = None
    email: str | None = None
    message: str
    product_id: int | None = None

    model_config = ConfigDict(from_attributes=True)


class PublicHomeResponse(BaseModel):
    settings: SiteSettingsPublicOut
    sections: list[HomeSectionOut]
    social_links: list[SocialLinkOut]


class ProductListResponse(BaseModel):
    items: list[ProductListItemOut]
    page: int
    page_size: int
    total: int


class CategoryListResponse(BaseModel):
    items: list[CategoryPublicOut]
    page: int
    page_size: int
    total: int


class ProjectCategoryPublicOut(BaseModel):
    uuid: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class ProjectCategoryListItemOut(BaseModel):
    id: int
    uuid: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class ProjectCategoryListResponse(BaseModel):
    items: list[ProjectCategoryListItemOut]
    page: int
    page_size: int
    total: int


class ProjectImagePublicOut(BaseModel):
    uuid: UUID
    kind: str
    url: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ProjectReviewPublicOut(BaseModel):
    customer_name: str
    project_name: str | None = None
    comment: str

    model_config = ConfigDict(from_attributes=True)


class ProjectListItemPublicOut(BaseModel):
    uuid: UUID
    name: str
    short_info: str | None = None
    featured_image_url: str | None = None
    location: str | None = None
    category: ProjectCategoryPublicOut | None = None

    model_config = ConfigDict(from_attributes=True)


class ProjectDetailPublicOut(BaseModel):
    uuid: UUID
    name: str
    short_info: str | None = None
    about_text: str | None = None
    featured_image_url: str | None = None
    location: str | None = None
    completed_at: str | None = None
    duration: str | None = None
    capacity: str | None = None
    total_products: str | None = None
    general_info: list[dict[str, str]] = Field(default_factory=list)
    category: ProjectCategoryPublicOut | None = None
    images: list[ProjectImagePublicOut] = Field(default_factory=list)
    before_images: list[ProjectImagePublicOut] = Field(default_factory=list)
    after_images: list[ProjectImagePublicOut] = Field(default_factory=list)
    gallery_images: list[ProjectImagePublicOut] = Field(default_factory=list)
    review: ProjectReviewPublicOut | None = None

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    items: list[ProjectListItemPublicOut]
    page: int
    page_size: int
    total: int


class ProjectReviewListResponse(BaseModel):
    items: list[ProjectReviewPublicOut]
    page: int
    page_size: int
    total: int


class ReferenceLogoPublicOut(BaseModel):
    uuid: UUID
    url: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ReferenceLogoListResponse(BaseModel):
    items: list[ReferenceLogoPublicOut]


class ContactResponse(BaseModel):
    phone_number: str | None = None
    whatsapp_number: str | None = None
    email: str | None = None
    office_address: str | None = None
    workshop_address: str | None = None
    social_links: list[SocialLinkOut]
    maps_embed_url: str | None = None
    maps_directions_url: str | None = None


class HomeProjectImagePublicOut(BaseModel):
    project_uuid: UUID
    image_url: str
    image_uuid: str | None = None
    kind: str
    sort_order: int


class HomeProjectImageListResponse(BaseModel):
    items: list[HomeProjectImagePublicOut]
