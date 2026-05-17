from pathlib import Path

try:
    from pypdf import PdfReader
except ModuleNotFoundError:
    PdfReader = None


class DocumentLoader:
    def load_text(self, path: str) -> str:
        file_path = Path(path)
        suffix = file_path.suffix.lower()

        if suffix == ".pdf":
            if PdfReader is None:
                return "[PDF parser unavailable] Install backend requirements to extract PDF text."
            reader = PdfReader(str(file_path))
            return "\n".join(page.extract_text() or "" for page in reader.pages)

        if suffix in {".txt", ".md"}:
            return file_path.read_text(encoding="utf-8")

        if suffix in {".png", ".jpg", ".jpeg"}:
            return "[OCR placeholder] Image OCR will extract diagrams, labels, and screenshots here."

        return "[Document parser placeholder] DOCX/manual parsing hook."
