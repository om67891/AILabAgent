from backend.rag.retrieval_service import RetrievalService


class RAGContextBuilder:
    def __init__(self) -> None:
        self.retrieval = RetrievalService()

    async def build_for_experiment(self, lab_id: str, experiment_id: str, query: str) -> str:
        collection = self._collection_name(lab_id, experiment_id)
        chunks = self.retrieval.retrieve(collection, query)
        return self._render(chunks)

    async def build_for_documents(self, lab_id: str, experiment_id: str, document_ids: list[str]) -> str:
        collection = self._collection_name(lab_id, experiment_id)
        query = " ".join(document_ids) or "generate lab steps theory procedure warnings commands troubleshooting"
        chunks = self.retrieval.retrieve(collection, query)
        return self._render(chunks)

    def _collection_name(self, lab_id: str, experiment_id: str) -> str:
        return f"lab_{lab_id}_experiment_{experiment_id}"

    def _render(self, chunks: list[str]) -> str:
        if not chunks:
            return "No retrieved chunks yet. Use the document upload pipeline before live RAG generation."
        return "\n\n---\n\n".join(chunks)
