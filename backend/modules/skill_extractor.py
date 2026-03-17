import json
from pathlib import Path
from modules.ai_client import chat

_SKILLS_REGISTRY = json.loads(
    (Path(__file__).parent.parent / "data" / "skills_registry.json").read_text()
)


def extract_skills(resume_text: str) -> dict:
    prompt = f"""List every technical skill, tool, library, framework, and technology mentioned in this resume.
Include ALL of them — programming languages, libraries, databases, tools, platforms.

Resume:
---
{resume_text[:2500]}
---

Reply with ONLY a JSON array of skill name strings, nothing else. Example:
["Python", "SQL", "Pandas", "TensorFlow", "Git"]"""

    raw = chat(prompt, max_tokens=500)
    skills = _parse_list(raw)

    # Score each skill — wait briefly to avoid rate limits
    import time
    time.sleep(5)
    scores = {}
    if skills:
        score_prompt = f"""Rate each skill's evidence strength in the resume: 0.9=used in multiple projects, 0.7=mentioned with context, 0.5=listed once.

Skills to score: {json.dumps(skills[:25])}
Resume excerpt: {resume_text[:600]}

Reply ONLY with a JSON object. Example: {{"Python": 0.9, "SQL": 0.7}}"""

        raw_scores = chat(score_prompt, max_tokens=400, task='skills')
        scores = _parse_dict(raw_scores)

    # Categorize
    categories = {cat: [] for cat in _SKILLS_REGISTRY["categories"]}
    additional = []
    for skill in skills:
        found = False
        for cat_key, cat_data in _SKILLS_REGISTRY["categories"].items():
            if any(skill.lower() == k.lower() for k in cat_data["skills"]):
                categories[cat_key].append(skill)
                found = True
                break
        if not found:
            additional.append(skill)

    return {
        "skills": skills,
        "skill_scores": scores,
        "skill_categories": categories,
        "additional_skills": additional,
    }


def _parse_list(raw: str) -> list:
    try:
        cleaned = raw.strip()
        # Strip markdown
        if "```" in cleaned:
            for part in cleaned.split("```"):
                if "[" in part:
                    cleaned = part.lstrip("json").strip()
                    break
        start = cleaned.find("[")
        end = cleaned.rfind("]") + 1
        if start >= 0 and end > start:
            return json.loads(cleaned[start:end])
    except Exception as e:
        print(f"[skill_extractor] list parse error: {e} | raw: {raw[:100]}")
    return []


def _parse_dict(raw: str) -> dict:
    try:
        cleaned = raw.strip()
        if "```" in cleaned:
            for part in cleaned.split("```"):
                if "{" in part:
                    cleaned = part.lstrip("json").strip()
                    break
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(cleaned[start:end])
    except Exception as e:
        print(f"[skill_extractor] dict parse error: {e} | raw: {raw[:100]}")
    return {}