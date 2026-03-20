"""
Module 4 — Embedding Generator
In production (Render): skips sentence-transformers entirely, uses simple TF-IDF style vectors
In development: uses sentence-transformers all-MiniLM-L6-v2
"""

import os
import numpy as np
from functools import lru_cache

USE_LOCAL_MODEL = os.getenv("USE_LOCAL_EMBEDDINGS", "false").lower() == "true"


def _tfidf_embedding(text: str, dim: int = 384) -> list[float]:
    """Lightweight fallback embedding using character n-grams. No ML deps needed."""
    import hashlib, math
    words = text.lower().split()[:300]
    vec = np.zeros(dim)
    for i, word in enumerate(words):
        h = int(hashlib.md5(word.encode()).hexdigest(), 16)
        idx = h % dim
        vec[idx] += 1.0 / math.log(i + 2)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()


@lru_cache(maxsize=1)
def _get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")


def generate_embedding(text: str) -> list[float]:
    text = _prepare_text(text)
    if USE_LOCAL_MODEL:
        model = _get_model()
        return model.encode(text, normalize_embeddings=True).tolist()
    return _tfidf_embedding(text)


def generate_batch_embeddings(texts: list[str]) -> list[list[float]]:
    if USE_LOCAL_MODEL:
        model = _get_model()
        prepared = [_prepare_text(t) for t in texts]
        return model.encode(prepared, normalize_embeddings=True, batch_size=32).tolist()
    return [_tfidf_embedding(_prepare_text(t)) for t in texts]


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    a, b = np.array(vec_a), np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))


def _prepare_text(text: str) -> str:
    words = text.split()
    return " ".join(words[:300]) if len(words) > 300 else text