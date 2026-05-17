from backend.ai.prompts.templates import CODE_NOTEBOOK_SYSTEM
from backend.ai.providers.grok import GrokProvider
from backend.schemas.ai import CodeAssistantRequest


class CodeNotebookAssistantService:
    def __init__(self) -> None:
        self.provider = GrokProvider()

    async def assist(self, request: CodeAssistantRequest) -> str:
        prompt = f"""
        Action: {request.action}
        Code:
        {request.code or ""}

        Selected code:
        {request.selected_code or ""}

        Terminal output:
        {request.terminal_output or ""}

        Notebook cells:
        {request.notebook_cells}

        Give a concise educational response with a minimal fix or explanation.
        """
        return await self.provider.complete(prompt, system=CODE_NOTEBOOK_SYSTEM)
