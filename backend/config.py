from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "AI Career Platform"
    app_env: str = "development"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60

    # Database
    database_url: str 

    # ── Groq (skill extraction + career prediction) ──────────────────
    # Free tier: 14,400 req/day, 30 req/min on Llama 3.3 70B
    # Get key: https://console.groq.com
    groq_api_key: str 
    groq_model: str = "llama-3.3-70b-versatile"

    # ── Gemini (chatbot + resume scoring) ────────────────────────────
    # Free tier: 1,500 req/day, 15 req/min
    # Get key: https://aistudio.google.com/apikey
    gemini_api_key: str 
    gemini_model: str = "gemini-2.0-flash"

    # ── OpenRouter (fallback for both) ───────────────────────────────
    # Used automatically if primary provider rate-limits
    openrouter_api_key: str 
    openrouter_model: str = "meta-llama/llama-3.3-70b-instruct:free"

    # ── Anthropic (optional, if you get a paid key later) ────────────
    anthropic_api_key: str 
    claude_model: str = "claude-3-haiku-20240307"

    # ── Per-feature provider routing ─────────────────────────────────
    # Change these to switch providers without touching any module code
    provider_skills: str = "groq"       # skill extraction + scoring
    provider_careers: str = "groq"      # career prediction + skill gap
    provider_resume: str = "gemini"     # resume quality scoring + rewrite
    provider_chat: str = "gemini"       # AI chatbot streaming
    provider_jobs: str = "groq"         # job matching rerank

    # File Storage
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # Vector Store
    chroma_persist_dir: str = "./chroma_data"

    # CORS
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()