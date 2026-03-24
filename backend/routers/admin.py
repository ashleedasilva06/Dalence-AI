from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from models.database import get_db
from models.user import User
from models.resume import Resume
from models.job import Job
from routers.auth import require_admin

router = APIRouter()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    from datetime import datetime

    total_users    = db.query(User).count()
    total_resumes  = db.query(Resume).filter(Resume.status == "analyzed").count()
    avg_score_row  = db.query(func.avg(Resume.resume_score)).filter(Resume.resume_score.isnot(None)).scalar()
    avg_score      = float(avg_score_row) if avg_score_row else 0
    today          = datetime.utcnow().date()
    active_today   = db.query(User).filter(func.date(User.created_at) == today).count()
    recent_users   = db.query(User).order_by(desc(User.created_at)).limit(8).all()

    # Top skills
    resumes_with_skills = db.query(Resume.skills).filter(Resume.skills.isnot(None)).all()
    skill_counts: dict = {}
    for (skills,) in resumes_with_skills:
        if isinstance(skills, list):
            for s in skills:
                skill_counts[s] = skill_counts.get(s, 0) + 1
    top_skills = sorted([{"skill": k, "count": v} for k, v in skill_counts.items()], key=lambda x: -x["count"])[:10]

    # Top careers
    resumes_with_careers = db.query(Resume.career_matches).filter(Resume.career_matches.isnot(None)).all()
    career_counts: dict = {}
    for (careers,) in resumes_with_careers:
        if isinstance(careers, list) and careers:
            title = careers[0].get("title", "Unknown")
            career_counts[title] = career_counts.get(title, 0) + 1
    top_careers = sorted([{"title": k, "count": v} for k, v in career_counts.items()], key=lambda x: -x["count"])[:5]

    return {
        "total_users":   total_users,
        "total_resumes": total_resumes,
        "avg_score":     round(avg_score, 1),
        "active_today":  active_today,
        "top_skills":    top_skills,
        "top_careers":   top_careers,
        "recent_users":  [
            {"id": str(u.id), "name": u.name, "email": u.email,
             "oauth_provider": u.oauth_provider, "created_at": str(u.created_at)}
            for u in recent_users
        ],
    }