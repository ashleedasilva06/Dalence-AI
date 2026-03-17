from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from models.database import Base


class User(Base):
    __tablename__ = "users"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email        = Column(String(255), unique=True, nullable=False, index=True)
    name         = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role         = Column(String(20), default="user")   # "user" | "admin"
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    # Optional profile fields
    bio          = Column(Text, nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    github_url   = Column(String(500), nullable=True)
