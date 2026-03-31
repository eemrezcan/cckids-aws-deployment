from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from app.settings import settings

logger = logging.getLogger(__name__)


def send_email(to_address: str | None, subject: str, body: str) -> None:
    if not settings.smtp_host or not to_address:
        logger.info("Email skipped (mailer not configured): to=%s subject=%s", to_address, subject)
        return

    to_addrs = [addr.strip() for addr in to_address.split(",") if addr.strip()]
    if not to_addrs:
        logger.info("Email skipped (mailer not configured): to=%s subject=%s", to_address, subject)
        return

    from_addr = settings.smtp_from or settings.smtp_user or "noreply@localhost"

    msg = EmailMessage()
    msg["From"] = from_addr
    msg["To"] = ", ".join(to_addrs)
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        if settings.smtp_use_ssl:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=10) as server:
                if settings.smtp_user and settings.smtp_pass:
                    server.login(settings.smtp_user, settings.smtp_pass)
                server.send_message(msg)
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
                if settings.smtp_use_tls:
                    server.starttls()
                if settings.smtp_user and settings.smtp_pass:
                    server.login(settings.smtp_user, settings.smtp_pass)
                server.send_message(msg)
    except Exception:
        logger.exception("Failed to send email: to=%s subject=%s", to_address, subject)
        return
