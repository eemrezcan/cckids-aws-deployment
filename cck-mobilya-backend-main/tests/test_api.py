from __future__ import annotations


import pytest


@pytest.mark.anyio
async def test_health(async_client):
    resp = await async_client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

@pytest.mark.anyio
async def test_admin_login_and_me(async_client, admin_user):
    login = await async_client.post(
        "/admin/auth/login",
        json={"email": admin_user["email"], "password": admin_user["password"]},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = await async_client.get("/admin/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    data = me.json()
    assert data["email"] == admin_user["email"]

@pytest.mark.anyio
async def test_product_flow(async_client, admin_token):
    create = await async_client.post(
        "/admin/products",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Koltuk",
            "description": "Test",
            "sort_order": 10,
            "is_active": True,
        },
    )
    assert create.status_code == 201
    product_uuid = create.json()["uuid"]

    listing = await async_client.get("/public/products")
    assert listing.status_code == 200
    items = listing.json()["items"]
    assert any(item["uuid"] == product_uuid for item in items)

    detail = await async_client.get(f"/public/products/{product_uuid}")
    assert detail.status_code == 200


@pytest.mark.anyio
async def test_public_categories(async_client, admin_token):
    create = await async_client.post(
        "/admin/categories",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Oyun Takimlari", "emoji": "🎮"},
    )
    assert create.status_code == 201
    category_uuid = create.json()["uuid"]

    listing = await async_client.get("/public/categories")
    assert listing.status_code == 200
    items = listing.json()["items"]
    assert any(item["uuid"] == category_uuid for item in items)


@pytest.mark.anyio
async def test_public_project_categories(async_client, admin_token):
    create = await async_client.post(
        "/admin/project-categories",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Konut"},
    )
    assert create.status_code == 201
    category_uuid = create.json()["uuid"]

    listing = await async_client.get("/public/project-categories")
    assert listing.status_code == 200
    items = listing.json()["items"]
    assert any(item["uuid"] == category_uuid for item in items)


@pytest.mark.anyio
async def test_public_project_category_projects_search(async_client, admin_token):
    category = await async_client.post(
        "/admin/project-categories",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Arama Proje Kategori"},
    )
    assert category.status_code == 201
    category_id = category.json()["id"]
    category_uuid = category.json()["uuid"]

    project_a = await async_client.post(
        "/admin/projects",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Konut Proje", "short_info": "Test", "category_id": category_id},
    )
    assert project_a.status_code == 201
    project_b = await async_client.post(
        "/admin/projects",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Ofis Proje", "short_info": "Diger", "category_id": category_id},
    )
    assert project_b.status_code == 201

    listing = await async_client.get(
        f"/public/project-categories/{category_uuid}/projects?q=Konut"
    )
    assert listing.status_code == 200
    items = listing.json()["items"]
    assert any(item["name"] == "Konut Proje" for item in items)
    assert all(item["name"] != "Ofis Proje" for item in items)


@pytest.mark.anyio
async def test_about_images_flow(async_client, admin_token):
    create = await async_client.post(
        "/admin/about/images",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("about.jpg", b"fake-image", "image/jpeg")},
        data={"sort_order": "1"},
    )
    assert create.status_code == 201

    listing = await async_client.get("/public/about/images")
    assert listing.status_code == 200
    items = listing.json()["items"]
    assert any(item["sort_order"] == 1 for item in items)


@pytest.mark.anyio
async def test_projects_and_references(async_client, admin_token):
    category = await async_client.post(
        "/admin/project-categories",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Okul"},
    )
    assert category.status_code == 201
    category_id = category.json()["id"]

    project = await async_client.post(
        "/admin/projects",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Proje 1",
            "short_info": "Kisa bilgi",
            "category_id": category_id,
            "location": "Istanbul",
        },
    )
    assert project.status_code == 201
    project_id = project.json()["id"]
    project_uuid = project.json()["uuid"]

    image = await async_client.post(
        f"/admin/projects/{project_id}/images",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("before.jpg", b"fake-image", "image/jpeg")},
        data={"kind": "before", "sort_order": "1"},
    )
    assert image.status_code == 201

    review = await async_client.put(
        f"/admin/projects/{project_id}/review",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"customer_name": "Ali", "comment": "Cok iyi"},
    )
    assert review.status_code == 200

    listing = await async_client.get("/public/projects")
    assert listing.status_code == 200
    assert any(item["uuid"] == project_uuid for item in listing.json()["items"])

    detail = await async_client.get(f"/public/projects/{project_uuid}")
    assert detail.status_code == 200
    assert detail.json()["review"]["customer_name"] == "Ali"

    refs = await async_client.post(
        "/admin/reference-logos",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("logo.png", b"fake-image", "image/png")},
        data={"sort_order": "1"},
    )
    assert refs.status_code == 201

    public_refs = await async_client.get("/public/references?limit=6")
    assert public_refs.status_code == 200
    assert len(public_refs.json()["items"]) >= 1


