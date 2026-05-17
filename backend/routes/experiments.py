from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.app.supabase_client import get_supabase_admin

router = APIRouter()


class ExperimentPayload(BaseModel):
    title: str
    description: str | None = None
    objective: str | None = None
    type: str = "code"
    editor_mode: str | None = None
    difficulty: str | None = None
    points: int = 0
    status: str = "draft"
    starter_code: str | None = None
    constraints: list[str] = Field(default_factory=list)
    test_cases: list[dict] = Field(default_factory=list)
    knowledge_files: list[dict] = Field(default_factory=list)
    steps: list[dict] = Field(default_factory=list)


@router.get("/{lab_id}")
async def list_experiments(lab_id: str):
    client = get_supabase_admin()
    if not client:
        return {"lab_id": lab_id, "items": [], "source": "local"}

    response = (
        client.table("experiments")
        .select("*")
        .eq("lab_id", lab_id)
        .order("updated_at", desc=True)
        .execute()
    )
    return {"lab_id": lab_id, "items": response.data or [], "source": "supabase"}


@router.post("/{lab_id}")
async def create_experiment(lab_id: str, payload: ExperimentPayload):
    row = {
        "lab_id": lab_id,
        "title": payload.title,
        "description": payload.description,
        "objective": payload.objective,
        "type": payload.type,
        "editor_mode": payload.editor_mode,
        "difficulty": payload.difficulty,
        "points": payload.points,
        "status": payload.status,
        "starter_code": payload.starter_code,
        "constraints": payload.constraints,
        "test_cases": payload.test_cases,
        "knowledge_files": payload.knowledge_files,
        "steps": payload.steps,
    }
    client = get_supabase_admin()
    if not client:
        return {"lab_id": lab_id, "item": row, "source": "local"}

    response = client.table("experiments").insert(row).execute()
    return {"lab_id": lab_id, "item": response.data[0] if response.data else row, "source": "supabase"}
