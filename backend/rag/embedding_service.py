from __future__ import annotations

import hashlib
import math

from backend.app.config import get_settings


class EmbeddingService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.model = None
        if self.settings.embedding_model != "local-hash":
            try:
                from sentence_transformers import SentenceTransformer

                self.model = SentenceTransformer(self.settings.embedding_model)
            except Exception:
                self.model = None

    def embed(self, texts: list[str]) -> list[list[float]]:
        if self.model is not None:
            return self.model.encode(texts, normalize_embeddings=True).tolist()
        return [self._hash_embedding(text) for text in texts]

    def _hash_embedding(self, text: str, dimensions: int = 384) -> list[float]:
        vector = [0.0] * dimensions
        tokens = text.lower().split()
        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % dimensions
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            vector[index] += sign

        norm = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / norm for value in vector]
