"""
Module 5 — Vector Store (ChromaDB optional)
In production on Render, ChromaDB is skipped. Embeddings are stored in PostgreSQL as JSON.
In development with USE_LOCAL_EMBEDDINGS=true, ChromaDB is used.
"""

import os
from functools import lru_cache

USE_LOCAL = os.getenv("USE_LOCAL_EMBEDDINGS", "false").lower() == "true"


def store_resume_embedding(resume_id: str, embedding: list[float], metadata: dict) -> bool:
    if not USE_LOCAL:
        return True  # no-op in production
    try:
        col = _resumes_collection()
        col.upsert(ids=[resume_id], embeddings=[embedding], metadatas=[metadata])
        return True
    except Exception as e:
        print(f"[VectorStore] store error: {e}")
        return False


def search_similar_resumes(query_embedding: list[float], n_results: int = 5) -> list[dict]:
    if not USE_LOCAL:
        return []
    try:
        col = _resumes_collection()
        results = col.query(query_embeddings=[query_embedding], n_results=n_results)
        return [{"id": id_, "score": 1 - dist, "metadata": meta}
                for id_, dist, meta in zip(results["ids"][0], results["distances"][0], results["metadatas"][0])]
    except Exception:
        return []


def delete_resume_embedding(resume_id: str) -> bool:
    if not USE_LOCAL:
        return True
    try:
        _resumes_collection().delete(ids=[resume_id])
        return True
    except Exception:
        return False


@lru_cache(maxsize=1)
def _get_client():
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    from config import get_settings
    settings = get_settings()
    return chromadb.PersistentClient(
        path=settings.chroma_persist_dir,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


def _resumes_collection():
    return _get_client().get_or_create_collection(name="resumes", metadata={"hnsw:space": "cosine"})