import httpx
import pytest

from app.spotify import SpotifyClient, TokenCache, sanitize_track


def spotify_track(track_id: str = "track_id") -> dict:
    return {
        "id": track_id,
        "name": "Track name",
        "artists": [{"name": "Artist"}],
        "album": {
            "name": "Album",
            "images": [{"url": "https://example.com/cover.jpg", "width": 640, "height": 640}],
        },
        "preview_url": None,
        "external_urls": {"spotify": f"https://open.spotify.com/track/{track_id}"},
        "duration_ms": 180000,
        "access_token": "leak",
        "refresh_token": "leak",
        "headers": {"Authorization": "Bearer leak"},
    }


@pytest.mark.asyncio
async def test_token_manager_refreshes_when_cache_is_empty(monkeypatch):
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", "client-id")
    monkeypatch.setenv("SPOTIFY_REFRESH_TOKEN", "refresh-token")
    monkeypatch.delenv("SPOTIFY_USE_CLIENT_SECRET", raising=False)
    cache = TokenCache()

    async def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.host == "accounts.spotify.com"
        assert "client_id=client-id" in request.content.decode()
        assert "authorization" not in request.headers
        return httpx.Response(200, json={"access_token": "new-access-token", "expires_in": 3600})

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        spotify = SpotifyClient(http_client=client, token_cache=cache)
        token = await spotify._access_token(client)

    assert token == "new-access-token"
    assert cache.access_token == "new-access-token"
    assert cache.valid()


@pytest.mark.asyncio
async def test_token_manager_uses_client_secret_only_when_enabled(monkeypatch):
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", "client-id")
    monkeypatch.setenv("SPOTIFY_CLIENT_SECRET", "client-secret")
    monkeypatch.setenv("SPOTIFY_REFRESH_TOKEN", "refresh-token")
    monkeypatch.setenv("SPOTIFY_USE_CLIENT_SECRET", "true")

    async def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["authorization"].startswith("Basic ")
        assert "client_id=client-id" not in request.content.decode()
        return httpx.Response(200, json={"access_token": "new-access-token", "expires_in": 3600})

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        spotify = SpotifyClient(http_client=client, token_cache=TokenCache())
        token = await spotify._access_token(client)

    assert token == "new-access-token"


def test_sanitize_track_excludes_token_and_header_data():
    track = sanitize_track(spotify_track())
    payload = track.model_dump()

    assert payload == {
        "id": "track_id",
        "name": "Track name",
        "artists": [{"name": "Artist"}],
        "album": {
            "name": "Album",
            "images": [{"url": "https://example.com/cover.jpg", "width": 640, "height": 640}],
        },
        "preview_url": None,
        "external_urls": {"spotify": "https://open.spotify.com/track/track_id"},
        "duration_ms": 180000,
    }
    assert "access_token" not in payload
    assert "refresh_token" not in payload
    assert "headers" not in payload
