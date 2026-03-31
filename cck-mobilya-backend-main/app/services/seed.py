from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app import models

logger = logging.getLogger(__name__)


def ensure_seed(db: Session) -> None:
    created = False

    settings = db.get(models.SiteSettings, 1)
    if settings is None:
        db.add(
            models.SiteSettings(
                id=1,
                whatsapp_number=None,
                whatsapp_default_message=None,
                whatsapp_default_message_en=None,
                office_address=None,
                office_address_en=None,
                workshop_address=None,
                workshop_address_en=None,
            )
        )
        created = True

    about = db.get(models.AboutPage, 1)
    if about is None:
        db.add(models.AboutPage(id=1, content=None, content_en=None))
        created = True

    if created:
        db.commit()
        logger.info("Seeded singleton rows")
