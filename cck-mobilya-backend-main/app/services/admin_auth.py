from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AdminUser
from app.services.security import hash_password, verify_password


def get_admin_by_email(db: Session, email: str) -> AdminUser | None:
    stmt = select(AdminUser).where(AdminUser.email == email)
    return db.execute(stmt).scalars().first()


def authenticate_admin(db: Session, email: str, password: str) -> AdminUser | None:
    admin = get_admin_by_email(db, email)
    if not admin:
        return None
    if not admin.is_active:
        return None
    if not verify_password(password, admin.password_hash):
        return None
    return admin


def create_admin_user(db: Session, email: str, password: str) -> AdminUser:
    admin = AdminUser(email=email, password_hash=hash_password(password))
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin
