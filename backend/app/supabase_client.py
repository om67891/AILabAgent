from functools import lru_cache
from typing import Any

try:
    from supabase import Client, create_client
except ModuleNotFoundError:  # Backend still runs without optional Supabase package.
    Client = Any
    create_client = None

from backend.app.config import get_settings


@lru_cache
def get_supabase_admin() -> Client | None:
    settings = get_settings()
    key = settings.supabase_service_role_key or settings.supabase_publishable_key
    if not settings.supabase_url or not key or create_client is None:
        return None
    return create_client(settings.supabase_url, key)
