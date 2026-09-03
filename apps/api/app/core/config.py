"""Application configuration (pydantic-settings).

Loaded once via ``get_settings``. Secrets and model deployment names come from
the environment / Azure Key Vault — never hardcoded (MASTER 18.4, 18.5, 28).
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "local"
    database_url: str = "postgresql+asyncpg://tact:tact_local_password@localhost:5432/tact"

    # AI model deployment names are configuration, never hardcoded (MASTER 18.4).
    ai_model_deployment: str = "configure-me"
    ai_embedding_deployment: str = "configure-me"


@lru_cache
def get_settings() -> Settings:
    return Settings()
