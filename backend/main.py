"""
FastAPI application — entry point.
Run with: uvicorn backend.main:app --reload
"""
from contextlib import asynccontextmanager
from typing import Optional

import asyncio
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.config import get_settings
from backend.graph import get_graph
from backend.database import db_manager



# ---------------------------------------------------------------------------
# Warm up on startup (compile graph; vectorstore loads if resume exists)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up — loading resources...")
    get_graph()            # triggers get_vectorstore → get_embeddings internally
    from backend.dependencies import get_retriever
    if get_retriever() is None:
        print("[INFO] No resume loaded -- the AI will give generic advice until a resume is provided")
    print("✅ Ready!")
    yield


app = FastAPI(
    title="Pathfinder — AI Career Mentor API",
    description="LangGraph-powered career mentor for Indian tech students",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    # Make `message` optional in Swagger so the client can send any text
    # without being forced to provide this field explicitly.
    message: str = ""
    github_username: str | None = None
    leetcode_username: str | None = None
    role: str | None = None             # target role (e.g. "SDE-1", "Backend Intern")
    company: str | None = None          # target company (e.g. "Razorpay", "Google")
    summary: str = ""                   # pass back the previous summary for multi-turn


class ChatResponse(BaseModel):
    output: str
    summary: str                # updated summary to return to client for next turn


class UsernamesRequest(BaseModel):
    github: str
    leetcode: str


class UserDataResponse(BaseModel):
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None
    resume_file_path: Optional[str] = None
    resume_text: Optional[str] = None


class UploadResponse(BaseModel):
    success: bool
    message: str
    file_path: Optional[str] = None
    ats_data: Optional[dict] = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request):
    if not (req.message or "").strip():
        # If the client didn't send a message, return a friendly prompt instead
        # of letting downstream nodes operate on an empty input.
        return ChatResponse(output="Please send a chat message.", summary=req.summary)

    graph = get_graph()

    state_input = {
        "input": req.message,
        "summary": req.summary,
        "data": {},
        "decision": {},
        "output": "",
        "role": req.role or "",
        "company": req.company or "",
    }
    if req.github_username:
        state_input["github_username"] = req.github_username
    if req.leetcode_username:
        state_input["leetcode_username"] = req.leetcode_username

    graph_task = asyncio.create_task(graph.ainvoke(state_input))
    
    while not graph_task.done():
        if await request.is_disconnected():
            print("[INFO] Client disconnected from /chat - cancelling execution.")
            graph_task.cancel()
            break
        await asyncio.sleep(0.5)

    try:
        result = await graph_task
        return ChatResponse(
            output=result["output"],
            summary=result.get("summary", req.summary),
        )
    except asyncio.CancelledError:
        return ChatResponse(output="Request aborted.", summary=req.summary)


@app.post("/update-usernames")
def update_usernames(req: UsernamesRequest):
    """Update GitHub and LeetCode usernames in app_config."""
    try:
        success = db_manager.update_usernames(req.github, req.leetcode)
        if success:
            return {"success": True, "message": "Usernames updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update usernames")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload-resume", response_model=UploadResponse)
def upload_resume(file: UploadFile = File(...)):
    """Upload resume PDF to Supabase Storage and extract text."""
    # Validate file type
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        # Read file content
        file_content = file.file.read()
        if not file_content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        print(f"[upload-resume] Received '{file.filename}', size={len(file_content)} bytes")

        # Upload and extract text
        result = db_manager.upload_resume(file_content, file.filename)

        if result:
            print(f"[upload-resume] Success — stored at {result['file_path']}")
            
            # Form ATS score
            ats_data = None
            try:
                from backend.advancedats import AdvancedATSScorer
                scorer = AdvancedATSScorer()
                ats_result = scorer.score(resume_text=result["text_content"])
                ats_data = {
                    "component_breakdown": {
                        "total_score": ats_result.total_score,
                        "skill_match": ats_result.skill_match_score,
                        "experience_quality": ats_result.experience_score,
                        "project_quality": ats_result.project_quality_score,
                        "resume_structure": ats_result.structure_score,
                        "job_relevance": ats_result.relevance_score
                    },
                    "matched_skills": ats_result.matched_skills,
                    "missing_critical_skills": ats_result.missing_critical_skills,
                    "gaps_identified": ats_result.gaps,
                    "recommendations": ats_result.recommendations
                }
            except Exception as e:
                print(f"[upload-resume] Could not calculate ATS score: {e}")

            # Reload RAG vectorstore so the AI has the latest resume context instantly
            from backend.dependencies import reload_retriever
            reload_retriever()
            
            return UploadResponse(
                success=True,
                message="Resume uploaded and processed successfully",
                file_path=result["file_path"],
                ats_data=ats_data
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to upload resume to storage. Check Supabase bucket policies and credentials."
            )
    except HTTPException:
        raise  # re-raise HTTP exceptions as-is
    except Exception as e:
        print(f"[upload-resume] Unhandled error: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading resume: {str(e)}")


@app.get("/user-data", response_model=UserDataResponse)
def get_user_data():
    """Get current user data from app_config."""
    try:
        data = db_manager.get_user_data()
        if data:
            return UserDataResponse(**data)
        else:
            return UserDataResponse()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/roles")
def get_roles():
    """Get all roles from the database."""
    try:
        roles = db_manager.get_roles()
        return {"roles": roles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/orbit-data/{identifier}")
def get_orbit_data(identifier: str):
    """Get specific role information and dynamic company rings."""
    try:
        role_data = db_manager.get_role(identifier)
        companies_data = db_manager.get_companies()
        return {
            "role": role_data if role_data else {"name": identifier.capitalize(), "description": ""},
            "companies": companies_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/test-db")
def test_database():
    """Test database connection and table structure."""
    try:
        # Test connection
        response = db_manager.supabase.table("app_config").select("*").limit(1).execute()
        return {
            "status": "success",
            "message": "Database connection working",
            "data": response.data,
            "error": None
        }
    except Exception as e:
        return {
            "status": "error", 
            "message": "Database connection failed",
            "error": str(e)
        }
