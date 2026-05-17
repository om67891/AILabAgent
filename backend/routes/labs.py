from secrets import token_hex

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.supabase_client import get_supabase_admin

router = APIRouter()


class LabPayload(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None
    type: str | None = "code"
    teacher_id: str | None = None


class JoinLabPayload(BaseModel):
    lab_code: str
    student_id: str | None = None


@router.get("/")
async def list_labs():
    client = get_supabase_admin()
    if not client:
        return {"items": [], "source": "local"}

    response = client.table("labs").select("*").order("updated_at", desc=True).execute()
    return {"items": response.data or [], "source": "supabase"}


@router.get("/{lab_id}")
async def get_lab(lab_id: str):
    client = get_supabase_admin()
    if not client:
        raise HTTPException(status_code=404, detail="Lab not found")

    response = client.table("labs").select("*").eq("id", lab_id).single().execute()
    return {"item": response.data}


@router.post("/")
async def create_lab(payload: LabPayload):
    client = get_supabase_admin()
    lab_code = token_hex(5).upper()
    row = {
        "teacher_id": payload.teacher_id,
        "title": payload.title,
        "description": payload.description,
        "lab_code": lab_code,
        "category": payload.category,
        "type": payload.type,
    }

    if not client:
        return {"item": {**row, "id": token_hex(8)}, "source": "local"}

    response = client.table("labs").insert(row).execute()
    return {"item": response.data[0] if response.data else row, "source": "supabase"}


@router.post("/join")
async def join_lab(payload: JoinLabPayload):
    client = get_supabase_admin()
    if not client:
        return {"joined": True, "source": "local"}

    lab_response = client.table("labs").select("*").eq("lab_code", payload.lab_code).single().execute()
    lab = lab_response.data
    if not lab:
        raise HTTPException(status_code=404, detail="Lab code not found")

    if payload.student_id:
        client.table("lab_enrollments").upsert(
            {"lab_id": lab["id"], "student_id": payload.student_id},
            on_conflict="lab_id,student_id",
        ).execute()

    return {"joined": True, "lab": lab, "source": "supabase"}
