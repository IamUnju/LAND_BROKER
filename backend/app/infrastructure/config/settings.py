from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Smart Property & Rental Management"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "changeme-super-secret-key-at-least-32-chars"
    # Comma-separated string to avoid JSON parsing issues with env vars
    ALLOWED_ORIGINS_STR: str = "http://localhost:3000,http://localhost:5173"

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS_STR.split(",") if o.strip()]

    # Database — auto-convert Railway's postgresql:// to postgresql+asyncpg://
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/broker_db"

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://") or url.startswith("postgres://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    # JWT
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Bcrypt
    BCRYPT_ROUNDS: int = 12

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
