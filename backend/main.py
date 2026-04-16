"""
FastAPI application — entry point.
Run with: uvicorn backend.main:app --reload
"""
from contextlib import asynccontextmanager
from typing import Optional

import asyncio
from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Form
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

class ResumeRoadmapRequest(BaseModel):
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None
    target_role: Optional[str] = "Backend Engineer"
    job_description: Optional[str] = None

class ResumeRoadmapResponse(BaseModel):
    success: bool
    markdown: str
    message: str


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
def upload_resume(
    file: Optional[UploadFile] = File(None), 
    job_description: Optional[str] = Form(None)
):
    """Upload resume PDF to Supabase Storage and extract text."""
    # Case A: New file provided - Upload and extract text
    if file and file.filename:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
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
                    print(f"[ATS] Recalculating score with JD: {job_description[:50]}...")
                    ats_result = scorer.score(
                        resume_text=result["text_content"],
                        job_description=job_description
                    )
                    print(f"[ATS] New Score generated: {ats_result.total_score}/10")
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
                    message="Resume processed successfully",
                    file_path=result["file_path"],
                    ats_data=ats_data
                )
            else:
                raise HTTPException(status_code=500, detail="Failed to upload resume to database")
        except Exception as e:
            print(f"[upload-resume] Error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # Case B: No new file provided - Try to re-score based on existing resume text
    else:
        print(f"[upload-resume] No file provided. Re-scoring existing resume...")
        user_data = db_manager.get_user_data()
        if not user_data or not user_data.get("resume_text"):
            if job_description:
                raise HTTPException(status_code=400, detail="No resume on file yet. Please upload a resume first to see ATS scoring.")
            return UploadResponse(success=True, message="Profile updated (No resume context)", file_path="")
        
        try:
            from backend.advancedats import AdvancedATSScorer
            scorer = AdvancedATSScorer()
            print(f"[ATS] Re-scoring existing resume. JD: {job_description[:50]}...")
            ats_result = scorer.score(
                resume_text=user_data["resume_text"],
                job_description=job_description
            )
            print(f"[ATS] Re-score result: {ats_result.total_score}/10")
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
            return UploadResponse(
                success=True,
                message="ATS score recalculated based on new Job Description",
                file_path=user_data.get("resume_file_path", ""),
                ats_data=ats_data
            )
        except Exception as e:
            print(f"[upload-resume] ATS Re-scoring failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to recalculate score: {e}")

    return UploadResponse(success=False, message="Failed to process request", file_path="")


@app.delete("/resume", response_model=UploadResponse)
async def delete_resume():
    """Delete the current resume."""
    try:
        success = db_manager.delete_resume()
        if success:
            return UploadResponse(success=True, message="Resume deleted successfully", file_path="")
        else:
            return UploadResponse(success=False, message="Failed to delete resume from database", file_path="")
    except Exception as e:
        print(f"[API] Delete error: {e}")
        return UploadResponse(success=False, message=str(e), file_path="")


@app.post("/resume/generate-roadmap", response_model=ResumeRoadmapResponse)
async def generate_resume_roadmap(req: ResumeRoadmapRequest):
    """
    Generate a professional resume roadmap in Markdown based on GitHub and LeetCode activity.
    Runs tool calls in parallel for better performance.
    """
    try:
        from backend.tools import github_tool, leetcode_tool
        from backend.dependencies import get_llm
        
        # Parallelize the blocking tool calls
        async def fetch_github():
            if req.github_username:
                return await asyncio.to_thread(github_tool.invoke, req.github_username)
            return "No GitHub username provided."

        async def fetch_leetcode():
            if req.leetcode_username:
                return await asyncio.to_thread(leetcode_tool.invoke, req.leetcode_username)
            return "No LeetCode username provided."

        print(f"🔄 [ResumeHelper] Generating roadmap for: {req.github_username} / {req.leetcode_username}")
        github_data, leetcode_data = await asyncio.gather(fetch_github(), fetch_leetcode())
            
        llm = get_llm()
        
        prompt = f"""
        You are "Lakshya" — a premium AI Career Mentor. Your task is to generate a comprehensive 
        RESUME ROADMAP in Markdown for a student targeting the role of: {req.target_role}.
        
        USE THE FOLLOWING DATA:
        - GitHub Analysis: {github_data}
        - LeetCode Analysis: {leetcode_data}
        - Target Job Description (Optional): {req.job_description or "N/A"}
        
        RULES:
        1. Translate raw technical stats into 'Impact-Driven' bullet points suitable for a resume.
        2. If they have high GitHub consistency, frame it as 'Proven track record of consistent delivery'.
        3. If they have solved 100+ LeetCode problems, frame it as 'Strong problem-solving foundations in DSA'.
        4. Organize the output into clear sections: 
           - **Professional Summary**: A 2-3 sentence punchy intro.
           - **Technical Skills**: Grouped by relevance to {req.target_role}.
           - **Generated Project Descriptions**: (Pick 2-3 GitHub repos and draft bullet points with metrics).
           - **Problem Solving & Consistency**: (Using LeetCode data).
        5. Use professional, modern language suitable for top-tier Indian product companies.
        6. Do NOT include placeholders like [Your Name]. Just provide the content blocks.
        
        The month is April 2026. Keep it professional, encouraging, and honest.
        """
        
        response = await llm.ainvoke(prompt)
        markdown_content = response.content
        
        return ResumeRoadmapResponse(
            success=True,
            markdown=markdown_content,
            message="Resume roadmap successfully synthesized."
        )
    except Exception as e:
        print(f"[ResumeHelper] Error: {e}")
        return ResumeRoadmapResponse(
            success=False,
            markdown="",
            message=f"Failed to generate roadmap: {str(e)}"
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
