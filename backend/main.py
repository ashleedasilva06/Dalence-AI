from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_settings
from models.database import create_tables
from routers import auth, resume, jobs, analysis, chat, admin, interview

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: create DB tables
    create_tables()
    print(f"✅  {settings.app_name} started — env: {settings.app_env}")
    yield
    # Shutdown
    print("👋  Shutting down")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="AI-powered resume analysis and career guidance platform",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────
# Allow frontend + NextAuth server-side calls (which have no origin header)
allowed_origins = [settings.frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"http://localhost:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(resume.router,   prefix="/api/resume",   tags=["Resume"])
app.include_router(jobs.router,     prefix="/api/jobs",     tags=["Jobs"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(chat.router,     prefix="/api/chat",     tags=["Chat"])
app.include_router(admin.router,    prefix="/api/admin",    tags=["Admin"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": settings.app_name}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}