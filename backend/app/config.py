from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "AILabAgent API"
    grok_api_key: str | None = None
    grok_model: str = "grok-2-latest"
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None
    supabase_publishable_key: str | None = None
    chroma_dir: str = "./backend/.chroma"
    embedding_model: str = "local-hash"
    judge0_api_url: str = "https://ce.judge0.com"
    judge0_api_key: str | None = None
    judge0_rapidapi_host: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
