from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import subprocess
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

STORAGE_DIR = ROOT_DIR.parent / "storage"
VIDEO_DIR = STORAGE_DIR / "videos"
CLIP_DIR = STORAGE_DIR / "clips"

for path in [VIDEO_DIR, CLIP_DIR]:
    path.mkdir(parents=True, exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()
app.mount("/media", StaticFiles(directory=str(STORAGE_DIR)), name="media")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class ClipSegment(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    start_time: int
    end_time: int
    duration: int
    viral_score: int
    thumbnail_url: str
    caption: str
    video_url: str


class ClipJob(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    youtube_url: str
    title: str
    status: str
    progress: int
    clip_count: int
    clips: List[ClipSegment] = []
    clip_length: int
    language: str
    style: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    error_message: Optional[str] = None


class ClipJobCreate(BaseModel):
    youtube_url: str
    clip_length: int = Field(default=30, ge=15, le=120)
    language: Optional[str] = "pt"
    style: Optional[str] = "dinamico"


class ClipUpdate(BaseModel):
    title: Optional[str] = None
    caption: Optional[str] = None
    start_time: Optional[int] = Field(default=None, ge=0)
    end_time: Optional[int] = Field(default=None, ge=1)

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

def serialize_job(job: dict) -> ClipJob:
    if isinstance(job.get("created_at"), str):
        job["created_at"] = datetime.fromisoformat(job["created_at"])
    if isinstance(job.get("clips"), list):
        job["clips"] = [ClipSegment(**clip) for clip in job.get("clips", [])]
    return ClipJob(**job)

def media_url(path: Path) -> str:
    rel = path.relative_to(STORAGE_DIR).as_posix()
    return f"/media/{rel}"


def run_command(command: List[str]) -> str:
    result = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=True,
    )
    return result.stdout.strip()


def fetch_video_title(url: str) -> str:
    try:
        return run_command(["yt-dlp", "-e", url])
    except subprocess.CalledProcessError:
        return "Vídeo do YouTube"


def download_video(job_id: str, url: str) -> Path:
    output_template = VIDEO_DIR / f"{job_id}.%(ext)s"
    command = [
        "yt-dlp",
        "-f",
        "mp4/best",
        "--merge-output-format",
        "mp4",
        "-o",
        str(output_template),
        url,
    ]
    run_command(command)
    return VIDEO_DIR / f"{job_id}.mp4"


def get_video_duration(video_path: Path) -> int:
    output = run_command(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ]
    )
    return max(1, int(float(output)))


def build_clip_plan(duration: int, clip_length: int) -> List[int]:
    safe_length = min(clip_length, max(5, duration))
    if duration <= safe_length:
        return [0]
    potential = max(1, duration // safe_length)
    clip_count = min(6, max(3, potential))
    spacing = (duration - safe_length) / max(1, clip_count - 1)
    starts = [int(i * spacing) for i in range(clip_count)]
    return [min(start, max(0, duration - safe_length)) for start in starts]


def render_clip(video_path: Path, output_path: Path, start: int, duration: int) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    command = [
        "ffmpeg",
        "-y",
        "-ss",
        str(start),
        "-i",
        str(video_path),
        "-t",
        str(duration),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        str(output_path),
    ]
    run_command(command)


def render_thumbnail(video_path: Path, output_path: Path, timestamp: int) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    command = [
        "ffmpeg",
        "-y",
        "-ss",
        str(timestamp),
        "-i",
        str(video_path),
        "-frames:v",
        "1",
        "-q:v",
        "2",
        str(output_path),
    ]
    run_command(command)


async def update_job(job_id: str, updates: dict) -> None:
    await db.clip_jobs.update_one({"id": job_id}, {"$set": updates})


async def process_job(job_id: str, url: str, clip_length: int) -> None:
    try:
        await update_job(job_id, {"status": "downloading", "progress": 5, "error_message": None})
        title = await asyncio.to_thread(fetch_video_title, url)
        await update_job(job_id, {"title": title, "progress": 10})
        video_path = await asyncio.to_thread(download_video, job_id, url)
        await update_job(job_id, {"progress": 20, "status": "processing"})
        duration = await asyncio.to_thread(get_video_duration, video_path)
        plan = build_clip_plan(duration, clip_length)
        safe_length = min(clip_length, max(5, duration))
        clips: List[dict] = []
        total = len(plan)

        for index, start_time in enumerate(plan):
            clip_id = str(uuid.uuid4())
            output_path = CLIP_DIR / job_id / f"{clip_id}.mp4"
            thumb_path = CLIP_DIR / job_id / f"{clip_id}.jpg"
            await asyncio.to_thread(render_clip, video_path, output_path, start_time, safe_length)
            await asyncio.to_thread(render_thumbnail, video_path, thumb_path, min(start_time + 1, duration - 1))
            end_time = start_time + safe_length
            viral_score = min(99, 70 + int(((index + 1) / total) * 25))
            clips.append(
                ClipSegment(
                    id=clip_id,
                    title=f"Corte destacado #{index + 1}",
                    start_time=start_time,
                    end_time=end_time,
                    duration=safe_length,
                    viral_score=viral_score,
                    thumbnail_url=media_url(thumb_path),
                    caption=f"Trecho selecionado de {title}.",
                    video_url=media_url(output_path),
                ).model_dump()
            )
            await update_job(
                job_id,
                {
                    "progress": 20 + int(((index + 1) / total) * 70),
                    "clips": clips,
                    "clip_count": len(clips),
                },
            )

        await update_job(job_id, {"status": "completed", "progress": 100, "clips": clips, "clip_count": len(clips)})
    except Exception as exc:
        await update_job(job_id, {"status": "error", "error_message": str(exc), "progress": 0})


@api_router.post("/jobs", response_model=ClipJob)
async def create_job(payload: ClipJobCreate):
    job = ClipJob(
        youtube_url=payload.youtube_url,
        title="Importação do YouTube",
        status="queued",
        progress=0,
        clip_count=0,
        clips=[],
        clip_length=payload.clip_length,
        language=payload.language or "pt",
        style=payload.style or "dinamico",
        error_message=None,
    )
    doc = job.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["clips"] = [clip.model_dump() for clip in job.clips]
    await db.clip_jobs.insert_one(doc)
    asyncio.create_task(process_job(job.id, payload.youtube_url, payload.clip_length))
    return job


@api_router.get("/jobs", response_model=List[ClipJob])
async def list_jobs():
    jobs = await db.clip_jobs.find(
        {},
        {
            "_id": 0,
            "id": 1,
            "title": 1,
            "status": 1,
            "progress": 1,
            "clip_count": 1,
            "clip_length": 1,
            "youtube_url": 1,
            "created_at": 1,
            "clips": 1,
            "language": 1,
            "style": 1,
        },
    ).sort("created_at", -1).to_list(100)
    return [serialize_job(job) for job in jobs]


@api_router.get("/jobs/{job_id}", response_model=ClipJob)
async def get_job(job_id: str):
    job = await db.clip_jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    return serialize_job(job)


@api_router.get("/jobs/{job_id}/clips", response_model=List[ClipSegment])
async def get_job_clips(job_id: str):
    job = await db.clip_jobs.find_one({"id": job_id}, {"_id": 0, "clips": 1})
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    return [ClipSegment(**clip) for clip in job.get("clips", [])]


@api_router.post("/jobs/{job_id}/advance", response_model=ClipJob)
async def advance_job(job_id: str):
    job = await db.clip_jobs.find_one(
        {"id": job_id},
        {
            "_id": 0,
            "progress": 1,
            "status": 1,
            "clips": 1,
            "clip_length": 1,
            "youtube_url": 1,
        },
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    status = job.get("status", "queued")
    if status in ["queued", "error"]:
        asyncio.create_task(process_job(job_id, job.get("youtube_url", ""), job.get("clip_length", 30)))
    updated = await db.clip_jobs.find_one({"id": job_id}, {"_id": 0})
    return serialize_job(updated)


@api_router.patch("/jobs/{job_id}/clips/{clip_id}", response_model=ClipSegment)
async def update_clip(job_id: str, clip_id: str, payload: ClipUpdate):
    job = await db.clip_jobs.find_one({"id": job_id}, {"_id": 0, "clips": 1})
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    clips = job.get("clips", [])
    clip = next((item for item in clips if item.get("id") == clip_id), None)
    if not clip:
        raise HTTPException(status_code=404, detail="Corte não encontrado")
    update_data = payload.model_dump(exclude_unset=True)
    if "start_time" in update_data or "end_time" in update_data:
        start = update_data.get("start_time", clip.get("start_time"))
        end = update_data.get("end_time", clip.get("end_time"))
        if end <= start:
            raise HTTPException(status_code=400, detail="Tempo final deve ser maior")
        update_data["duration"] = end - start
        video_url = clip.get("video_url")
        thumb_url = clip.get("thumbnail_url")
        source_path = VIDEO_DIR / f"{job_id}.mp4"
        if not source_path.exists():
            raise HTTPException(status_code=400, detail="Arquivo fonte não encontrado")
        if video_url:
            clip_path = STORAGE_DIR / video_url.replace("/media/", "")
            await asyncio.to_thread(render_clip, source_path, clip_path, start, end - start)
        if thumb_url:
            thumb_path = STORAGE_DIR / thumb_url.replace("/media/", "")
            await asyncio.to_thread(render_thumbnail, source_path, thumb_path, max(0, start + 1))
    clip.update(update_data)
    await db.clip_jobs.update_one(
        {"id": job_id},
        {"$set": {"clips": clips}},
    )
    return ClipSegment(**clip)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()