@pytest.mark.anyio
async def test_public_projects_search(async_client, admin_token):
    project_a = await async_client.post(
        "/admin/projects",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Villa Arama", "short_info": "Test", "location": "Ankara"},
    )
    assert project_a.status_code == 201
    project_b = await async_client.post(
        "/admin/projects",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Ofis Projesi", "short_info": "Diger", "location": "Izmir"},
    )
    assert project_b.status_code == 201

    listing = await async_client.get("/public/projects?q=Villa")
    assert listing.status_code == 200
    items = listing.json()["items"]
    assert any(item["name"] == "Villa Arama" for item in items)
    assert all(item["name"] != "Ofis Projesi" for item in items)


@pytest.mark.anyio
async def test_public_category_products_search(async_client, admin_token):
    category = await async_client.post(
        "/admin/categories",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Arama Kategori"},
    )
    assert category.status_code == 201
    category_id = category.json()["id"]
    category_uuid = category.json()["uuid"]

    product_a = await async_client.post(
        "/admin/products",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Alpha Koltuk",
            "description": "Test",
            "category_ids": [category_id],
            "is_active": True,
        },
    )
    assert product_a.status_code == 201
    product_b = await async_client.post(
        "/admin/products",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Beta Masa",
            "description": "Diger",
            "category_ids": [category_id],
            "is_active": True,
        },
    )
    assert product_b.status_code == 201

    listing = await async_client.get(f"/public/categories/{category_uuid}/products?q=Alpha")
    assert listing.status_code == 200
    items = listing.json()["items"]
    assert any(item["name"] == "Alpha Koltuk" for item in items)
    assert all(item["name"] != "Beta Masa" for item in items)


@pytest.mark.anyio
async def test_public_contact(async_client, admin_token):
    update = await async_client.put(
        "/admin/site-settings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "phone_number": "+905555555555",
            "email": "iletisim@example.com",
            "office_address": "Ofis adres",
            "workshop_address": "Atolye adres",
            "whatsapp_number": "+905555555555",
        },
    )
    assert update.status_code == 200

    contact = await async_client.get("/public/contact")
    assert contact.status_code == 200
    data = contact.json()
    assert data["phone_number"] == "+905555555555"


@pytest.mark.anyio
async def test_contact_maps_update(async_client, admin_token):
    payload = {
        "maps_embed_url": "https://www.google.com/maps/embed?pb=test",
        "maps_directions_url": "https://www.google.com/maps/dir/?api=1&destination=Istanbul",
    }
    update = await async_client.put(
        "/admin/contact-maps",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload,
    )
    assert update.status_code == 200
    assert update.json()["maps_embed_url"] == payload["maps_embed_url"]

    contact = await async_client.get("/public/contact")
    assert contact.status_code == 200
    data = contact.json()
    assert data["maps_embed_url"] == payload["maps_embed_url"]


@pytest.mark.anyio
async def test_home_project_images(async_client, admin_token):
    project = await async_client.post(
        "/admin/projects",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Proje Home", "short_info": "Anasayfa"},
    )
    assert project.status_code == 201
    project_id = project.json()["id"]

    image = await async_client.post(
        f"/admin/projects/{project_id}/images",
        headers={"Authorization": f"Bearer {admin_token}"},
        files={"file": ("home.jpg", b"fake-image", "image/jpeg")},
        data={"kind": "gallery", "sort_order": "1"},
    )
    assert image.status_code == 201
    project_image_id = image.json()["id"]

    home_image = await async_client.post(
        "/admin/home-project-images",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"project_image_id": project_image_id, "sort_order": 1},
    )
    assert home_image.status_code == 201

    listing = await async_client.get("/public/home/project-images?limit=12")
    assert listing.status_code == 200
    assert len(listing.json()["items"]) >= 1

@pytest.mark.anyio
async def test_quote_flow(async_client, admin_token):
    create = await async_client.post(
        "/public/quote-requests",
        json={
            "name": "Test User",
            "phone": "+905555555555",
            "email": "test@example.com",
            "message": "Test message",
        },
    )
    assert create.status_code == 201

    quotes = await async_client.get(
        "/admin/quote-requests",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert quotes.status_code == 200
    assert quotes.json()["total"] >= 1


@pytest.mark.anyio
async def test_public_products_lang_and_fallback(async_client, admin_token):
    details_tr = {
        "ozet_ozellik": ["a", "b", "c", "d"],
        "aciklama": {"aciklama_detay": "TR detay"},
        "teknik_ozellikler": [],
        "malzeme_uretim": [],
    }
    details_en = {
        "ozet_ozellik": ["a", "b", "c", "d"],
        "aciklama": {"aciklama_detay": "EN detail"},
        "teknik_ozellikler": [],
        "malzeme_uretim": [],
    }
    create = await async_client.post(
        "/admin/products",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Koltuk TR",
            "name_en": "Sofa EN",
            "description": "Aciklama TR",
            "description_en": "Description EN",
            "details": details_tr,
            "details_en": details_en,
            "is_active": True,
        },
    )
    assert create.status_code == 201
    product_uuid = create.json()["uuid"]

    listing_en = await async_client.get("/public/products?lang=en")
    assert listing_en.status_code == 200
    listed = next(item for item in listing_en.json()["items"] if item["uuid"] == product_uuid)
    assert listed["name"] == "Sofa EN"
    assert listed["description"] == "Description EN"

    detail_en = await async_client.get(f"/public/products/{product_uuid}?lang=en")
    assert detail_en.status_code == 200
    detail_payload = detail_en.json()
    assert detail_payload["name"] == "Sofa EN"
    assert detail_payload["details"]["aciklama"]["aciklama_detay"] == "EN detail"

    fallback = await async_client.post(
        "/admin/products",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Yalnizca TR",
            "description": "TR only",
            "is_active": True,
        },
    )
    assert fallback.status_code == 201
    fallback_uuid = fallback.json()["uuid"]

    fallback_detail_en = await async_client.get(f"/public/products/{fallback_uuid}?lang=en")
    assert fallback_detail_en.status_code == 200
    fallback_payload = fallback_detail_en.json()
    assert fallback_payload["name"] == "Yalnizca TR"
    assert fallback_payload["description"] == "TR only"


