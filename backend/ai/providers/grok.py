from collections.abc import AsyncIterator
import json

import httpx

from backend.ai.providers.base import AIProvider
from backend.app.config import get_settings


class GrokProvider(AIProvider):
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = "https://api.x.ai/v1/chat/completions"

    async def complete(self, prompt: str, *, system: str) -> str:
        if not self.settings.grok_api_key:
            return "Grok API key is not configured. Set GROK_API_KEY before calling the live provider."

        payload = {
            "model": self.settings.grok_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        }
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(self.base_url, headers=self._headers(), json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def stream(self, prompt: str, *, system: str) -> AsyncIterator[str]:
        if not self.settings.grok_api_key:
            yield "Grok API key is not configured. Set GROK_API_KEY before streaming."
            return

        payload = {
            "model": self.settings.grok_model,
            "stream": True,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        }
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", self.base_url, headers=self._headers(), json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    raw = line.removeprefix("data: ")
                    if raw == "[DONE]":
                        break
                    chunk = json.loads(raw)
                    token = chunk["choices"][0].get("delta", {}).get("content")
                    if token:
                        yield token

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.settings.grok_api_key}",
            "Content-Type": "application/json",
        }
