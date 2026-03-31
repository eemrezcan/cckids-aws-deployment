from __future__ import annotations

from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    app_env: str = "dev"
    project_name: str = "CCK Mobilya API"
    api_v1_prefix: str = ""
    database_url: str = "postgresql+psycopg2://cck:cck@localhost:5432/cck"
    cors_origins: List[str] = []

    jwt_secret_key: str = "dev-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_pass: str | None = None
    smtp_from: str | None = None
    smtp_to: str | None = None
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False

    storage_backend: str = "local"
    media_root: str = "media"
    media_url_prefix: str = "media"
    app_base_url: str | None = None

    aws_region: str | None = None
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    aws_session_token: str | None = None
    s3_bucket_name: str | None = None
    s3_public_base_url: str | None = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: object) -> List[str]:
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []
            return [item.strip() for item in raw.split(",") if item.strip()]
        if value is None:
            return []
        return value  # type: ignore[return-value]

    @field_validator("storage_backend", mode="before")
    @classmethod
    def normalize_storage_backend(cls, value: object) -> str:
        raw = str(value or "local").strip().lower()
        if raw not in {"local", "s3"}:
            raise ValueError("storage_backend must be 'local' or 's3'")
        return raw

    @field_validator("media_url_prefix", mode="before")
    @classmethod
    def normalize_media_url_prefix(cls, value: object) -> str:
        raw = str(value or "media").strip().strip("/")
        if not raw:
            raise ValueError("media_url_prefix cannot be empty")
        return raw


settings = Settings()
