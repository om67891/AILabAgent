from backend.rag.embedding_service import EmbeddingService
from backend.rag.vector_store import VectorStore


class RetrievalService:
    def __init__(self) -> None:
        self.embeddings = EmbeddingService()
        self.store = VectorStore()

    def retrieve(self, collection_name: str, query: str, *, limit: int = 6) -> list[str]:
        query_embedding = self.embeddings.embed([query])[0]
        return self.store.query(collection_name, query_embedding, limit=limit)
