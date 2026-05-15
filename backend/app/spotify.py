from __future__ import annotations

import base64
import asyncio
import os
import random
import time
import logging
from dataclasses import dataclass
from typing import Any

import httpx

from app.models import Album, AlbumImage, Artist, ExternalUrls, RecommendationsResponse, Track
from app.moods import search_queries_for_mood

SPOTIFY_API_BASE = "https://api.spotify.com/v1"
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/api/token"
logger = logging.getLogger("spotify_mood.spotify")


class SpotifyServiceError(RuntimeError):
    pass


@dataclass
class TokenCache:
    access_token: str | None = None
    expires_at: float = 0

    def valid(self) -> bool:
        return bool(self.access_token) and time.time() < self.expires_at - 60


class SpotifyClient:
    def __init__(
        self,
        http_client: httpx.AsyncClient | None = None,
        token_cache: TokenCache | None = None,
    ) -> None:
        self._http_client = http_client
        self._token_cache = token_cache or TokenCache()

    async def recommendations_for_mood(self, mood: str) -> RecommendationsResponse:
        queries = search_queries_for_mood(mood)
        query_one, query_two = random.sample(queries, 2)
        logger.info("mood=%s queries=%r", mood, [query_one, query_two])

        top_tracks, search_one, search_two = await self._gather_tracks(query_one, query_two)

        personal = random.sample(top_tracks, min(8, len(top_tracks)))
        seen = {track.id for track in personal}

        general_candidates = search_one + search_two
        random.shuffle(general_candidates)
        general: list[Track] = []
        for track in general_candidates:
            if track.id in seen:
                continue
            seen.add(track.id)
            general.append(track)
            if len(general) == 10:
                break

        logger.info(
            "mood=%s returned general=%s personal=%s",
            mood,
            len(general),
            len(personal),
        )
        return RecommendationsResponse(mood=mood, general=general, personal=personal)

    async def _gather_tracks(self, query_one: str, query_two: str) -> tuple[list[Track], list[Track], list[Track]]:
        return await self._with_client(
            lambda client: self._fetch_recommendation_sources(client, query_one, query_two)
        )

    async def _fetch_recommendation_sources(
        self,
        client: httpx.AsyncClient,
        query_one: str,
        query_two: str,
    ) -> tuple[list[Track], list[Track], list[Track]]:
        top_tracks_response, search_one_response, search_two_response = await self._request_many(
            client,
            [
                ("/me/top/tracks", {"limit": "50", "time_range": "medium_term"}),
                ("/search", {"q": query_one, "type": "track", "limit": "20"}),
                ("/search", {"q": query_two, "type": "track", "limit": "10"}),
            ],
        )

        top_tracks = [sanitize_track(track) for track in top_tracks_response.get("items", [])]
        search_one = [
            sanitize_track(track)
            for track in search_one_response.get("tracks", {}).get("items", [])
        ]
        search_two = [
            sanitize_track(track)
            for track in search_two_response.get("tracks", {}).get("items", [])
        ]
        return top_tracks, search_one, search_two

    async def _request_many(
        self,
        client: httpx.AsyncClient,
        requests: list[tuple[str, dict[str, str]]],
    ) -> list[dict[str, Any]]:
        access_token = await self._access_token(client)

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
                self._token_cache.access_token = None
                raise SpotifyServiceError("Spotify authorization failed")
            if response.status_code >= 400:
                logger.warning(
                    "spotify_api_failed path=%s status=%s body=%s",
                    path,
                    response.status_code,
                    response.text[:240],
                )
                raise SpotifyServiceError("Spotify API request failed")
            data.append(response.json())
        return data

    async def _access_token(self, client: httpx.AsyncClient) -> str:
        if self._token_cache.valid():
            logger.info("spotify_token cache=hit")
            return self._token_cache.access_token or ""

        client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        refresh_token = os.environ.get("SPOTIFY_REFRESH_TOKEN")
        client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
        use_client_secret = os.environ.get("SPOTIFY_USE_CLIENT_SECRET") == "true"

        if not client_id or not refresh_token:
            logger.warning(
                "spotify_token missing_config client_id=%s refresh_token=%s",
                bool(client_id),
                bool(refresh_token),
            )
            raise SpotifyServiceError("Spotify credentials are not configured")

        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        form = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }

        if client_secret and use_client_secret:
            logger.info("spotify_token refresh mode=client_secret")
            credentials = f"{client_id}:{client_secret}".encode("utf-8")
            headers["Authorization"] = f"Basic {base64.b64encode(credentials).decode('ascii')}"
        else:
            logger.info("spotify_token refresh mode=pkce")
            form["client_id"] = client_id

        response = await client.post(SPOTIFY_AUTH_URL, data=form, headers=headers)
        logger.info("spotify_token refresh_status=%s", response.status_code)
        if response.status_code >= 400:
            logger.warning(
                "spotify_token_refresh_failed status=%s body=%s",
                response.status_code,
                response.text[:240],
            )
            raise SpotifyServiceError("Spotify token refresh failed")

        payload = response.json()
        access_token = payload.get("access_token")
        expires_in = int(payload.get("expires_in", 3600))
        if not access_token:
            logger.warning("spotify_token refresh_missing_access_token")
            raise SpotifyServiceError("Spotify token refresh returned no access token")

        self._token_cache.access_token = access_token
        self._token_cache.expires_at = time.time() + expires_in
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
