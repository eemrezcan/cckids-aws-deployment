from __future__ import annotations

import os

import psycopg2
import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session


def _load_env_file() -> None:
    if not os.path.exists(".env"):
        return
    with open(".env", "r", encoding="utf-8") as handle:
        for line in handle:
            raw = line.strip()
            if not raw or raw.startswith("#") or "=" not in raw:
                continue
            key, value = raw.split("=", 1)
            key = key.strip()
            value = value.strip().strip("'").strip('"')
            if key and key not in os.environ:
                os.environ[key] = value


def _build_test_db_url() -> str:
    _load_env_file()
    env_url = os.getenv("DATABASE_URL_TEST")
    if env_url:
        return env_url
    base_url = os.getenv("DATABASE_URL")
    if not base_url:
        raise RuntimeError("DATABASE_URL or DATABASE_URL_TEST must be set for tests")
    url = make_url(base_url)
    url = url.set(database="furniture_test")
    return url.render_as_string(hide_password=False)


def _ensure_test_db_exists(test_db_url: str) -> None:
    url = make_url(test_db_url)
    admin_db = url.set(database="postgres", drivername="postgresql")
    conn = psycopg2.connect(admin_db.render_as_string(hide_password=False))
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (url.database,))
            exists = cur.fetchone() is not None
            if not exists:
                cur.execute(f'CREATE DATABASE "{url.database}"')
    finally:
        conn.close()


def _run_migrations(test_db_url: str) -> None:
    cfg = Config("alembic.ini")
    cfg.set_main_option("sqlalchemy.url", test_db_url)
    command.upgrade(cfg, "head")


@pytest.fixture(scope="session")
def test_db_url() -> str:
    test_url = _build_test_db_url()
    _ensure_test_db_exists(test_url)
    os.environ["DATABASE_URL"] = test_url
    _run_migrations(test_url)
    return test_url


@pytest.fixture()
def db_session(test_db_url: str) -> Session:
    import importlib

    from app import db as app_db

    importlib.reload(app_db)
    session = app_db.SessionLocal()
    try:
        yield session
    finally:
        session.close()
        engine = app_db.engine
        table_names = list(app_db.Base.metadata.tables.keys())
        if table_names:
            quoted = ", ".join(f'\"{name}\"' for name in table_names)
            with engine.begin() as conn:
                conn.execute(text(f"TRUNCATE TABLE {quoted} RESTART IDENTITY CASCADE"))


@pytest.fixture()
async def async_client(test_db_url: str):
    import importlib

    from app import db as app_db
    from app import main as app_main
    from app import settings as app_settings

    importlib.reload(app_settings)
    importlib.reload(app_db)
    importlib.reload(app_main)

    import httpx

    transport = httpx.ASGITransport(app=app_main.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture()
def admin_user(db_session: Session) -> dict:
    from app.models import AdminUser
    from app.services.security import hash_password

    email = "admin@example.com"
    password = "ChangeMe123!"
    admin = AdminUser(email=email, password_hash=hash_password(password), is_active=True)
    db_session.add(admin)
    db_session.commit()
    return {"email": email, "password": password}


@pytest.fixture()
async def admin_token(async_client, admin_user: dict) -> str:
    resp = await async_client.post(
        "/admin/auth/login",
        json={"email": admin_user["email"], "password": admin_user["password"]},
    )
    assert resp.status_code == 200
    return resp.json()["access_token"]
