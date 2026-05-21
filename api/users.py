"""
Hermes Web UI -- Multi-user authentication.
Extends the single-password auth to support multiple users.
Users are stored in STATE_DIR/users.json
"""
import hashlib
import hmac
import json
import logging
import os
import secrets
import tempfile
import threading
import time

from api.config import STATE_DIR
from api.auth import _hash_password, _pbkdf2_key

logger = logging.getLogger(__name__)

USERS_FILE = STATE_DIR / 'users.json'
_lock = threading.Lock()


def _load_users() -> dict:
    """Load users from STATE_DIR/users.json.
    Returns dict of {email: {username, password_hash, created_at, role}}
    """
    try:
        if USERS_FILE.exists():
            data = json.loads(USERS_FILE.read_text(encoding='utf-8'))
            if isinstance(data, dict):
                return data
    except Exception as e:
        logger.debug("Failed to load users file: %s", e)
    return {}


def _save_users(users: dict) -> None:
    """Atomically persist users to STATE_DIR/users.json (0600)."""
    try:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        fd, tmp = tempfile.mkstemp(dir=STATE_DIR, suffix='.users.tmp')
        try:
            with os.fdopen(fd, 'w', encoding='utf-8') as f:
                json.dump(users, f, indent=2, ensure_ascii=False)
            os.chmod(tmp, 0o600)
            os.replace(tmp, USERS_FILE)
        except Exception:
            try:
                os.unlink(tmp)
            except OSError:
                pass
            raise
    except Exception as e:
        logger.error("Failed to persist users: %s", e)


def get_users() -> dict:
    """Return all users."""
    with _lock:
        return dict(_load_users())


def create_user(email: str, username: str, password: str, role: str = "user") -> dict:
    """Create a new user. Returns dict with user info or raises ValueError."""
    with _lock:
        users = _load_users()
        if email in users:
            raise ValueError(f"User {email} already exists")
        if not email or not username or not password:
            raise ValueError("Email, username and password are required")
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters")

        password_hash = _hash_password(password)
        users[email] = {
            "username": username,
            "password_hash": password_hash,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "role": role,
        }
        _save_users(users)
        logger.info("Created user: %s (%s)", username, email)
        return {"email": email, "username": username, "role": role}


def verify_user(email: str, password: str) -> dict | None:
    """Verify user credentials. Returns user dict if valid, None otherwise."""
    if not email or not password:
        return None
    with _lock:
        users = _load_users()
        user = users.get(email)
        if not user:
            return None
        expected_hash = user.get("password_hash")
        if not expected_hash:
            return None
        if hmac.compare_digest(_hash_password(password), expected_hash):
            return {"email": email, "username": user["username"], "role": user.get("role", "user")}
        return None


def delete_user(email: str) -> bool:
    """Delete a user. Returns True if deleted, False if not found."""
    with _lock:
        users = _load_users()
        if email not in users:
            return False
        del users[email]
        _save_users(users)
        logger.info("Deleted user: %s", email)
        return True


def user_exists(email: str) -> bool:
    """Check if a user exists."""
    with _lock:
        users = _load_users()
        return email in users


def seed_default_admin() -> None:
    """Create default admin user if no users exist."""
    with _lock:
        users = _load_users()
        if users:
            return
        password_hash = _hash_password("Scripta2025*")
        users["admin@openclaw.local"] = {
            "username": "admin",
            "password_hash": password_hash,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "role": "admin",
        }
        _save_users(users)
        logger.info("Seeded default admin user: admin@openclaw.local")


# Seed on module load
seed_default_admin()
