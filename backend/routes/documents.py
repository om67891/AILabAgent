from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, UploadFile

from backend.app.supabase_client import get_supabase_admin
from backend.rag.indexing_service import RAGIndexingService

router = APIRouter()


UPLOAD_ROOT = Path("backend/uploads")


@router.post("/upload")
async def upload_document(lab_id: str, experiment_id: str, file: UploadFile = File(...)):
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    document_id = str(uuid4())
    safe_name = Path(file.filename or "document").name
    local_path = UPLOAD_ROOT / f"{document_id}-{safe_name}"
    content = await file.read()
    local_path.write_bytes(content)

    storage_path = f"{lab_id}/{experiment_id}/{document_id}-{safe_name}"
    client = get_supabase_admin()
    storage_error = None
    if client:
        try:
            client.storage.from_("knowledge-base").upload(storage_path, content)
        except Exception as exc:  # Storage bucket may not exist yet in new projects.
            storage_error = str(exc)
        client.table("knowledge_documents").insert(
            {
                "id": document_id,
                "lab_id": lab_id,
                "experiment_id": experiment_id,
                "storage_path": storage_path,
                "file_name": safe_name,
                "mime_type": file.content_type,
                "indexed": False,
            }
        ).execute()

    index_result = RAGIndexingService().index_document(
        lab_id=lab_id,
        experiment_id=experiment_id,
        document_id=document_id,
        path=str(local_path),
    )

    if client:
        client.table("knowledge_documents").update({"indexed": True}).eq("id", document_id).execute()

    return {
        "id": document_id,
        "lab_id": lab_id,
        "experiment_id": experiment_id,
        "filename": safe_name,
        "storage_path": storage_path,
        "storage_error": storage_error,
        "indexed": True,
        "index": index_result,
    }


@router.post("/index")
async def index_document(lab_id: str, experiment_id: str, document_id: str, path: str):
    service = RAGIndexingService()
    return service.index_document(lab_id=lab_id, experiment_id=experiment_id, document_id=document_id, path=path)
