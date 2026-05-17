from collections.abc import AsyncIterator

from backend.ai.prompts.templates import CONTEXTUAL_CHATBOT_SYSTEM
from backend.ai.providers.grok import GrokProvider
from backend.rag.context_builder import RAGContextBuilder
from backend.schemas.ai import ChatRequest


class ContextualChatService:
    def __init__(self) -> None:
        self.provider = GrokProvider()
        self.context_builder = RAGContextBuilder()

    async def stream(self, request: ChatRequest) -> AsyncIterator[str]:
        context = await self.context_builder.build_for_experiment(
            lab_id=request.lab_id,
            experiment_id=request.experiment_id,
            query=request.message,
        )
        prompt = "\n".join(
            [
                context,
                f"Current code:\n{request.current_code or ''}",
                f"Notebook cells:\n{request.notebook_cells}",
                f"Student question:\n{request.message}",
            ]
        )
        async for token in self.provider.stream(prompt, system=CONTEXTUAL_CHATBOT_SYSTEM):
            yield token
