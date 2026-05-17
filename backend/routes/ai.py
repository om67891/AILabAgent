from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from backend.ai.services.chat_service import ContextualChatService
from backend.ai.services.code_assistant_service import CodeNotebookAssistantService
from backend.ai.services.step_generation_service import StepGenerationService
from backend.schemas.ai import ChatRequest, CodeAssistantRequest, StepGenerationRequest


router = APIRouter()


@router.post("/chat/stream")
async def stream_chat(request: ChatRequest):
    service = ContextualChatService()

    async def tokens():
        async for token in service.stream(request):
            yield token

    return StreamingResponse(tokens(), media_type="text/plain")


@router.post("/steps/generate")
async def generate_steps(request: StepGenerationRequest):
    service = StepGenerationService()
    content = await service.generate(request)
    return {"content": content}


@router.post("/code/assist")
async def assist_code(request: CodeAssistantRequest):
    service = CodeNotebookAssistantService()
    content = await service.assist(request)
    return {"content": content}
