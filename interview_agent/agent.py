"""
LiveKit worker entrypoint for the AI Interviewer voice agent.

What this script does:
1. Loads environment variables from `.env.local`.
2. Creates a LangGraph-backed LLM via `livekit.plugins.langchain.LLMAdapter`.
3. Starts a LiveKit `AgentSession` configured with:
   - Deepgram STT
   - Cartesia TTS
   - Silero VAD (prewarm loads the model)
   - A turn detector model (multilingual) for turn detection behavior
4. Starts a Simli avatar session using a pre-configured Simli face.
5. Starts the voice agent session and triggers the first greeting/question.
"""

from __future__ import annotations

import os
import json
import asyncio
import logging
from pathlib import Path

from dotenv import load_dotenv

logger = logging.getLogger("ai-interviewer.agent")

PROJECT_DIR = Path(__file__).resolve().parent

# Load `.env` so LiveKit, Sarvam, Deepgram, Cartesia, and Simli credentials are available.
load_dotenv(dotenv_path=str(PROJECT_DIR / ".env"), override=False)

try:
    from livekit.agents import Agent, AgentServer, AgentSession, JobContext, JobProcess, cli, inference
    from livekit.plugins import langchain, simli, silero
    from livekit.plugins.turn_detector.multilingual import MultilingualModel
except ImportError as exc:
    raise RuntimeError(
        "Missing LiveKit dependencies. Install the packages from requirements.txt, "
        "including livekit-plugins-langchain, livekit-plugins-silero, and "
        "livekit-plugins-simli."
    ) from exc

from interview_agent.graph import create_workflow


# --------------------------------------------------------------------------------------
# Worker prewarm: load Silero VAD once per worker process
# --------------------------------------------------------------------------------------
def prewarm(proc: JobProcess) -> None:
    """
    Preload models that are expensive to initialize.

    Silero VAD is used by AgentSession for detecting when the user starts/stops speaking.
    """
    proc.userdata["vad"] = silero.VAD.load()


def _optional_int_env(name: str) -> int | None:
    value = os.getenv(name, "").strip()
    if not value:
        return None

    try:
        return int(value)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer when set in `.env`.") from exc


# --------------------------------------------------------------------------------------
# LangGraph-backed LLM adapter is created PER SESSION inside entrypoint(),
# so that create_workflow(job_role) receives the correct role from room metadata.
# --------------------------------------------------------------------------------------

server = AgentServer(
    port=8082,
    ws_url=os.getenv("LIVEKIT_URL"),
    api_key=os.getenv("LIVEKIT_API_KEY"),
    api_secret=os.getenv("LIVEKIT_API_SECRET"),
)
server.setup_fnc = prewarm


