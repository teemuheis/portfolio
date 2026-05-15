import { NextResponse } from 'next/server'

// One-time route to get a stable (non-PKCE) refresh token for the Railway backend.
// Visit /api/spotify/server-auth locally, authenticate, and copy the token from /server-callback.
export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: 'Missing SPOTIFY_CLIENT_ID' }, { status: 500 })

  const callbackUrl = process.env.SPOTIFY_SERVER_CALLBACK_URL || 'http://localhost:3000/server-callback'

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: callbackUrl,
    scope: 'user-top-read user-read-recently-played',
  })

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`)
}
