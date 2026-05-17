from __future__ import annotations

from typing import Any
from uuid import uuid4

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.config import get_settings
from backend.app.supabase_client import get_supabase_admin

router = APIRouter()


LANGUAGE_IDS = {
    "javascript": 63,
    "js": 63,
    "python": 71,
    "py": 71,
    "java": 62,
    "c++": 54,
    "cpp": 54,
}


class TestCasePayload(BaseModel):
    id: str | None = None
    input: str = ""
    expected_output: str | None = None


class RunCodePayload(BaseModel):
    code: str
    language: str
    stdin: str = ""
    test_cases: list[TestCasePayload] = Field(default_factory=list)


class SubmitCodePayload(RunCodePayload):
    experiment_id: str | None = None
    student_id: str | None = None


@router.post("/run")
async def run_code(payload: RunCodePayload):
    return await _execute_payload(payload)


@router.post("/submit")
async def submit_code(payload: SubmitCodePayload):
    result = await _execute_payload(payload)
    result["submission_id"] = str(uuid4())

    client = get_supabase_admin()
    if client and payload.experiment_id:
        try:
            client.table("submissions").insert(
                {
                    "id": result["submission_id"],
                    "experiment_id": payload.experiment_id,
                    "student_id": payload.student_id,
                    "status": result["status"],
                    "score": _score(result["results"]),
                    "output": result,
                }
            ).execute()
        except Exception as exc:
            result["persistence_error"] = str(exc)

    return result


async def _execute_payload(payload: RunCodePayload) -> dict[str, Any]:
    language_id = LANGUAGE_IDS.get(payload.language.strip().lower())
    if not language_id:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {payload.language}")

    cases = payload.test_cases or [TestCasePayload(input=payload.stdin)]
    results: list[dict[str, Any]] = []

    for case in cases:
        result = await _judge0_submit(
            code=_wrap_source(payload.code, payload.language),
            language_id=language_id,
            stdin=case.input,
        )
        stdout = result.get("stdout") or ""
        stderr = result.get("stderr") or ""
        compile_output = result.get("compile_output") or ""
        status = result.get("status", {}).get("description", "Unknown")
        passed = None
        if case.expected_output is not None:
            passed = _normalize(stdout) == _normalize(case.expected_output)

        results.append(
            {
                "id": case.id,
                "input": case.input,
                "expectedOutput": case.expected_output,
                "stdout": stdout,
                "stderr": stderr,
                "compileOutput": compile_output,
                "status": status,
                "time": result.get("time"),
                "memory": result.get("memory"),
                "passed": passed,
            }
        )

    primary = results[0] if results else {}
    failed = [item for item in results if item.get("passed") is False]
    status = "Accepted" if results and not failed and all(item.get("status") == "Accepted" for item in results) else primary.get("status", "Completed")

    return {
        "status": status,
        "stdout": primary.get("stdout", ""),
        "stderr": primary.get("stderr", ""),
        "compileOutput": primary.get("compileOutput", ""),
        "time": primary.get("time"),
        "memory": primary.get("memory"),
        "results": results,
    }


async def _judge0_submit(*, code: str, language_id: int, stdin: str) -> dict[str, Any]:
    settings = get_settings()
    headers = {"Content-Type": "application/json"}
    if settings.judge0_api_key:
        if settings.judge0_rapidapi_host:
            headers["X-RapidAPI-Key"] = settings.judge0_api_key
            headers["X-RapidAPI-Host"] = settings.judge0_rapidapi_host
        else:
            headers["Authorization"] = f"Bearer {settings.judge0_api_key}"

    url = f"{settings.judge0_api_url.rstrip('/')}/submissions"
    params = {"base64_encoded": "false", "wait": "true"}
    payload = {"source_code": code, "language_id": language_id, "stdin": stdin}

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(url, params=params, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Judge0 execution failed: {exc}") from exc


def _wrap_source(code: str, language: str) -> str:
    normalized = language.strip().lower()
    if normalized in {"javascript", "js"} and "function solve" in code and "readFileSync(0" not in code:
        return "\n".join(
            [
                "const fs = require('fs');",
                "const __input = fs.readFileSync(0, 'utf8');",
                code,
                "if (typeof solve === 'function') {",
                "  const __result = solve(__input);",
                "  if (__result !== undefined) console.log(__result);",
                "}",
            ]
        )

    if normalized in {"python", "py"} and "def solve" in code and "sys.stdin" not in code:
        return "\n".join(
            [
                "import sys",
                "__ailab_input = sys.stdin.read()",
                code,
                "if 'solve' in globals():",
                "    __result = solve(__ailab_input)",
                "    if __result is not None:",
                "        print(__result)",
            ]
        )

    return code


def _normalize(value: str) -> str:
    return "\n".join(line.rstrip() for line in value.strip().splitlines())


def _score(results: list[dict[str, Any]]) -> float:
    graded = [item for item in results if item.get("passed") is not None]
    if not graded:
        return 0
    return round(100 * sum(1 for item in graded if item.get("passed")) / len(graded), 2)
