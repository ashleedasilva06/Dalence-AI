import json
from pathlib import Path
from modules.ai_client import chat

_CAREERS_REGISTRY = json.loads(
    (Path(__file__).parent.parent / "data" / "careers_registry.json").read_text()
)


def analyze_skill_gap(current_skills: list, target_career_id: str = None, target_job_description: str = None) -> dict:
    if target_career_id:
        career = next((c for c in _CAREERS_REGISTRY["careers"] if c["id"] == target_career_id), None)
        target_context = json.dumps(career, indent=2) if career else "Unknown career"
    elif target_job_description:
        target_context = f"Job Description:\n{target_job_description[:1500]}"
    else:
        return {"error": "Provide target_career_id or target_job_description"}

    prompt = f"""You are a senior tech career mentor.

Candidate's current skills: {', '.join(current_skills) if current_skills else 'None'}

Target role:
{target_context}

Perform a detailed skill gap analysis with free learning resources.

Respond ONLY with valid JSON:
{{
  "critical_gaps": [
    {{
      "skill": "Docker",
      "why_important": "Required for deployment",
      "how_to_learn": "Docker official docs + freeCodeCamp YouTube",
      "time_estimate": "2-3 weeks"
    }}
  ],
  "nice_to_have_gaps": [],
  "strengths": ["Python is strong"],
  "overall_readiness": 0.65,
  "learning_roadmap": [
    {{
      "week": "1-2",
      "focus": "Docker basics",
      "resources": ["docs.docker.com"]
    }}
  ]
}}"""

    raw = chat(prompt, max_tokens=2000, task='careers')
    try:
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception:
        return {"error": "Could not parse AI response"}