from __future__ import annotations

import logging
import uuid
from datetime import datetime, UTC
from pathlib import Path, PurePosixPath
from tempfile import SpooledTemporaryFile
from typing import BinaryIO
from urllib.parse import quote, unquote, urlparse

from fastapi import UploadFile

from app.settings import settings

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_UPLOAD_BYTES = 100 * 1024 * 1024


def _safe_media_root() -> Path:
    root = Path(settings.media_root).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root


def _media_prefix() -> str:
    return settings.media_url_prefix.strip("/")


def _build_object_key(file_uuid: str, ext: str, now: datetime | None = None) -> str:
    timestamp = now or datetime.now(UTC)
    return f"{_media_prefix()}/{timestamp.year:04d}/{timestamp.month:02d}/{file_uuid}{ext}"


def extract_media_object_key(url: str | None) -> str | None:
    if not url:
        return None

    parsed = urlparse(url)
    raw_path = parsed.path or url
    normalized = unquote(raw_path).lstrip("/")
    prefix = f"{_media_prefix()}/"

    if normalized.startswith(prefix):
        return normalized
    return None


def extract_uuid_from_media_url(url: str | None) -> str | None:
    if not url:
        return None

    parsed = urlparse(url)
    raw_path = parsed.path or url
    filename = PurePosixPath(unquote(raw_path)).name
    if not filename:
        return None

    stem = filename.rsplit(".", 1)[0]
    try:
        return str(uuid.UUID(stem))
    except ValueError:
        return None


def _local_path_from_object_key(object_key: str) -> Path:
    key_path = PurePosixPath(object_key)
    parts = key_path.parts
    prefix = _media_prefix()

    if not parts or parts[0] != prefix:
        raise ValueError(f"Unsupported media object key: {object_key}")

    media_root = _safe_media_root()
    relative_parts = parts[1:]
    target = media_root.joinpath(*relative_parts).resolve()

    try:
        target.relative_to(media_root)
    except ValueError as exc:
        raise ValueError(f"Refusing to access outside media root: {target}") from exc

    return target


def _build_local_public_url(object_key: str) -> str:
    public_path = f"/{object_key.lstrip('/')}"
    base = settings.app_base_url
    if base:
        return f"{base.rstrip('/')}{public_path}"
    return public_path


def _build_s3_public_url(object_key: str) -> str:
    base = settings.s3_public_base_url
    if not base:
        if not settings.s3_bucket_name:
            raise RuntimeError("S3 bucket name is not configured")
        region = settings.aws_region or "us-east-1"
        if region == "us-east-1":
            base = f"https://{settings.s3_bucket_name}.s3.amazonaws.com"
        else:
            base = f"https://{settings.s3_bucket_name}.s3.{region}.amazonaws.com"
    return f"{base.rstrip('/')}/{quote(object_key, safe='/')}"


def _build_public_url(object_key: str) -> str:
    if settings.storage_backend == "s3":
        return _build_s3_public_url(object_key)
    return _build_local_public_url(object_key)


def _get_s3_client():
    try:
        import boto3
    except ImportError as exc:
        raise RuntimeError("boto3 is required when STORAGE_BACKEND=s3") from exc

    kwargs: dict[str, str] = {}
    if settings.aws_region:
        kwargs["region_name"] = settings.aws_region
    if settings.aws_access_key_id and settings.aws_secret_access_key:
        kwargs["aws_access_key_id"] = settings.aws_access_key_id
        kwargs["aws_secret_access_key"] = settings.aws_secret_access_key
    if settings.aws_session_token:
        kwargs["aws_session_token"] = settings.aws_session_token
    return boto3.client("s3", **kwargs)


def _save_local_upload(object_key: str, file_obj: BinaryIO) -> None:
    target_path = _local_path_from_object_key(object_key)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        with open(target_path, "wb") as output:
            while True:
                chunk = file_obj.read(1024 * 1024)
                if not chunk:
                    break
                output.write(chunk)
    except Exception:
        target_path.unlink(missing_ok=True)
        logger.exception("Failed to save upload to local storage")
        raise


def _save_s3_upload(object_key: str, file_obj: BinaryIO, content_type: str | None) -> None:
    if not settings.s3_bucket_name:
        raise RuntimeError("S3_BUCKET_NAME is required when STORAGE_BACKEND=s3")

    client = _get_s3_client()
    extra_args = {"ContentType": content_type} if content_type else None
    try:
        if extra_args:
            client.upload_fileobj(file_obj, settings.s3_bucket_name, object_key, ExtraArgs=extra_args)
        else:
            client.upload_fileobj(file_obj, settings.s3_bucket_name, object_key)
    except Exception:
        logger.exception("Failed to save upload to S3")
        raise


def delete_media(url: str | None) -> None:
    object_key = extract_media_object_key(url)
    if not object_key:
        return

    if settings.storage_backend == "s3":
        if not settings.s3_bucket_name:
            logger.warning("Skipping media deletion because S3 bucket is not configured")
            return
        try:
            client = _get_s3_client()
            client.delete_object(Bucket=settings.s3_bucket_name, Key=object_key)
        except Exception:
            logger.exception("Failed to delete media object from S3: %s", object_key)
        return

    try:
        target = _local_path_from_object_key(object_key)
    except ValueError:
        logger.warning("Refusing to delete unsupported media key: %s", object_key)
        return

    try:
        if target.exists():
            if target.is_dir():
                logger.warning("Refusing to delete media directory: %s", target)
                return
            target.unlink()
        else:
            logger.info("Media file not found: %s", target)
    except Exception:
        logger.exception("Failed to delete media file: %s", target)


def save_upload(upload_file: UploadFile) -> tuple[str, str]:
    filename = upload_file.filename or ""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("invalid_extension")

    file_uuid = str(uuid.uuid4())
    object_key = _build_object_key(file_uuid, ext)

    if hasattr(upload_file.file, "seek"):
        upload_file.file.seek(0)

    with SpooledTemporaryFile() as buffered_file:
        bytes_written = 0
        while True:
            chunk = upload_file.file.read(1024 * 1024)
            if not chunk:
                break
            bytes_written += len(chunk)
            if bytes_written > MAX_UPLOAD_BYTES:
                raise ValueError("file_too_large")
            buffered_file.write(chunk)

        buffered_file.seek(0)
        if settings.storage_backend == "s3":
            _save_s3_upload(object_key, buffered_file, upload_file.content_type)
        else:
            _save_local_upload(object_key, buffered_file)

    return file_uuid, _build_public_url(object_key)
