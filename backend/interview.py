"""
FastAPI router for mock interview endpoints.

Provides two endpoints:
1. POST /api/interview/token — signs a LiveKit JWT with job_role as room metadata
2. POST /api/interview/save  — persists interview answers to disk
"""

from __future__ import annotations

import os
import json
import logging
from datetime import timedelta
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Load root .env so LIVEKIT_* vars are available via os.getenv()
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=str(ROOT_DIR / ".env"), override=False)

logger = logging.getLogger("ai-interviewer.api")

PROJECT_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# LiveKit token signing
# ---------------------------------------------------------------------------
from livekit.api import AccessToken, VideoGrants

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "")
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "")

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/api/interview", tags=["interview"])

# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------
class TokenRequest(BaseModel):
    job_role: str


class TokenResponse(BaseModel):
    token: str
    room_name: str
    livekit_url: str


class SaveRequest(BaseModel):
    room_name: str
    job_role: str
    answers: list[dict] | None = None


class SaveResponse(BaseModel):
    status: str
    path: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.post("/token", response_model=TokenResponse)
async def create_token(req: TokenRequest):
    """Sign a LiveKit JWT with the job_role embedded as room metadata."""
    job_role = req.job_role.strip()
    if not job_role:
        raise HTTPException(status_code=400, detail="job_role is required")

    if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise HTTPException(
            status_code=500,
            detail="LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set in environment",
        )

    # Use a URL-safe slug for the room name (replace spaces with underscores)
    role_slug = job_role.replace(" ", "_")
    room_name = f"interview-{role_slug}-{uuid4().hex[:8]}"

    print(f"[TOKEN] Creating interview room: name={room_name}, job_role={job_role}")

    from livekit.protocol import room as room_proto

    room_config = room_proto.RoomConfiguration(
        name=room_name,
        metadata=json.dumps({"job_role": job_role}),
    )

    token = (
        AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        .with_identity("candidate")
        .with_name("Candidate")
        .with_grants(
            VideoGrants(
                room_join=True,
                room=room_name,
                room_create=True,
                can_publish=True,
                can_subscribe=True,
            )
        )
        .with_metadata(json.dumps({"job_role": job_role}))
        .with_room_config(room_config)
        .with_ttl(timedelta(hours=2))
    )

    # Token expires after 2 hours
    jwt_token = token.to_jwt()

    logger.info("Issued token for room=%s job_role=%s", room_name, job_role)

    return TokenResponse(
        token=jwt_token,
        room_name=room_name,
        livekit_url=LIVEKIT_URL,
    )


@router.post("/save", response_model=SaveResponse)
async def save_interview(req: SaveRequest):
    """Persist interview answers to a local JSON file."""
    save_dir = PROJECT_DIR / "saved_interviews"
    save_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{req.room_name}.json"
    filepath = save_dir / filename

    payload = {
        "room_name": req.room_name,
        "job_role": req.job_role,
        "answers": req.answers or [],
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    logger.info("Saved interview to %s", filepath)

    return SaveResponse(status="ok", path=str(filepath))
