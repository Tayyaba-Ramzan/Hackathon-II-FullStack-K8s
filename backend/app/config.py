from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables."""

    database_url: str
    host: str = "0.0.0.0"
    port: int = 8000

    # JWT Authentication Settings
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 1

    # Phase III Settings
    allowed_origins: str = "http://localhost:3000"
    better_auth_secret: str = ""
    openai_api_key: str = ""

    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra='ignore'  # Ignore extra fields from .env
    )


settings = Settings()
