"""
Module 5 — Vector Database (ChromaDB)
Stores and queries embeddings for resumes and jobs.
Runs in-process — no separate server needed for development.
For production: swap to ChromaDB cloud or Pinecone by changing this file only.
"""

import chromadb
from chromadb.config import Settings as ChromaSettings
from config import get_settings
from functools import lru_cache

settings = get_settings()


@lru_cache(maxsize=1)
def _get_client() -> chromadb.Client:
    return chromadb.PersistentClient(
        path=settings.chroma_persist_dir,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


def _resumes_collection():
    return _get_client().get_or_create_collection(
        name="resumes",
        metadata={"hnsw:space": "cosine"},
    )


def _jobs_collection():
    return _get_client().get_or_create_collection(
        name="jobs",
        metadata={"hnsw:space": "cosine"},
    )


# ─── Resume operations ─────────────────────────────────────────────

def upsert_resume(chroma_id: str, embedding: list[float], metadata: dict):
    """Store or update a resume embedding."""
    _resumes_collection().upsert(
        ids=[chroma_id],
        embeddings=[embedding],
        metadatas=[metadata],
    )


def delete_resume(chroma_id: str):
    _resumes_collection().delete(ids=[chroma_id])


# ─── Job operations ────────────────────────────────────────────────

def upsert_job(chroma_id: str, embedding: list[float], metadata: dict):
    """Store or update a job embedding."""
    _jobs_collection().upsert(
        ids=[chroma_id],
        embeddings=[embedding],
        metadatas=[metadata],
    )


def query_jobs_by_resume(resume_embedding: list[float], top_k: int = 10) -> list[dict]:
    """
    Find the top_k most similar jobs for a given resume embedding.
    Returns: [{ chroma_id, score, metadata }, ...]
    """
    results = _jobs_collection().query(
        query_embeddings=[resume_embedding],
        n_results=top_k,
        include=["metadatas", "distances"],
    )
    output = []
    ids       = results["ids"][0]
    distances = results["distances"][0]
    metadatas = results["metadatas"][0]
    for cid, dist, meta in zip(ids, distances, metadatas):
        output.append({
            "chroma_id": cid,
            "score": round(1 - dist, 4),   # cosine distance → similarity
            "metadata": meta,
        })
    return output


def query_similar_resumes(resume_embedding: list[float], top_k: int = 5) -> list[dict]:
    """Find resumes similar to a given one (for admin/analytics)."""
    results = _resumes_collection().query(
        query_embeddings=[resume_embedding],
        n_results=top_k,
        include=["metadatas", "distances"],
    )
    output = []
    for cid, dist, meta in zip(
        results["ids"][0], results["distances"][0], results["metadatas"][0]
    ):
        output.append({"chroma_id": cid, "score": round(1 - dist, 4), "metadata": meta})
    return output
