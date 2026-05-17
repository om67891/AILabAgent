from pydantic import BaseModel, Field
from fastapi import APIRouter

from backend.app.supabase_client import get_supabase_admin
from backend.routes.code_execution import _judge0_submit

router = APIRouter()


class NotebookCellPayload(BaseModel):
    id: str
    type: str
    source: str
    output: str | None = None


class ExecuteCellPayload(BaseModel):
    experiment_id: str
    cell_id: str
    source: str
    user_id: str | None = None


class SaveCellsPayload(BaseModel):
    cells: list[NotebookCellPayload] = Field(default_factory=list)
    user_id: str | None = None


@router.get("/{experiment_id}")
async def get_notebook(experiment_id: str):
    client = get_supabase_admin()
    if not client:
        return {"experiment_id": experiment_id, "cells": [], "source": "local"}

    response = (
        client.table("notebook_cells")
        .select("*")
        .eq("experiment_id", experiment_id)
        .order("cell_order")
        .execute()
    )
    return {"experiment_id": experiment_id, "cells": response.data or [], "source": "supabase"}


@router.post("/{experiment_id}/cells")
async def save_cells(experiment_id: str, payload: SaveCellsPayload):
    client = get_supabase_admin()
    if not client:
        return {"experiment_id": experiment_id, "saved": len(payload.cells), "source": "local"}

    rows = [
        {
            "id": cell.id,
            "experiment_id": experiment_id,
            "user_id": payload.user_id,
            "cell_order": index,
            "cell_type": cell.type,
            "source": cell.source,
            "output": cell.output,
        }
        for index, cell in enumerate(payload.cells)
    ]
    if rows:
        client.table("notebook_cells").upsert(rows).execute()
    return {"experiment_id": experiment_id, "saved": len(rows), "source": "supabase"}


@router.post("/execute-cell")
async def execute_cell(payload: ExecuteCellPayload):
    result = await _judge0_submit(code=payload.source, language_id=71, stdin="")
    output = result.get("stdout") or result.get("stderr") or result.get("compile_output") or ""
    status = result.get("status", {}).get("description", "Completed")

    client = get_supabase_admin()
    if client:
        client.table("notebook_cells").update({"output": output}).eq("id", payload.cell_id).execute()

    return {
        "experiment_id": payload.experiment_id,
        "cell_id": payload.cell_id,
        "output": output,
        "status": status,
        "time": result.get("time"),
    }
