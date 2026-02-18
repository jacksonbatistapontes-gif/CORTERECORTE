from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

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


class ClipJobCreate(BaseModel):
    youtube_url: str
    clip_length: int = Field(default=30, ge=15, le=120)
    language: Optional[str] = "pt"
    style: Optional[str] = "dinamico"

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

def serialize_job(job: dict) -> ClipJob:
    if isinstance(job.get("created_at"), str):
        job["created_at"] = datetime.fromisoformat(job["created_at"])
    return ClipJob(**job)


def generate_clips(clip_length: int) -> List[ClipSegment]:
    thumbnails = [
        "https://images.unsplash.com/photo-1764557175375-9e2bea91530e?crop=entropy&cs=srgb&fm=jpg&q=85",
        "https://images.unsplash.com/photo-1764664035176-8e92ff4f128e?crop=entropy&cs=srgb&fm=jpg&q=85",
        "https://images.unsplash.com/photo-1764258559704-0b7f0f02cae0?crop=entropy&cs=srgb&fm=jpg&q=85",
        "https://images.unsplash.com/photo-1673093774005-a5ee94ed98c4?crop=entropy&cs=srgb&fm=jpg&q=85",
    ]
    base_start = random.randint(10, 120)
    clips: List[ClipSegment] = []
    for index in range(4):
        start = base_start + (index * clip_length * 2)
        end = start + clip_length
        clips.append(
            ClipSegment(
                title=f"Corte viral #{index + 1}",
                start_time=start,
                end_time=end,
                duration=clip_length,
                viral_score=random.randint(78, 98),
                thumbnail_url=thumbnails[index % len(thumbnails)],
                caption="Legenda automática simulada para redes sociais.",
            )
        )
    return clips


@api_router.post("/jobs", response_model=ClipJob)
async def create_job(payload: ClipJobCreate):
    job = ClipJob(
        youtube_url=payload.youtube_url,
        title="Importação do YouTube",
        status="processing",
        progress=0,
        clip_count=0,
        clips=[],
        clip_length=payload.clip_length,
        language=payload.language or "pt",
        style=payload.style or "dinamico",
    )
    doc = job.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["clips"] = [clip.model_dump() for clip in job.clips]
    await db.clip_jobs.insert_one(doc)
    return job


@api_router.get("/jobs", response_model=List[ClipJob])
async def list_jobs():
    jobs = await db.clip_jobs.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [serialize_job(job) for job in jobs]


@api_router.get("/jobs/{job_id}", response_model=ClipJob)
async def get_job(job_id: str):
    job = await db.clip_jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    return serialize_job(job)


@api_router.get("/jobs/{job_id}/clips", response_model=List[ClipSegment])
async def get_job_clips(job_id: str):
    job = await db.clip_jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    return [ClipSegment(**clip) for clip in job.get("clips", [])]


@api_router.post("/jobs/{job_id}/advance", response_model=ClipJob)
async def advance_job(job_id: str):
    job = await db.clip_jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    progress = job.get("progress", 0)
    status = job.get("status", "processing")
    clips = job.get("clips", [])
    if status != "completed":
        progress = min(100, progress + random.randint(18, 36))
        status = "completed" if progress >= 100 else "processing"
        if status == "completed" and not clips:
            generated = generate_clips(job.get("clip_length", 30))
            clips = [clip.model_dump() for clip in generated]
    await db.clip_jobs.update_one(
        {"id": job_id},
        {"$set": {"progress": progress, "status": status, "clips": clips, "clip_count": len(clips)}},
    )
    updated = await db.clip_jobs.find_one({"id": job_id}, {"_id": 0})
    return serialize_job(updated)

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