from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from models.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    # File info
    filename        = Column(String(255), nullable=False)
    file_url        = Column(String(1000), nullable=True)
    file_type       = Column(String(10), nullable=False)

    # Extracted content
    raw_text        = Column(Text, nullable=True)
    extracted_data  = Column(JSON, nullable=True)

    # Analysis results
    skills          = Column(JSON, nullable=True)
    skill_scores    = Column(JSON, nullable=True)
    career_matches  = Column(JSON, nullable=True)
    skill_gaps      = Column(JSON, nullable=True)
    resume_score    = Column(Float, nullable=True)
    suggestions     = Column(JSON, nullable=True)

    # Vector store reference
    chroma_id       = Column(String(255), nullable=True)

    # Progress tracking
    analysis_stage  = Column(String(100), nullable=True)

    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())