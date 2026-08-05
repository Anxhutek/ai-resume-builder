"""
Application Configuration — Environment Variables
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Resume Builder"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Gemini AI
    GEMINI_API_KEY: str

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://ai-resume-builder.vercel.app",
    ]

    # Rate Limiting
    MAX_REQUESTS_PER_MINUTE: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
