from __future__ import annotations

import base64
import asyncio
import os
import random
import time
import logging
from dataclasses import dataclass, field
from typing import Any

import httpx

from app.models import Album, AlbumImage, Artist, ExternalUrls, RecommendationsResponse, Track
from app.moods import search_queries_for_mood

SPOTIFY_API_BASE = "https://api.spotify.com/v1"
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/api/token"
REDIS_KEY = "spotify:refresh_token"
_CACHE_TTL = 300  # seconds — cache per-mood results to reduce Spotify API calls

logger = logging.getLogger("spotify_mood.spotify")


class SpotifyServiceError(RuntimeError):
    pass


class TokenStore:
    """Persists the Spotify user refresh token in Upstash Redis via HTTP REST API.
    Upstash rotates nothing — we rotate by writing the new token after every refresh.
    Falls back to SPOTIFY_INITIAL_REFRESH_TOKEN env var on first run if Redis is empty.
    """

    def __init__(self) -> None:
        self._url = os.environ.get("UPSTASH_REDIS_REST_URL", "").rstrip("/")
        self._token = os.environ.get("UPSTASH_REDIS_REST_TOKEN", "")
        self._configured = bool(self._url and self._token)

    async def get(self, client: httpx.AsyncClient) -> str | None:
        if not self._configured:
            return os.environ.get("SPOTIFY_INITIAL_REFRESH_TOKEN")

        resp = await client.get(
            f"{self._url}/get/{REDIS_KEY}",
            headers={"Authorization": f"Bearer {self._token}"},
        )
        if resp.status_code != 200:
            logger.warning("redis_get_failed status=%s", resp.status_code)
            return os.environ.get("SPOTIFY_INITIAL_REFRESH_TOKEN")

        value = resp.json().get("result")
        if not value:
            # Redis key empty — seed from env var and persist it
            seed = os.environ.get("SPOTIFY_INITIAL_REFRESH_TOKEN")
            if seed:
                logger.info("redis_seeding_initial_token")
                await self.set(client, seed)
            return seed

        return value

    async def set(self, client: httpx.AsyncClient, refresh_token: str) -> None:
        if not self._configured:
            return

        resp = await client.post(
            self._url,
            json=["SET", REDIS_KEY, refresh_token],
            headers={"Authorization": f"Bearer {self._token}"},
        )
        if resp.status_code != 200:
            logger.warning("redis_set_failed status=%s body=%s", resp.status_code, resp.text[:120])
        else:
            logger.info("redis_refresh_token_updated")


@dataclass
class AccessTokenCache:
    access_token: str | None = None
    expires_at: float = 0

    def valid(self) -> bool:
        return bool(self.access_token) and time.time() < self.expires_at - 60


