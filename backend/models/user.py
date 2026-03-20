from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from models.database import Base


class User(Base):
    __tablename__ = "users"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email            = Column(String(255), unique=True, nullable=False, index=True)
    name             = Column(String(255), nullable=False)
    hashed_password  = Column(String(255), nullable=True)
    role             = Column(String(20), default="user")
    is_active        = Column(Boolean, default=True)

    # OAuth
    oauth_provider    = Column(String(50), nullable=True)
    oauth_provider_id = Column(String(255), nullable=True)
    avatar_url        = Column(String(1000), nullable=True)

    # Profile
    bio              = Column(Text, nullable=True)
    headline         = Column(String(255), nullable=True)   # e.g. "MCA Student | Python Developer"
    location         = Column(String(255), nullable=True)
    phone            = Column(String(50), nullable=True)
    years_experience = Column(Integer, nullable=True)
    target_role      = Column(String(255), nullable=True)
    education_level  = Column(String(100), nullable=True)  # "MCA", "B.Tech", etc.
    college          = Column(String(255), nullable=True)

    # Social
    linkedin_url     = Column(String(500), nullable=True)
    github_url       = Column(String(500), nullable=True)
    portfolio_url    = Column(String(500), nullable=True)

    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())