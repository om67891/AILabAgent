from fastapi import APIRouter, Header, HTTPException

from backend.app.supabase_client import get_supabase_admin

router = APIRouter()


@router.get("/me")
async def current_user(authorization: str | None = Header(default=None)):
    client = get_supabase_admin()
    if not client:
        return {"user": None, "profile": None, "source": "local"}

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1]
    user_response = client.auth.get_user(token)
    user = user_response.user
    profile = None
    if user:
        profile_response = client.table("profiles").select("*").eq("id", user.id).single().execute()
        profile = profile_response.data

    return {"user": user.model_dump() if user else None, "profile": profile, "source": "supabase"}
