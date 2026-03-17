"""
Module 4 — Embedding Generator
Converts resume/job text into semantic vectors using sentence-transformers.
Runs locally — zero API cost.
Model: all-MiniLM-L6-v2 (fast, 384-dim, great for semantic similarity)
"""

from functools import lru_cache
from sentence_transformers import SentenceTransformer
import numpy as np


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    """Load model once and cache — takes ~2s on first call."""
    return SentenceTransformer("all-MiniLM-L6-v2")


def generate_embedding(text: str) -> list[float]:
    """
    Converts text to a 384-dimensional vector.
    Returns a plain Python list (JSON-serializable, ChromaDB-compatible).
    """
    model = _get_model()
    text = _prepare_text(text)
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def generate_batch_embeddings(texts: list[str]) -> list[list[float]]:
    """Batch encode multiple texts — more efficient than calling one by one."""
    model = _get_model()
    prepared = [_prepare_text(t) for t in texts]
    embeddings = model.encode(prepared, normalize_embeddings=True, batch_size=32)
    return embeddings.tolist()


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Compute cosine similarity between two vectors.
    Returns a score between 0.0 (no match) and 1.0 (identical).
    """
    a = np.array(vec_a)
    b = np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))


def _prepare_text(text: str) -> str:
    """Truncate to model's max token limit (~256 words works well for MiniLM)."""
    words = text.split()
    if len(words) > 300:
        return " ".join(words[:300])
    return text
