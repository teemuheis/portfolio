import pytest

from app.moods import InvalidMoodError, normalize_mood


def test_normalize_mood_accepts_known_mood():
    assert normalize_mood(" Chill ") == "chill"


def test_normalize_mood_rejects_unknown_mood():
    with pytest.raises(InvalidMoodError):
        normalize_mood("ambient-chaos")
