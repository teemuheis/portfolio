import { NextRequest, NextResponse } from 'next/server'

// Exchanges the auth code using client_secret (Authorization Code flow, not PKCE).
// The resulting refresh_token does not rotate when refreshed with client_secret.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
  }

  const callbackUrl = process.env.SPOTIFY_SERVER_CALLBACK_URL || 'http://localhost:3000/server-callback'

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUrl,
    }).toString(),
    cache: 'no-store',
  })

  if (!response.ok) {
    const err = await response.text()
    return NextResponse.json({ error: 'Token exchange failed', detail: err }, { status: 400 })
  }

  const tokens = await response.json() as { access_token: string; refresh_token: string }

  return NextResponse.json({
    message: 'Copy the refresh_token below into Railway as SPOTIFY_USER_REFRESH_TOKEN',
    refresh_token: tokens.refresh_token,
  })
}
