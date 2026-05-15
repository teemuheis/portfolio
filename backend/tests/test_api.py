import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models import RecommendationsResponse
from app.spotify import SpotifyServiceError
import app.main as main_module


class SuccessfulSpotifyClient:
    async def recommendations_for_mood(self, mood: str) -> RecommendationsResponse:
        return RecommendationsResponse(mood=mood, general=[], personal=[])


class FailingSpotifyClient:
    async def recommendations_for_mood(self, mood: str) -> RecommendationsResponse:
        raise SpotifyServiceError("Spotify API request failed")


@pytest.fixture(autouse=True)
def reset_spotify_client():
    original = main_module.spotify_client
    yield
    main_module.spotify_client = original


def test_health_returns_ok():
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_recommendations_returns_expected_shape():
    main_module.spotify_client = SuccessfulSpotifyClient()
    client = TestClient(app)

    response = client.get("/api/mood/recommendations?mood=chill")

    assert response.status_code == 200
    assert response.json() == {"mood": "chill", "general": [], "personal": []}


def test_invalid_mood_returns_400():
    client = TestClient(app)
    response = client.get("/api/mood/recommendations?mood=invalid")

    assert response.status_code == 400
    assert response.json() == {"error": "Invalid mood"}


def test_spotify_failure_returns_sanitized_502():
    main_module.spotify_client = FailingSpotifyClient()
    client = TestClient(app)

    response = client.get("/api/mood/recommendations?mood=chill")

    assert response.status_code == 502
    assert response.json() == {"error": "Spotify API request failed"}
