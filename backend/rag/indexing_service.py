from backend.rag.chunking_service import ChunkingService
from backend.rag.document_loader import DocumentLoader
from backend.rag.embedding_service import EmbeddingService
from backend.rag.vector_store import VectorStore


class RAGIndexingService:
    def __init__(self) -> None:
        self.loader = DocumentLoader()
        self.chunker = ChunkingService()
        self.embeddings = EmbeddingService()
        self.store = VectorStore()

    def index_document(self, *, lab_id: str, experiment_id: str, document_id: str, path: str) -> dict:
        text = self.loader.load_text(path)
        chunks = self.chunker.chunk(text)
        vectors = self.embeddings.embed(chunks)
        collection = f"lab_{lab_id}_experiment_{experiment_id}"
        metadatas = [{"document_id": document_id, "lab_id": lab_id, "experiment_id": experiment_id} for _ in chunks]
        self.store.upsert_chunks(collection, chunks, vectors, metadatas)
        return {"collection": collection, "chunks": len(chunks)}
