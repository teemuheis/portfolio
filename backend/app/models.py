from pydantic import BaseModel, Field


class Artist(BaseModel):
    name: str


class AlbumImage(BaseModel):
    url: str
    width: int | None = None
    height: int | None = None


class Album(BaseModel):
    name: str
    images: list[AlbumImage] = Field(default_factory=list)


class ExternalUrls(BaseModel):
    spotify: str


class Track(BaseModel):
    id: str
    name: str
    artists: list[Artist]
    album: Album
    preview_url: str | None = None
    external_urls: ExternalUrls
    duration_ms: int


class RecommendationsResponse(BaseModel):
    mood: str
    general: list[Track]
    personal: list[Track]
