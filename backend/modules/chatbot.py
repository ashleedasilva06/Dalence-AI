"""
Module 10 — AI Career Chatbot
Uses the unified ai_client stream_chat which routes to the configured chat provider.
"""
from modules.ai_client import stream_chat as _stream

_SYSTEM_PROMPT = """You are CareerAI, a friendly and knowledgeable career counselor specializing in tech careers in India.

You help users with:
- Resume improvement advice
- Career path guidance
- Skill development recommendations
- Interview preparation (technical + HR)
- Job search strategies
- Salary expectations in India

Guidelines:
- Be encouraging, specific, and practical
- Give concrete examples and free learning resources
- Keep responses concise but complete
- Always suggest next actionable steps"""


def chat_stream(messages: list, resume_context: dict = None):
    """Yields text chunks. Routes to provider_chat configured in .env."""
    system = _build_system(resume_context)
    yield from _stream(messages[-20:], max_tokens=1000, system=system)


def _build_system(resume_context: dict = None) -> str:
    if not resume_context:
        return _SYSTEM_PROMPT
    skills = resume_context.get("skills", [])
    careers = [c.get("title") for c in (resume_context.get("career_matches") or [])]
    score = resume_context.get("resume_score")
    context_block = f"""

User resume context:
- Skills: {', '.join(skills[:15]) if skills else 'Not analyzed'}
- Resume score: {f'{score}/100' if score else 'Not scored'}
- Suggested careers: {', '.join(careers) if careers else 'Not analyzed'}"""
    return _SYSTEM_PROMPT + context_block