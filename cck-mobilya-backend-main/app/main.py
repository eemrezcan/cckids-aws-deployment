from __future__ import annotations

import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db import SessionLocal
from app.routers import admin, public
from app.services.seed import ensure_seed
from app.settings import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.project_name, root_path=settings.root_path)

if settings.storage_backend == "local":
    media_root = Path(settings.media_root).resolve()
    media_root.mkdir(parents=True, exist_ok=True)
    app.mount(f"/{settings.media_url_prefix}", StaticFiles(directory=str(media_root)), name="media")

origins = settings.cors_origins
if not origins and settings.app_env == "dev":
    origins = ["*"]

if origins:
    allow_all = "*" in origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if allow_all else origins,
        allow_credentials=False if allow_all else True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.on_event("startup")
def seed_singletons() -> None:
    db = SessionLocal()
    try:
        ensure_seed(db)
    except Exception:
        logger.exception("Seed failed")
    finally:
        db.close()


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


app.include_router(public.router)
app.include_router(admin.router)
