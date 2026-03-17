"""
Interview Question Generator
Generates role-specific technical + HR questions with model answers.
Uses Groq for speed — typically responds in under 3 seconds.
"""

import json
from modules.ai_client import chat


def generate_interview_questions(
    job_role: str,
    experience_level: str = "fresher",
    skills: list = None,
    num_technical: int = 8,
    num_hr: int = 5,
) -> dict:
    """
    Returns:
    {
      "job_role": str,
      "experience_level": str,
      "technical_questions": [{ question, difficulty, topic, model_answer, tip }],
      "hr_questions": [{ question, category, model_answer, tip }],
      "preparation_tips": [str]
    }
    """
    skills_context = f"Candidate skills: {', '.join(skills[:10])}" if skills else ""

    prompt = f"""You are a senior technical interviewer at a top Indian tech company.

Generate a comprehensive interview question set for:
- Role: {job_role}
- Experience level: {experience_level}
- {skills_context}

Create exactly {num_technical} technical questions and {num_hr} HR questions.
For technical questions vary difficulty: 3 easy, 3 medium, 2 hard.
Make model answers concise but complete (2-4 sentences).
Tips should be practical and specific.

Reply ONLY with valid JSON:
{{
  "job_role": "{job_role}",
  "experience_level": "{experience_level}",
  "technical_questions": [
    {{
      "question": "Explain the difference between supervised and unsupervised learning.",
      "difficulty": "easy",
      "topic": "Machine Learning Basics",
      "model_answer": "Supervised learning uses labeled training data where the algorithm learns to map inputs to known outputs. Unsupervised learning finds hidden patterns in unlabeled data without predefined outputs. Examples: supervised - classification, regression; unsupervised - clustering, dimensionality reduction.",
      "tip": "Always give a real-world example to make your answer concrete."
    }}
  ],
  "hr_questions": [
    {{
      "question": "Tell me about yourself.",
      "category": "Introduction",
      "model_answer": "Start with your educational background, mention 2-3 key technical skills with projects, and end with why you are excited about this role. Keep it under 2 minutes.",
      "tip": "Practice this answer until it feels natural — it sets the tone for the entire interview."
    }}
  ],
  "preparation_tips": [
    "Review the company's tech stack and recent projects before the interview",
    "Prepare 2-3 examples of challenges you solved using STAR method"
  ]
}}"""

    raw = chat(prompt, max_tokens=3000, task="careers")
    return _parse(raw, job_role, experience_level)


def _parse(raw: str, job_role: str, experience_level: str) -> dict:
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
        print(f"[interview_generator] parse error: {e}")
    return {
        "job_role": job_role,
        "experience_level": experience_level,
        "technical_questions": [],
        "hr_questions": [],
        "preparation_tips": [],
        "error": "Failed to generate questions. Please try again."
    }