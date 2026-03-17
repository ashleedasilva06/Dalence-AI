from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from models.database import get_db
from models.resume import Resume
from models.user import User
from routers.auth import get_current_user
from modules.job_matcher import match_resume_to_job_description
from modules.skill_gap import analyze_skill_gap
from modules.resume_improver import rewrite_section

router = APIRouter()


class JobMatchRequest(BaseModel):
    resume_id: str
    job_description: str
    job_title: str = ""


class SkillGapRequest(BaseModel):
    resume_id: str
    target_career_id: str | None = None
    job_description: str | None = None


class RewriteRequest(BaseModel):
    resume_id: str
    section_name: str
    target_role: str = ""


@router.post("/job-match")
def job_match(body: JobMatchRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.id == body.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    return match_resume_to_job_description(
        resume_text=resume.raw_text,
        skills=resume.skills or [],
        job_description=body.job_description,
        job_title=body.job_title,
    )


@router.post("/skill-gap")
def skill_gap(body: SkillGapRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.id == body.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    return analyze_skill_gap(
        current_skills=resume.skills or [],
        target_career_id=body.target_career_id,
        target_job_description=body.job_description,
    )


@router.post("/rewrite-section")
def rewrite(body: RewriteRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.id == body.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    sections = (resume.extracted_data or {}).get("sections", {})
    section_text = sections.get(body.section_name, "")
    if not section_text:
        raise HTTPException(404, f"Section '{body.section_name}' not found")
    return rewrite_section(body.section_name, section_text, body.target_role)
