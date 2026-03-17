from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.database import get_db
from models.resume import Resume
from models.user import User
from routers.auth import get_current_user
from modules.interview_generator import generate_interview_questions

router = APIRouter()


class InterviewRequest(BaseModel):
    job_role: str
    experience_level: str = "fresher"
    resume_id: str | None = None
    num_technical: int = 8
    num_hr: int = 5


@router.post("/generate")
def generate(
    body: InterviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Pull skills from resume if provided
    skills = []
    if body.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == body.resume_id,
            Resume.user_id == current_user.id,
        ).first()
        if resume and resume.skills:
            skills = resume.skills

    return generate_interview_questions(
        job_role=body.job_role,
        experience_level=body.experience_level,
        skills=skills,
        num_technical=body.num_technical,
        num_hr=body.num_hr,
    )