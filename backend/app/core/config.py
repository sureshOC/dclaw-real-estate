from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "DClaw CRM"
    app_env: str = "dev"
    debug: bool = True

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_crm"

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"

    upload_dir: str = "/tmp/dclaw_uploads"
    max_upload_bytes: int = 20 * 1024 * 1024  # 20 MB

    late_fee_grace_days: int = 5
    late_fee_flat: float = 50.0

    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_starter: str = ""
    stripe_price_pro: str = ""

    sendgrid_api_key: str = ""
    from_email: str = "noreply@dclaw.app"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
