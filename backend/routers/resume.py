from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from models.database import get_db
from models.resume import Resume
from models.user import User
from routers.auth import get_current_user
from modules.parser import parse_resume
from modules.nlp_processor import process_resume_text
from modules.skill_extractor import extract_skills
from modules.embedder import generate_embedding
from modules import vector_store

router = APIRouter()

ALLOWED_TYPES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


# ─── Schemas ──────────────────────────────────────────────────────

class ResumeResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    skills: list[str] | None
    resume_score: float | None
    status: str

    class Config:
        from_attributes = True


# ─── Routes ───────────────────────────────────────────────────────

@router.post("/upload", status_code=201)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate file
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    # Parse immediately (fast — no AI)
    parsed = parse_resume(file_bytes, file.filename)
    if parsed["error"]:
        raise HTTPException(status_code=422, detail=f"Could not read file: {parsed['error']}")

    # Save resume record
    resume = Resume(
        id=uuid.uuid4(),
        user_id=current_user.id,
        filename=file.filename,
        file_type=parsed["file_type"],
        raw_text=parsed["text"],
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Run AI analysis in the background (doesn't block the response)
    background_tasks.add_task(_run_full_analysis, str(resume.id), parsed["text"], db)

    return {
        "id": str(resume.id),
        "filename": resume.filename,
        "file_type": resume.file_type,
        "status": "uploaded",
        "message": "Resume uploaded. AI analysis is running in the background.",
    }


@router.get("/my", response_model=list[ResumeResponse])
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return [
        ResumeResponse(
            id=str(r.id),
            filename=r.filename,
            file_type=r.file_type,
            skills=r.skills,
            resume_score=r.resume_score,
            status="analyzed" if r.skills else "processing",
        )
        for r in resumes
    ]


@router.get("/{resume_id}")
def get_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {
        "id": str(resume.id),
        "filename": resume.filename,
        "file_type": resume.file_type,
        "extracted_data": resume.extracted_data,
        "skills": resume.skills,
        "skill_scores": resume.skill_scores,
        "career_matches": resume.career_matches,
        "skill_gaps": resume.skill_gaps,
        "resume_score": resume.resume_score,
        "suggestions": resume.suggestions,
        "status": "analyzed" if resume.skills else "processing",
        "analysis_stage": getattr(resume, "analysis_stage", None),
    }


@router.delete("/{resume_id}", status_code=204)
def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.chroma_id:
        vector_store.delete_resume(resume.chroma_id)
    db.delete(resume)
    db.commit()


# ─── Background task ──────────────────────────────────────────────

def _set_stage(resume, stage: str, db):
    """Update analysis stage and commit so frontend can poll it."""
    resume.analysis_stage = stage
    db.commit()


def _run_full_analysis(resume_id: str, raw_text: str, db: Session):
    """Runs M2-M9 sequentially with stage tracking for progress bar."""
    import time
    from modules.resume_improver import analyze_resume_quality
    from modules.career_predictor import predict_careers

    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        return

    try:
        # M2: NLP processing
        _set_stage(resume, "reading", db)
        extracted = process_resume_text(raw_text)
        resume.extracted_data = extracted
        db.commit()

        # M3: Skill extraction
        _set_stage(resume, "extracting_skills", db)
        print(f"[Analysis] Extracting skills...")
        skill_result = extract_skills(raw_text)
        resume.skills = skill_result.get("skills", [])
        resume.skill_scores = skill_result.get("skill_scores", {})
        db.commit()

        # M4 + M5: Embedding + vector store
        _set_stage(resume, "generating_embeddings", db)
        embedding = generate_embedding(raw_text)
        chroma_id = f"resume_{resume_id}"
        vector_store.upsert_resume(
            chroma_id=chroma_id,
            embedding=embedding,
            metadata={"resume_id": resume_id, "skills": ",".join(resume.skills or [])},
        )
        resume.chroma_id = chroma_id
        db.commit()

        # Wait before next AI call
        _set_stage(resume, "predicting_careers", db)
        print(f"[Analysis] Waiting 10s before career prediction...")
        time.sleep(10)

        # M6: Career prediction
        print(f"[Analysis] Predicting careers...")
        resume.career_matches = predict_careers(
            skills=resume.skills or [],
            extracted_data=extracted,
            resume_text=raw_text,
        )
        db.commit()

        # Wait before next AI call
        _set_stage(resume, "scoring_resume", db)
        print(f"[Analysis] Waiting 10s before quality score...")
        time.sleep(10)

        # M9: Resume quality score
        print(f"[Analysis] Scoring resume...")
        quality = analyze_resume_quality(raw_text, extracted)
        resume.resume_score = quality.get("overall_score")
        resume.suggestions = quality.get("issues", [])
        _set_stage(resume, "done", db)
        db.commit()

        print(f"[Analysis] ✅ Resume {resume_id} fully analyzed!")

    except Exception as e:
        print(f"[Analysis error] resume {resume_id}: {e}")
        resume.analysis_stage = "error"
        db.commit()