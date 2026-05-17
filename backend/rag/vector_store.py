import chromadb

from backend.app.config import get_settings


class VectorStore:
    def __init__(self) -> None:
        settings = get_settings()
        self.client = chromadb.PersistentClient(path=settings.chroma_dir)

    def upsert_chunks(self, collection_name: str, chunks: list[str], embeddings: list[list[float]], metadatas: list[dict]) -> None:
        collection = self.client.get_or_create_collection(collection_name)
        ids = [f"{collection_name}-{index}" for index in range(len(chunks))]
        collection.upsert(ids=ids, documents=chunks, embeddings=embeddings, metadatas=metadatas)

    def query(self, collection_name: str, query_embedding: list[float], *, limit: int = 6) -> list[str]:
        collection = self.client.get_or_create_collection(collection_name)
        result = collection.query(query_embeddings=[query_embedding], n_results=limit)
        documents = result.get("documents", [[]])
        return documents[0] if documents else []
