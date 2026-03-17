from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models.database import get_db
from models.user import User
from models.resume import Resume
from models.job import Job
from routers.auth import require_admin

router = APIRouter()


@router.get("/stats")
def stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return {
        "total_users": db.query(User).count(),
        "total_resumes": db.query(Resume).count(),
        "total_jobs": db.query(Job).count(),
        "analyzed_resumes": db.query(Resume).filter(Resume.skills.isnot(None)).count(),
    }


@router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [{"id": str(u.id), "name": u.name, "email": u.email,
             "role": u.role, "is_active": u.is_active,
             "created_at": str(u.created_at)} for u in users]