@dataclass
class SpotifyClient:
    _http_client: httpx.AsyncClient | None = field(default=None, repr=False)
    _app_cache: AccessTokenCache = field(default_factory=AccessTokenCache)
    _user_cache: AccessTokenCache = field(default_factory=AccessTokenCache)
    _token_store: TokenStore = field(default_factory=TokenStore)
    _mood_cache: dict[str, tuple[float, RecommendationsResponse]] = field(default_factory=dict)

    async def recommendations_for_mood(self, mood: str) -> RecommendationsResponse:
        cached = self._mood_cache.get(mood)
        if cached and time.time() < cached[0] + _CACHE_TTL:
            logger.info("mood=%s cache_hit", mood)
            return cached[1]
        result = await self._fetch_mood_recommendations(mood)
        self._mood_cache[mood] = (time.time(), result)
        return result

    async def _fetch_mood_recommendations(self, mood: str) -> RecommendationsResponse:
        queries = search_queries_for_mood(mood)
        query_one, query_two = random.sample(queries, 2)
        logger.info("mood=%s queries=%r", mood, [query_one, query_two])

        top_tracks, liked_songs, search_one, search_two = await self._gather_tracks(query_one, query_two)

        # Blend top tracks + liked songs, dedupe by id, filter unplayable
        personal_pool = {track.id: track for track in top_tracks + liked_songs}
        personal_candidates = [t for t in personal_pool.values() if t.preview_url]
        personal = random.sample(personal_candidates, min(8, len(personal_candidates)))
        seen = {track.id for track in personal}

        # General: filter preview_url, dedupe against personal
        general_candidates = search_one + search_two
        random.shuffle(general_candidates)
        general: list[Track] = []
        for track in general_candidates:
            if not track.preview_url:
                continue
            if track.id in seen:
                continue
            seen.add(track.id)
            general.append(track)
            if len(general) == 10:
                break

        logger.info("mood=%s general=%s personal=%s", mood, len(general), len(personal))
        return RecommendationsResponse(mood=mood, general=general, personal=personal)

    async def _gather_tracks(
        self, query_one: str, query_two: str
    ) -> tuple[list[Track], list[Track], list[Track], list[Track]]:
        return await self._with_client(
            lambda client: self._fetch_recommendation_sources(client, query_one, query_two)
        )

    async def _fetch_recommendation_sources(
        self,
        client: httpx.AsyncClient,
        query_one: str,
        query_two: str,
    ) -> tuple[list[Track], list[Track], list[Track], list[Track]]:
        search_one_response, search_two_response = await self._request_many(
            client,
            [
                ("/search", {"q": query_one, "type": "track", "limit": "20"}),
                ("/search", {"q": query_two, "type": "track", "limit": "10"}),
            ],
        )

        search_one = [
            sanitize_track(t)
            for t in search_one_response.get("tracks", {}).get("items", [])
        ]
        search_two = [
            sanitize_track(t)
            for t in search_two_response.get("tracks", {}).get("items", [])
        ]

        top_tracks: list[Track] = []
        liked_songs: list[Track] = []
        try:
            user_token = await self._user_access_token(client)
            top_resp, liked_resp = await asyncio.gather(
                client.get(
                    f"{SPOTIFY_API_BASE}/me/top/tracks",
                    params={"limit": "50", "time_range": "medium_term"},
                    headers={"Authorization": f"Bearer {user_token}"},
                ),
                client.get(
                    f"{SPOTIFY_API_BASE}/me/tracks",
                    params={"limit": "50"},
                    headers={"Authorization": f"Bearer {user_token}"},
                ),
            )
            if top_resp.status_code == 200:
                top_tracks = [sanitize_track(t) for t in top_resp.json().get("items", [])]
            else:
                logger.warning("top_tracks_failed status=%s", top_resp.status_code)
            if liked_resp.status_code == 200:
                liked_songs = [
                    sanitize_track(item["track"])
                    for item in liked_resp.json().get("items", [])
                    if item.get("track")
                ]
            else:
                logger.warning("liked_songs_failed status=%s", liked_resp.status_code)
        except SpotifyServiceError as exc:
            logger.warning("user_tracks_skipped reason=%s", exc)
        except Exception:
            logger.exception("user_tracks_fetch_failed")

        return top_tracks, liked_songs, search_one, search_two

    async def _user_access_token(self, client: httpx.AsyncClient) -> str:
        if self._user_cache.valid():
            return self._user_cache.access_token or ""

        client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
        if not client_id or not client_secret:
            raise SpotifyServiceError("Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET")

        refresh_token = await self._token_store.get(client)
        if not refresh_token:
            raise SpotifyServiceError("No refresh token in store")

        credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
        response = await client.post(
            SPOTIFY_AUTH_URL,
            data={"grant_type": "refresh_token", "refresh_token": refresh_token},
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": f"Basic {credentials}",
            },
        )

        if response.status_code >= 400:
            logger.warning("user_token_refresh_failed status=%s body=%s", response.status_code, response.text[:240])
            raise SpotifyServiceError("User token refresh failed")

        payload = response.json()
        access_token = payload.get("access_token")
        if not access_token:
            raise SpotifyServiceError("No access_token in refresh response")

        # Always persist the new refresh token — Spotify rotates it every time
        if new_refresh := payload.get("refresh_token"):
            await self._token_store.set(client, new_refresh)

        self._user_cache.access_token = access_token
        self._user_cache.expires_at = time.time() + int(payload.get("expires_in", 3600))
        return access_token

    async def _request_many(
        self,
        client: httpx.AsyncClient,
        requests: list[tuple[str, dict[str, str]]],
    ) -> list[dict[str, Any]]:
        access_token = await self._app_access_token(client)

        responses = await asyncio.gather(
            *[
                client.get(
                    f"{SPOTIFY_API_BASE}{path}",
                    params=params,
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                for path, params in requests
            ]
        )

        data: list[dict[str, Any]] = []
        for response, (path, _) in zip(responses, requests):
            logger.info("spotify_api path=%s status=%s", path, response.status_code)
            if response.status_code == 401:
                self._app_cache.access_token = None
                raise SpotifyServiceError("Spotify authorization failed")
            if response.status_code >= 400:
                logger.warning("spotify_api_failed path=%s status=%s body=%s", path, response.status_code, response.text[:240])
                raise SpotifyServiceError("Spotify API request failed")
            data.append(response.json())
        return data

    async def _app_access_token(self, client: httpx.AsyncClient) -> str:
        if self._app_cache.valid():
            return self._app_cache.access_token or ""

        client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
        if not client_id or not client_secret:
            raise SpotifyServiceError("Spotify credentials are not configured")

        credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
        response = await client.post(
            SPOTIFY_AUTH_URL,
            data={"grant_type": "client_credentials"},
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": f"Basic {credentials}",
            },
        )
        if response.status_code >= 400:
            logger.warning("app_token_failed status=%s body=%s", response.status_code, response.text[:240])
            raise SpotifyServiceError("Spotify app token request failed")

        payload = response.json()
        access_token = payload.get("access_token")
        if not access_token:
            raise SpotifyServiceError("No access_token in client_credentials response")

        self._app_cache.access_token = access_token
        self._app_cache.expires_at = time.time() + int(payload.get("expires_in", 3600))
        return access_token

    async def _with_client(self, operation):
        if self._http_client:
            return await operation(self._http_client)
        async with httpx.AsyncClient(timeout=10) as client:
            return await operation(client)


def sanitize_track(raw_track: dict[str, Any]) -> Track:
    album = raw_track.get("album") or {}
    external_urls = raw_track.get("external_urls") or {}

    return Track(
        id=str(raw_track.get("id") or ""),
        name=str(raw_track.get("name") or ""),
        artists=[
            Artist(name=str(artist.get("name") or ""))
            for artist in raw_track.get("artists", [])
        ],
        album=Album(
            name=str(album.get("name") or ""),
            images=[
                AlbumImage(
                    url=str(image.get("url") or ""),
                    width=image.get("width"),
                    height=image.get("height"),
                )
                for image in album.get("images", [])
            ],
        ),
        preview_url=raw_track.get("preview_url"),
        external_urls=ExternalUrls(spotify=str(external_urls.get("spotify") or "")),
        duration_ms=int(raw_track.get("duration_ms") or 0),
    )
