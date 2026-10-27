"""Application configuration"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    app_name: str = "AI Trader Backend"
    app_version: str = "0.1.0"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS
    frontend_url: str = "http://localhost:3000"
    
    # Database
    database_url: str = "sqlite:///./ai_trader.db"
    
    # LLM API Keys
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    
    # Market Data API Keys
    alpha_vantage_api_key: Optional[str] = None
    polygon_api_key: Optional[str] = None
    
    # Session
    session_secret_key: str = "dev-secret-key-change-in-production"
    
    # Logging
    log_level: str = "INFO"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
