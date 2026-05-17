from backend.ai.prompts.templates import STEP_GENERATOR_SYSTEM
from backend.ai.providers.grok import GrokProvider
from backend.rag.context_builder import RAGContextBuilder
from backend.schemas.ai import StepGenerationRequest


class StepGenerationService:
    def __init__(self) -> None:
        self.provider = GrokProvider()
        self.context_builder = RAGContextBuilder()

    async def generate(self, request: StepGenerationRequest) -> str:
        context = await self.context_builder.build_for_documents(
            lab_id=request.lab_id,
            experiment_id=request.experiment_id,
            document_ids=request.document_ids,
        )
        prompt = f"""
        Generate structured lab guidance from this retrieved context.

        Context:
        {context}

        Return markdown with:
        - Aim
        - Theory
        - Procedure
        - Substeps
        - Warnings
        - Troubleshooting
        - Expected outputs
        - Commands
        - Hints
        """
        return await self.provider.complete(prompt, system=STEP_GENERATOR_SYSTEM)
