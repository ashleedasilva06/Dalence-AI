import json
from modules.ai_client import chat
from modules.vector_store import query_jobs_by_resume
from modules.embedder import generate_embedding


def match_jobs_to_resume(resume_text: str, skills: list, top_k: int = 10) -> list:
    resume_embedding = generate_embedding(resume_text)
    vector_matches = query_jobs_by_resume(resume_embedding, top_k=top_k)
    if not vector_matches:
        return []
    return _ai_rerank(vector_matches, skills, resume_text)


def match_resume_to_job_description(resume_text: str, skills: list, job_description: str, job_title: str = "") -> dict:
    prompt = f"""You are an expert ATS system and career coach.

Job title: {job_title}
Job description:
---
{job_description[:2000]}
---
Candidate skills: {', '.join(skills)}
Resume excerpt:
---
{resume_text[:1500]}
---

Analyze the match between this resume and job description.

Respond ONLY with valid JSON:
{{
  "match_score": 0.72,
  "matched_skills": ["Python", "SQL"],
  "missing_skills": ["Docker"],
  "ats_keywords_found": ["machine learning"],
  "ats_keywords_missing": ["CI/CD"],
  "explanation": "Good Python match but lacks DevOps experience.",
  "suggestions": ["Add Docker to your skills section"]
}}"""

    raw = chat(prompt, max_tokens=1200, task='jobs')
    try:
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception:
        return {"match_score": 0, "error": "Could not parse AI response"}


def _ai_rerank(vector_matches: list, skills: list, resume_text: str) -> list:
    jobs_summary = [
        {
            "job_id": m["chroma_id"],
            "title": m["metadata"].get("title", ""),
            "company": m["metadata"].get("company", ""),
            "vector_score": m["score"],
            "required_skills": m["metadata"].get("required_skills", ""),
        }
        for m in vector_matches
    ]

    prompt = f"""Rerank these job matches for a candidate.

Candidate skills: {', '.join(skills)}
Resume: {resume_text[:600]}

Jobs:
{json.dumps(jobs_summary, indent=2)}

Respond ONLY with valid JSON:
{{
  "ranked_matches": [
    {{
      "job_id": "...",
      "title": "...",
      "company": "...",
      "match_score": 0.85,
      "matched_skills": ["Python"],
      "missing_skills": ["Docker"],
      "explanation": "Strong match"
    }}
  ]
}}"""

    raw = chat(prompt, max_tokens=1500, task='jobs')
    try:
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip()).get("ranked_matches", [])
    except Exception:
        return []