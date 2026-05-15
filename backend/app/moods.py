MOOD_SEARCH_QUERIES: dict[str, list[str]] = {
    "ignite": [
        "workout motivation energetic",
        "high energy running",
        "power metal energetic",
    ],
    "drift": [
        "lo-fi chill study",
        "calm relaxing indie",
        "ambient chill vibes",
    ],
    "flow": [
        "focus deep work instrumental",
        "concentration study music",
        "minimalist piano focus",
    ],
    "golden": [
        "happy feel good pop",
        "upbeat feel good songs",
        "summer happy vibes",
    ],
    "electric": [
        "party dance hits",
        "edm club dance",
        "house party anthems",
    ],
}


class InvalidMoodError(ValueError):
    pass


def normalize_mood(mood: str | None) -> str:
    normalized = (mood or "drift").strip().lower()
    if normalized not in MOOD_SEARCH_QUERIES:
        raise InvalidMoodError("Invalid mood")
    return normalized


def search_queries_for_mood(mood: str) -> list[str]:
    return MOOD_SEARCH_QUERIES[mood]