@pytest.mark.anyio
async def test_public_projects_and_categories_lang(async_client, admin_token):
    category = await async_client.post(
        "/admin/project-categories",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Konut", "name_en": "Residential"},
    )
    assert category.status_code == 201
    category_id = category.json()["id"]
    category_uuid = category.json()["uuid"]

    project = await async_client.post(
        "/admin/projects",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Okul Projesi",
            "name_en": "School Project",
            "short_info": "TR Kisa Bilgi",
            "short_info_en": "EN Short Info",
            "about_text": "TR Hakkinda",
            "about_text_en": "EN About",
            "location": "Istanbul",
            "location_en": "Istanbul EN",
            "general_info": [{"label": "Alan", "value": "TR"}],
            "general_info_en": [{"label": "Area", "value": "EN"}],
            "category_id": category_id,
            "is_active": True,
        },
    )
    assert project.status_code == 201
    project_uuid = project.json()["uuid"]

    categories_en = await async_client.get("/public/project-categories?lang=en")
    assert categories_en.status_code == 200
    cat_item = next(item for item in categories_en.json()["items"] if item["uuid"] == category_uuid)
    assert cat_item["name"] == "Residential"

    projects_search_en = await async_client.get("/public/projects?lang=en&q=School")
    assert projects_search_en.status_code == 200
    assert any(item["uuid"] == project_uuid for item in projects_search_en.json()["items"])

    detail_en = await async_client.get(f"/public/projects/{project_uuid}?lang=en")
    assert detail_en.status_code == 200
    detail_payload = detail_en.json()
    assert detail_payload["name"] == "School Project"
    assert detail_payload["short_info"] == "EN Short Info"
    assert detail_payload["about_text"] == "EN About"
    assert detail_payload["location"] == "Istanbul EN"
    assert detail_payload["general_info"][0]["label"] == "Area"
    assert detail_payload["category"]["name"] == "Residential"


@pytest.mark.anyio
async def test_public_home_contact_about_lang(async_client, admin_token):
    settings_update = await async_client.put(
        "/admin/site-settings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "whatsapp_default_message": "TR Mesaj",
            "whatsapp_default_message_en": "EN Message",
            "office_address": "TR Ofis",
            "office_address_en": "EN Office",
            "workshop_address": "TR Atolye",
            "workshop_address_en": "EN Workshop",
        },
    )
    assert settings_update.status_code == 200

    section_en = await async_client.post(
        "/admin/home-sections",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "kind": "hero",
            "title": "TR Hero",
            "title_en": "EN Hero",
            "body": "TR Body",
            "body_en": "EN Body",
            "sort_order": 1,
            "is_active": True,
        },
    )
    assert section_en.status_code == 201

    section_fallback = await async_client.post(
        "/admin/home-sections",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "kind": "hero-fallback",
            "title": "TR Fallback",
            "body": "TR Fallback Body",
            "sort_order": 2,
            "is_active": True,
        },
    )
    assert section_fallback.status_code == 201

    about_update = await async_client.put(
        "/admin/about",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"content": "TR Hakkimizda", "content_en": "EN About Us"},
    )
    assert about_update.status_code == 200

    home_en = await async_client.get("/public/home?lang=en")
    assert home_en.status_code == 200
    home_payload = home_en.json()
    assert home_payload["settings"]["whatsapp_default_message"] == "EN Message"
    assert any(item["title"] == "EN Hero" for item in home_payload["sections"])
    assert any(item["title"] == "TR Fallback" for item in home_payload["sections"])

    contact_en = await async_client.get("/public/contact?lang=en")
    assert contact_en.status_code == 200
    contact_payload = contact_en.json()
    assert contact_payload["office_address"] == "EN Office"
    assert contact_payload["workshop_address"] == "EN Workshop"

    about_en = await async_client.get("/public/about?lang=en")
    assert about_en.status_code == 200
    assert about_en.json()["content"] == "EN About Us"
