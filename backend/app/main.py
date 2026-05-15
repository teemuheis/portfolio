import logging
import os

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models import RecommendationsResponse
from app.moods import InvalidMoodError, normalize_mood
from app.spotify import SpotifyClient, SpotifyServiceError

app = FastAPI(title="Portfolio Spotify Mood Backend")
spotify_client = SpotifyClient()
logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")

_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://teemu.space",
]
if _extra := os.environ.get("CORS_ORIGIN"):
    _origins.append(_extra)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/mood/recommendations", response_model=RecommendationsResponse)
async def mood_recommendations(
    mood: str = Query(default="chill", min_length=1),
):
    try:
        normalized_mood = normalize_mood(mood)
    except InvalidMoodError:
        return JSONResponse(status_code=400, content={"error": "Invalid mood"})

    try:
        return await spotify_client.recommendations_for_mood(normalized_mood)
    except SpotifyServiceError as exc:
        return JSONResponse(status_code=502, content={"error": str(exc)})
