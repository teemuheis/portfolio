MOOD_SEARCH_QUERIES: dict[str, list[str]] = {
    "energetic": [
        "workout motivation energetic",
        "high energy running",
        "power metal energetic",
    ],
    "chill": [
        "lo-fi chill study",
        "calm relaxing indie",
        "ambient chill vibes",
    ],
    "focus": [
        "focus deep work instrumental",
        "concentration study music",
        "minimalist piano focus",
    ],
    "happy": [
        "happy feel good pop",
        "upbeat feel good songs",
        "summer happy vibes",
    ],
    "melancholy": [
        "melancholy sad indie",
        "emotional rainy day",
        "post-rock atmospheric sad",
    ],
    "party": [
        "party dance hits",
        "edm club dance",
        "house party anthems",
    ],
}


class InvalidMoodError(ValueError):
    pass


def normalize_mood(mood: str | None) -> str:
    normalized = (mood or "chill").strip().lower()
    if normalized not in MOOD_SEARCH_QUERIES:
        raise InvalidMoodError("Invalid mood")
    return normalized


def search_queries_for_mood(mood: str) -> list[str]:
    return MOOD_SEARCH_QUERIES[mood]
