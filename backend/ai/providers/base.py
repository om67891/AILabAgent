from abc import ABC, abstractmethod
from collections.abc import AsyncIterator


class AIProvider(ABC):
    @abstractmethod
    async def complete(self, prompt: str, *, system: str) -> str:
        raise NotImplementedError

    @abstractmethod
    async def stream(self, prompt: str, *, system: str) -> AsyncIterator[str]:
        raise NotImplementedError
