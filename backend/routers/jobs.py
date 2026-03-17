from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from models.database import get_db
from models.resume import Resume
from models.job import Job
from models.user import User
from routers.auth import get_current_user, require_admin
from modules.job_matcher import match_jobs_to_resume
from modules.embedder import generate_embedding
from modules.vector_store import upsert_job

router = APIRouter()


class AddJobRequest(BaseModel):
    title: str
    company: str = ""
    location: str = ""
    description: str
    salary_range: str = ""
    job_type: str = "full-time"
    experience_level: str = "fresher"
    source_url: str = ""


@router.post("/add", status_code=201)
def add_job(body: AddJobRequest, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    from modules.skill_extractor import extract_skills
    skill_result = extract_skills(body.description)
    job = Job(
        id=uuid.uuid4(),
        title=body.title, company=body.company, location=body.location,
        description=body.description, required_skills=skill_result.get("skills", []),
        salary_range=body.salary_range, job_type=body.job_type,
        experience_level=body.experience_level, source_url=body.source_url,
    )
    db.add(job)
    db.flush()
    embedding = generate_embedding(f"{body.title} {body.description}")
    chroma_id = f"job_{job.id}"
    upsert_job(chroma_id, embedding, {"job_id": str(job.id), "title": body.title, "company": body.company, "required_skills": ",".join(skill_result.get("skills", []))})
    job.chroma_id = chroma_id
    db.commit()
    return {"id": str(job.id), "title": job.title, "status": "added"}


@router.get("/match/{resume_id}")
def match_jobs(resume_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    return match_jobs_to_resume(resume_text=resume.raw_text, skills=resume.skills or [])


@router.get("/list")
def list_jobs(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    jobs = db.query(Job).order_by(Job.created_at.desc()).limit(50).all()
    return [{"id": str(j.id), "title": j.title, "company": j.company,
             "location": j.location, "job_type": j.job_type,
             "experience_level": j.experience_level, "required_skills": j.required_skills} for j in jobs]
