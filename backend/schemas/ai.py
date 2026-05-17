from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    lab_id: str
    experiment_id: str
    message: str
    current_code: str | None = None
    notebook_cells: list[dict] = Field(default_factory=list)
    active_step_id: int | None = None


class StepGenerationRequest(BaseModel):
    lab_id: str
    experiment_id: str
    document_ids: list[str] = Field(default_factory=list)


class CodeAssistantRequest(BaseModel):
    lab_id: str
    experiment_id: str
    action: str
    code: str | None = None
    selected_code: str | None = None
    terminal_output: str | None = None
    notebook_cells: list[dict] = Field(default_factory=list)
