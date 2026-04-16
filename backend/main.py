"""
FastAPI application — entry point.
Run with: uvicorn backend.main:app --reload
"""
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
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
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000"],  # frontend origins
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
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

    result = graph.invoke(state_input)

    return ChatResponse(
        output=result["output"],
        summary=result.get("summary", req.summary),
    )


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
    try:
        # Validate file type
        if not file.filename or not file.filename.lower().endswith('.pdf'):
            return UploadResponse(
                success=False,
                message="Only PDF files are allowed"
            )
        
        # Read file content
        file_content = file.file.read()
        
        # Upload and extract text
        result = db_manager.upload_resume(file_content, file.filename)
        
        if result:
            return UploadResponse(
                success=True,
                message="Resume uploaded and processed successfully",
                file_path=result["file_path"]
            )
        else:
            return UploadResponse(
                success=False,
                message="Failed to upload or process resume"
            )
    except Exception as e:
        return UploadResponse(
            success=False,
            message=f"Error uploading resume: {str(e)}"
        )


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
