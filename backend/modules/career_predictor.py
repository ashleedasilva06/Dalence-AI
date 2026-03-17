import json
from pathlib import Path
from modules.ai_client import chat

_CAREERS_REGISTRY = json.loads(
    (Path(__file__).parent.parent / "data" / "careers_registry.json").read_text()
)


def predict_careers(skills: list, extracted_data: dict, resume_text: str) -> list:
    prompt = f"""You are a senior career counselor specializing in tech careers in India.

Available career paths:
{json.dumps(_CAREERS_REGISTRY["careers"], indent=2)}

Candidate profile:
- Detected skills: {', '.join(skills) if skills else 'None'}
- Education: {extracted_data.get('sections', {}).get('education', 'Not found')}
- Experience: {extracted_data.get('sections', {}).get('experience', 'Not found')}
- Projects: {extracted_data.get('sections', {}).get('projects', 'Not found')}

Resume excerpt:
---
{resume_text[:1500]}
---

Suggest TOP 3 most suitable career paths. Be encouraging but honest about gaps.

Respond ONLY with valid JSON:
{{
  "career_matches": [
    {{
      "career_id": "full_stack_developer",
      "title": "Full Stack Developer",
      "score": 0.85,
      "reasons": ["Strong Python skills"],
      "missing_skills": ["React"],
      "roadmap_tip": "Focus on React for 2 months"
    }}
  ]
}}"""

    raw = chat(prompt, max_tokens=2000, task='careers')
    try:
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip()).get("career_matches", [])
    except Exception:
        return []