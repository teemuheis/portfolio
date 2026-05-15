from app.spotify import sanitize_track


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


def test_sanitize_track_preview_url_passthrough():
    raw = spotify_track()
    raw["preview_url"] = "https://p.scdn.co/mp3-preview/abc123"
    track = sanitize_track(raw)
    assert track.preview_url == "https://p.scdn.co/mp3-preview/abc123"


def test_sanitize_track_null_preview_url():
    raw = spotify_track()
    raw["preview_url"] = None
    track = sanitize_track(raw)
    assert track.preview_url is None
