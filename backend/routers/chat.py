from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from models.database import get_db
from models.resume import Resume
from models.user import User
from routers.auth import get_current_user
from modules.chatbot import chat_stream

router = APIRouter()


class ChatRequest(BaseModel):
    messages: list[dict]
    resume_id: str | None = None


@router.get("/test")
def test_stream():
    """Test endpoint — visit /api/chat/test in browser to verify streaming works."""
    def generate():
        import time
        words = ["Hello", " ", "from", " ", "the", " ", "AI", " ", "Career", " ", "Platform", "!"]
        for word in words:
            yield word
            time.sleep(0.1)
    return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")


@router.post("/stream")
def chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume_context = None
    if body.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == body.resume_id,
            Resume.user_id == current_user.id,
        ).first()
        if resume:
            resume_context = {
                "skills": resume.skills,
                "career_matches": resume.career_matches,
                "resume_score": resume.resume_score,
            }

    def generate():
        try:
            for chunk in chat_stream(body.messages, resume_context):
                if chunk:
                    yield chunk
        except Exception as e:
            yield f"[Error: {str(e)}]"

    return StreamingResponse(
        generate(),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
        },
    )