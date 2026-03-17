from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,       # reconnect if connection dropped
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Called on startup to create all tables if they don't exist."""
    # Import models here so SQLAlchemy registers them before create_all
    from models.user import User      # noqa: F401
    from models.resume import Resume  # noqa: F401
    from models.job import Job        # noqa: F401
    Base.metadata.create_all(bind=engine)
