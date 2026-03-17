"""
Module 2 — NLP Processor
Cleans resume text and extracts structured fields using spaCy.
No rules for skills — that's Module 3 (AI-based).
"""

import re
import json
from pathlib import Path


def process_resume_text(raw_text: str) -> dict:
    """
    Returns structured data extracted from resume text.
    { name, email, phone, linkedin, github, sections: {education, experience, ...} }
    """
    text = raw_text.strip()
    return {
        "name":     _extract_name(text),
        "email":    _extract_email(text),
        "phone":    _extract_phone(text),
        "linkedin": _extract_linkedin(text),
        "github":   _extract_github(text),
        "sections": _extract_sections(text),
        "word_count": len(text.split()),
    }


def _extract_email(text: str) -> str | None:
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    return match.group(0) if match else None


def _extract_phone(text: str) -> str | None:
    match = re.search(r"(\+?91[-.\s]?)?[6-9]\d{9}", text)
    return match.group(0) if match else None


def _extract_linkedin(text: str) -> str | None:
    match = re.search(r"linkedin\.com/in/[a-zA-Z0-9_-]+", text, re.IGNORECASE)
    return f"https://{match.group(0)}" if match else None


def _extract_github(text: str) -> str | None:
    match = re.search(r"github\.com/[a-zA-Z0-9_-]+", text, re.IGNORECASE)
    return f"https://{match.group(0)}" if match else None


def _extract_name(text: str) -> str | None:
    """
    Heuristic: the first non-empty line of a resume is usually the name.
    We also try spaCy PERSON entities as a fallback.
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if lines:
        first = lines[0]
        # A name line is typically short and has no special chars
        if len(first.split()) <= 5 and not re.search(r"[@|/\\]", first):
            return first
    # Fallback: try spaCy
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(text[:500])  # check only the top of the resume
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                return ent.text
    except Exception:
        pass
    return None


# Section headers commonly found in resumes
_SECTION_PATTERNS = {
    "education":   r"\b(education|academic|qualification)\b",
    "experience":  r"\b(experience|work history|employment|internship)\b",
    "skills":      r"\b(skills|technical skills|competencies|technologies)\b",
    "projects":    r"\b(projects|personal projects|academic projects)\b",
    "certifications": r"\b(certifications|certificates|courses)\b",
    "achievements": r"\b(achievements|awards|honors)\b",
    "summary":     r"\b(summary|objective|profile|about)\b",
}


def _extract_sections(text: str) -> dict:
    """
    Splits resume text into labelled sections.
    Returns { section_name: section_text, ... }
    """
    lines = text.split("\n")
    sections: dict[str, list[str]] = {}
    current_section = "header"
    sections[current_section] = []

    for line in lines:
        matched = None
        for section, pattern in _SECTION_PATTERNS.items():
            if re.search(pattern, line, re.IGNORECASE) and len(line.strip()) < 60:
                matched = section
                break
        if matched:
            current_section = matched
            sections.setdefault(current_section, [])
        else:
            sections.setdefault(current_section, []).append(line)

    # Join lines and strip blanks
    return {k: "\n".join(v).strip() for k, v in sections.items() if "\n".join(v).strip()}
