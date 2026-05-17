from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import get_settings
from backend.routes import ai, auth, code_execution, documents, experiments, labs, notebooks


settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(labs.router, prefix="/labs", tags=["labs"])
app.include_router(experiments.router, prefix="/experiments", tags=["experiments"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(notebooks.router, prefix="/notebooks", tags=["notebooks"])
app.include_router(code_execution.router, prefix="/execution", tags=["execution"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.app_name}