@server.rtc_session()
async def entrypoint(ctx: JobContext) -> None:
    # Ensure we have the VAD we loaded in prewarm.
    if "vad" not in ctx.proc.userdata:
        raise RuntimeError("Silero VAD was not prewarmed. Did prewarm() run?")

    # ==========================================================================
    # EXTRACT JOB ROLE from room metadata or room name (ASCII-only prints)
    # ==========================================================================
    job_role = ""

    print("[AGENT] ========== ROOM INFO ==========")
    print("[AGENT] Room name: " + str(ctx.room.name))
    print("[AGENT] Room metadata: " + repr(ctx.room.metadata))

    # Strategy 1: Room metadata JSON
    try:
        raw_meta = ctx.room.metadata or ""
        if raw_meta.strip():
            room_meta = json.loads(raw_meta)
            job_role = (room_meta.get("job_role") or "").strip()
            if job_role:
                print("[AGENT] [OK] Strategy 1 - job_role from room metadata: " + job_role)
            else:
                print("[AGENT] [MISS] Strategy 1 - metadata has no job_role key")
        else:
            print("[AGENT] [MISS] Strategy 1 - room metadata is empty")
    except (json.JSONDecodeError, AttributeError) as e:
        print("[AGENT] [MISS] Strategy 1 - parse error: " + str(e))

    # Strategy 2: Parse from room name (format: "interview-{role_slug}-{uuid8}")
    if not job_role:
        room_name = ctx.room.name or ""
        print("[AGENT] Trying Strategy 2 - parsing room name: " + room_name)
        if room_name.startswith("interview-"):
            parts = room_name.split("-")
            if len(parts) >= 3:
                role_parts = parts[1:-1]
                role_slug = "-".join(role_parts).strip()
                job_role = role_slug.replace("_", " ")
                print("[AGENT] [OK] Strategy 2 - job_role from room name: " + job_role)
            else:
                print("[AGENT] [MISS] Strategy 2 - room name has <3 parts")
        else:
            print("[AGENT] [MISS] Strategy 2 - room name does not start with interview-")

    # Strategy 3: Default fallback
    if not job_role:
        job_role = "Software Engineer"
        print("[AGENT] [WARN] Strategy 3 FALLBACK - defaulting to: " + job_role)

    print("[AGENT] ========== FINAL JOB ROLE: " + job_role + " ==========")

    # Create a per-session LLM adapter with the correct job role baked into the graph.
    llm_adapter = langchain.LLMAdapter(graph=create_workflow(job_role=job_role))

    # Configure the audio/video session.
    session = AgentSession(
        vad=ctx.proc.userdata["vad"],
        stt=inference.STT("deepgram/nova-3", language="multi"),
        tts=inference.TTS("cartesia/sonic-3"),
        turn_detection=MultilingualModel(),
    )

    # ----------------------------------------------------------------------------------
    # Simli avatar setup (must start before starting the voice session).
    # Simli uses a provider-side "face_id" rather than a local image file.
    # ----------------------------------------------------------------------------------
    simli_api_key = os.getenv("SIMLI_API_KEY")
    simli_face_id = os.getenv("SIMLI_FACE_ID")
    if not simli_api_key:
        raise RuntimeError("Missing SIMLI_API_KEY in environment (.env).")
    if not simli_face_id:
        raise RuntimeError("Missing SIMLI_FACE_ID in environment (.env).")

    simli_config_kwargs = {
        "api_key": simli_api_key,
        "face_id": simli_face_id,
    }

    # Keep optional Simli controls env-driven so you can fine-tune the avatar session
    # without touching code again.
    simli_emotion_id = os.getenv("SIMLI_EMOTION_ID", "").strip()
    if simli_emotion_id:
        simli_config_kwargs["emotion_id"] = simli_emotion_id

    simli_max_session_length = _optional_int_env("SIMLI_MAX_SESSION_LENGTH")
    if simli_max_session_length is not None:
        simli_config_kwargs["max_session_length"] = simli_max_session_length

    simli_max_idle_time = _optional_int_env("SIMLI_MAX_IDLE_TIME")
    if simli_max_idle_time is not None:
        simli_config_kwargs["max_idle_time"] = simli_max_idle_time

    avatar_session_kwargs: dict[str, str] = {}
    simli_api_url = os.getenv("SIMLI_API_URL", "").strip()
    if simli_api_url:
        avatar_session_kwargs["api_url"] = simli_api_url

    avatar = simli.AvatarSession(
        simli_config=simli.SimliConfig(**simli_config_kwargs),
        **avatar_session_kwargs,
    )

    # Start the avatar session before connecting the voice pipeline.
    await avatar.start(session, room=ctx.room)

    # ----------------------------------------------------------------------------------
    # Voice agent setup and start
    # ----------------------------------------------------------------------------------
    #
    # The actual conversational logic is handled inside LangGraph (graph.py), including:
    # - structured interview question ordering
    # - tool calling to company_info_tool and record_answer_tool
    #
    # Therefore, we keep the Agent instructions minimal.
    agent = Agent(instructions="", llm=llm_adapter)

    await session.start(room=ctx.room, agent=agent)

    # ----------------------------------------------------------------------------------
    # Transcript relay: publish user & agent speech as data messages to the room
    # so the frontend can display a live transcript.
    # ----------------------------------------------------------------------------------
    async def _publish_transcript(speaker: str, text: str):
        payload = json.dumps({
            "type": "transcript",
            "speaker": speaker,
            "text": text,
        })
        await ctx.room.local_participant.publish_data(payload.encode("utf-8"), reliable=True)

    def _on_user_transcribed(ev):
        if ev.is_final and ev.transcript.strip():
            asyncio.create_task(_publish_transcript("user", ev.transcript.strip()))

    def _on_conversation_item(ev):
        msg = ev.item
        # Only relay assistant text messages (not function calls or handoffs)
        if hasattr(msg, "role") and msg.role == "assistant" and hasattr(msg, "content"):
            text = ""
            if isinstance(msg.content, str):
                text = msg.content
            elif isinstance(msg.content, list):
                for part in msg.content:
                    if hasattr(part, "text"):
                        text += part.text
                    elif isinstance(part, str):
                        text += part
            if text.strip():
                asyncio.create_task(_publish_transcript("agent", text.strip()))

    session.on("user_input_transcribed", _on_user_transcribed)
    session.on("conversation_item_added", _on_conversation_item)

    # Trigger greeting + first question.
    await session.generate_reply(
        instructions=(
            f"Greet the candidate warmly and calmly. Introduce yourself as Alex. "
            f"Mention that you'll be conducting a {job_role} interview today and that "
            f"you want them to feel comfortable — this is a conversation, not a test. "
            f"Then ease into your first question: ask them to walk you through their "
            f"background and how they got into {job_role} work."
        )
    )


if __name__ == "__main__":
    # Start the LiveKit worker process.
    cli.run_app(server)
