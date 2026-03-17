from sqlalchemy import Column, String, Text, DateTime, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from models.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title           = Column(String(255), nullable=False, index=True)
    company         = Column(String(255), nullable=True)
    location        = Column(String(255), nullable=True)
    description     = Column(Text, nullable=False)
    required_skills = Column(JSON, nullable=True)   # extracted by AI
    salary_range    = Column(String(100), nullable=True)
    job_type        = Column(String(50), nullable=True)   # "full-time" | "intern" | etc.
    experience_level = Column(String(50), nullable=True)  # "fresher" | "mid" | "senior"
    chroma_id       = Column(String(255), nullable=True)  # vector store reference
    source_url      = Column(String(1000), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
