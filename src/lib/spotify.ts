import { cookies } from 'next/headers'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com'

export type Track = {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string; width: number; height: number }>
  }
  preview_url: string | null
  external_urls: { spotify: string }
  duration_ms: number
}

export type Artist = {
  id: string
  name: string
  external_urls: { spotify: string }
}

export type RecommendationParams = {
  seed_artists?: string[]
  seed_tracks?: string[]
  limit?: number
  min_energy?: number
  max_energy?: number
  target_energy?: number
  min_valence?: number
  max_valence?: number
  target_valence?: number
  min_danceability?: number
  max_danceability?: number
  target_danceability?: number
  min_tempo?: number
  max_tempo?: number
  target_tempo?: number
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials')
  }

  const response = await fetch(`${SPOTIFY_AUTH_BASE}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`)
  }

  const data = (await response.json()) as { access_token: string; expires_in: number }
  return data.access_token
}

async function getAccessToken(): Promise<string> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('spotify_access_token')?.value
  const refreshToken = cookieStore.get('spotify_refresh_token')?.value

  if (!accessToken || !refreshToken) {
    throw new Error('No Spotify tokens found')
  }

  // TODO: check expiry from cookie, refresh if needed
  // For now, assume token is fresh; production should check expiry
  return accessToken
}

async function spotifyFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken()

  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Spotify token expired')
    }
    throw new Error(`Spotify API error: ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export async function getRecommendations(
  params: RecommendationParams
): Promise<{ tracks: Track[] }> {
  const searchParams = new URLSearchParams()

  if (params.seed_artists) {
    searchParams.set('seed_artists', params.seed_artists.join(','))
  }
  if (params.seed_tracks) {
    searchParams.set('seed_tracks', params.seed_tracks.join(','))
  }
  searchParams.set('limit', String(params.limit || 20))

  if (params.target_energy !== undefined) {
    searchParams.set('target_energy', String(params.target_energy))
  }
  if (params.target_valence !== undefined) {
    searchParams.set('target_valence', String(params.target_valence))
  }
  if (params.target_danceability !== undefined) {
    searchParams.set('target_danceability', String(params.target_danceability))
  }
  if (params.target_tempo !== undefined) {
    searchParams.set('target_tempo', String(params.target_tempo))
  }

  if (params.min_energy !== undefined) {
    searchParams.set('min_energy', String(params.min_energy))
  }
  if (params.max_energy !== undefined) {
    searchParams.set('max_energy', String(params.max_energy))
  }
  if (params.min_valence !== undefined) {
    searchParams.set('min_valence', String(params.min_valence))
  }
  if (params.max_valence !== undefined) {
    searchParams.set('max_valence', String(params.max_valence))
  }
  if (params.min_danceability !== undefined) {
    searchParams.set('min_danceability', String(params.min_danceability))
  }
  if (params.max_danceability !== undefined) {
    searchParams.set('max_danceability', String(params.max_danceability))
  }
  if (params.min_tempo !== undefined) {
    searchParams.set('min_tempo', String(params.min_tempo))
  }
  if (params.max_tempo !== undefined) {
    searchParams.set('max_tempo', String(params.max_tempo))
  }

  return spotifyFetch<{ tracks: Track[] }>(
    `/recommendations?${searchParams.toString()}`
  )
}

export async function getTopTracks(limit = 5): Promise<{ items: Track[] }> {
  return spotifyFetch<{ items: Track[] }>(
    `/me/top/tracks?limit=${limit}&time_range=medium_term`
  )
}

export async function getTopArtists(limit = 5): Promise<{ items: Artist[] }> {
  return spotifyFetch<{ items: Artist[] }>(
    `/me/top/artists?limit=${limit}&time_range=medium_term`
  )
}

export async function getCurrentUser(): Promise<{ id: string; display_name: string }> {
  return spotifyFetch<{ id: string; display_name: string }>('/me')
}

export function buildAuthUrl(state: string, codeChallenge: string): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  if (!clientId) throw new Error('Missing SPOTIFY_CLIENT_ID')

  const callbackUrl = process.env.SPOTIFY_CALLBACK_URL || 'https://teemu.space/callback'

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: callbackUrl,
    scope: 'user-top-read user-read-recently-played',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return `${SPOTIFY_AUTH_BASE}/authorize?${params.toString()}`
}

export async function exchangeAuthCode(
  code: string,
  codeVerifier: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  if (!clientId) throw new Error('Missing SPOTIFY_CLIENT_ID')

  const callbackUrl = process.env.SPOTIFY_CALLBACK_URL || 'https://teemu.space/callback'

  const response = await fetch(`${SPOTIFY_AUTH_BASE}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUrl,
      code_verifier: codeVerifier,
    }).toString(),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('Spotify token exchange error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorData,
      callbackUrl,
    })
    throw new Error(`Auth exchange failed: ${response.statusText} - ${errorData}`)
  }

  return response.json() as Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
  }>
}
