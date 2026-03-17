"""
Unified AI client with per-feature provider routing.
Each feature (skills, careers, resume, chat, jobs) can use a different provider.
Fallback to OpenRouter if primary provider rate-limits.
Add a new provider by adding a _xxx_chat() function — zero other changes needed.
"""

import httpx
import json
import time
from config import get_settings

settings = get_settings()


def chat(prompt: str, max_tokens: int = 1500, system: str = "", task: str = "default") -> str:
    """
    Send a prompt, get a response.
    task: "skills" | "careers" | "resume" | "chat" | "jobs" | "default"
    Routes to the configured provider for that task, with OpenRouter fallback.
    """
    provider = _get_provider(task)
    try:
        return _call(provider, prompt, max_tokens, system)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            print(f"[AI] {provider} rate limited for task={task}, falling back to OpenRouter")
            time.sleep(3)
            return _openrouter_chat(prompt, max_tokens, system)
        raise
    except Exception as e:
        print(f"[AI] {provider} error: {e}, falling back to OpenRouter")
        return _openrouter_chat(prompt, max_tokens, system)


def stream_chat(messages: list, max_tokens: int = 1000, system: str = ""):
    """Streaming chat — always uses chat provider (Gemini by default)."""
    provider = settings.provider_chat
    try:
        if provider == "gemini":
            yield from _gemini_stream(messages, max_tokens, system)
        elif provider == "groq":
            yield from _groq_stream(messages, max_tokens, system)
        else:
            yield from _openrouter_stream(messages, max_tokens, system)
    except Exception as e:
        print(f"[AI stream] {provider} error: {e}, falling back to OpenRouter")
        yield from _openrouter_stream(messages, max_tokens, system)


# ─── Internal routing ──────────────────────────────────────────────

def _get_provider(task: str) -> str:
    mapping = {
        "skills":  settings.provider_skills,
        "careers": settings.provider_careers,
        "resume":  settings.provider_resume,
        "chat":    settings.provider_chat,
        "jobs":    settings.provider_jobs,
    }
    return mapping.get(task, "groq")


def _call(provider: str, prompt: str, max_tokens: int, system: str) -> str:
    if provider == "groq":
        return _groq_chat(prompt, max_tokens, system)
    elif provider == "gemini":
        return _gemini_chat(prompt, max_tokens, system)
    elif provider == "anthropic":
        return _anthropic_chat(prompt, max_tokens, system)
    else:
        return _openrouter_chat(prompt, max_tokens, system)


# ─── Groq ──────────────────────────────────────────────────────────

def _groq_chat(prompt: str, max_tokens: int, system: str) -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    response = httpx.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": settings.groq_model,
            "max_tokens": max_tokens,
            "messages": messages,
            "temperature": 0.3,
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def _groq_stream(messages: list, max_tokens: int, system: str):
    all_messages = []
    if system:
        all_messages.append({"role": "system", "content": system})
    all_messages.extend(messages[-20:])

    with httpx.stream(
        "POST",
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": settings.groq_model,
            "max_tokens": max_tokens,
            "messages": all_messages,
            "stream": True,
            "temperature": 0.7,
        },
        timeout=60,
    ) as response:
        for line in response.iter_lines():
            if line.startswith("data: ") and line != "data: [DONE]":
                try:
                    chunk = json.loads(line[6:])
                    delta = chunk["choices"][0]["delta"].get("content", "")
                    if delta:
                        yield delta
                except Exception:
                    continue


# ─── Gemini ────────────────────────────────────────────────────────

def _gemini_chat(prompt: str, max_tokens: int, system: str) -> str:
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": max_tokens, "temperature": 0.3},
    }
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}

    response = httpx.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent",
        params={"key": settings.gemini_api_key},
        json=body,
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["candidates"][0]["content"]["parts"][0]["text"]


def _gemini_stream(messages: list, max_tokens: int, system: str):
    """Gemini doesn't stream reliably via REST — simulate word-by-word."""
    gemini_messages = []
    for msg in messages[-20:]:
        role = "model" if msg["role"] == "assistant" else "user"
        gemini_messages.append({"role": role, "parts": [{"text": msg["content"]}]})

    body = {
        "contents": gemini_messages,
        "generationConfig": {"maxOutputTokens": max_tokens, "temperature": 0.7},
    }
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}

    response = httpx.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent",
        params={"key": settings.gemini_api_key},
        json=body,
        timeout=60,
    )
    response.raise_for_status()
    text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    # Simulate streaming word by word
    words = text.split(" ")
    for i, word in enumerate(words):
        yield word + (" " if i < len(words) - 1 else "")
        time.sleep(0.02)


# ─── Anthropic ─────────────────────────────────────────────────────

def _anthropic_chat(prompt: str, max_tokens: int, system: str) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    kwargs = {
        "model": settings.claude_model,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system:
        kwargs["system"] = system
    return client.messages.create(**kwargs).content[0].text


# ─── OpenRouter (fallback) ─────────────────────────────────────────

def _openrouter_chat(prompt: str, max_tokens: int, system: str) -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    response = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "AI Career Platform",
        },
        json={
            "model": settings.openrouter_model,
            "max_tokens": max_tokens,
            "messages": messages,
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def _openrouter_stream(messages: list, max_tokens: int, system: str):
    all_messages = []
    if system:
        all_messages.append({"role": "system", "content": system})
    all_messages.extend(messages[-20:])

    with httpx.stream(
        "POST",
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
        },
        json={
            "model": settings.openrouter_model,
            "max_tokens": max_tokens,
            "messages": all_messages,
            "stream": True,
        },
        timeout=60,
    ) as response:
        for line in response.iter_lines():
            if line.startswith("data: ") and line != "data: [DONE]":
                try:
                    chunk = json.loads(line[6:])
                    delta = chunk["choices"][0]["delta"].get("content", "")
                    if delta:
                        yield delta
                except Exception:
                    continue