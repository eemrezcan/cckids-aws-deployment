from __future__ import annotations

import argparse
import sys

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.services.admin_auth import create_admin_user, get_admin_by_email


def main() -> int:
    parser = argparse.ArgumentParser(description="Create an admin user")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    db: Session = SessionLocal()
    try:
        existing = get_admin_by_email(db, args.email)
        if existing:
            print("Admin already exists", file=sys.stderr)
            return 1

        create_admin_user(db, args.email, args.password)
        print("Admin created")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
