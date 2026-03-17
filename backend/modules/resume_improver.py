import json
from modules.ai_client import chat


def analyze_resume_quality(resume_text: str, extracted_data: dict) -> dict:
    sections_found = list(extracted_data.get("sections", {}).keys())
    word_count = extracted_data.get("word_count", 0)

    prompt = f"""Analyze this resume and give a quality score plus issues.

Resume:
---
{resume_text[:2000]}
---
Sections present: {', '.join(sections_found)}
Word count: {word_count}

Reply with ONLY a JSON object. Keep all string values under 10 words each:
{{
  "overall_score": 72,
  "section_scores": {{"experience": 70, "skills": 85, "education": 90}},
  "issues": [
    {{"section": "experience", "issue": "No metrics", "severity": "high", "fix": "Add numbers like improved X by 30%"}},
    {{"section": "summary", "issue": "Too generic", "severity": "medium", "fix": "Add specific tech stack"}}
  ],
  "missing_sections": ["projects", "certifications"],
  "ats_friendly": true,
  "length_feedback": "Good length for a fresher",
  "top_3_improvements": ["Add project metrics", "Add GitHub link", "Quantify achievements"]
}}"""

    raw = chat(prompt, max_tokens=600, task='resume')
    return _parse(raw, {"overall_score": 60, "issues": [], "section_scores": {}, "top_3_improvements": []})


def rewrite_section(section_name: str, section_text: str, target_role: str = "") -> dict:
    role_ctx = f" for {target_role} role" if target_role else ""
    prompt = f"""Rewrite this resume section{role_ctx}. Use strong action verbs. Quantify where possible.

Section: {section_name}
Original:
{section_text[:700]}

Reply ONLY with JSON:
{{"improved": "rewritten text here", "changes_made": ["Used action verbs", "Added metrics"]}}"""

    raw = chat(prompt, max_tokens=500, task='resume')
    result = _parse(raw, {"improved": section_text, "changes_made": []})
    result["original"] = section_text
    return result


def _parse(raw: str, default: dict) -> dict:
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
            result = json.loads(cleaned[start:end])
            # Ensure overall_score is a valid number
            if "overall_score" in result:
                result["overall_score"] = float(result["overall_score"]) if result["overall_score"] else 0
            return result
    except Exception as e:
        print(f"[resume_improver] parse error: {e} | raw: {raw[:200]}")
    return default