import hashlib
import os
import secrets
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.access_key import AccessKey
from app.email.sender import send_access_key_email

KEY_PREFIX = "KEY-"
KEY_SUFFIX = "-TK"


def _hash_key(key: str) -> str:
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def generate_access_key() -> str:
    raw = f"{KEY_PREFIX}{secrets.token_hex(3).upper()}{KEY_SUFFIX}"
    return raw


def create_and_send_access_key(db: Session, name: str, email: str, company: str, team_size: str) -> AccessKey:
    key_plain = generate_access_key()
    hashed = _hash_key(key_plain)

    record = AccessKey(
        name=name,
        email=email,
        company=company,
        team_size=team_size,
        key_hash=hashed,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    send_access_key_email(email=email, name=name, key=key_plain)
    return record


def verify_key(db: Session, key: str) -> Optional[AccessKey]:
    hashed = _hash_key(key)
    record: AccessKey | None = db.query(AccessKey).filter_by(key_hash=hashed).first()
    if record and not record.is_used:
        record.is_used = True
        record.used_at = datetime.utcnow()
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    return None
