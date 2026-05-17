class ChunkingService:
    def chunk(self, text: str, *, chunk_size: int = 900, overlap: int = 120) -> list[str]:
        if not text:
            return []

        chunks: list[str] = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end].strip())
            start = end if end >= len(text) else max(end - overlap, start + 1)
        return [chunk for chunk in chunks if chunk]
