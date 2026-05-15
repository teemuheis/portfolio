import { exchangeAuthCode } from '@/lib/spotify'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!state) {
    return NextResponse.json(
      { error: 'No state parameter received' },
      { status: 400 }
    )
  }

  // Extract state and code_verifier from state param (format: "state:code_verifier_base64")
  const [stateValue, encodedVerifier] = state.split(':')

  if (!stateValue || !encodedVerifier) {
    return NextResponse.json(
      { error: 'Invalid state format' },
      { status: 400 }
    )
  }

  let codeVerifier: string
  try {
    codeVerifier = Buffer.from(encodedVerifier, 'base64url').toString('utf-8')
  } catch {
    return NextResponse.json(
      { error: 'Failed to decode verifier' },
      { status: 400 }
    )
  }

  if (!code) {
    return NextResponse.json(
      { error: 'No authorization code received' },
      { status: 400 }
    )
  }

  try {
    const tokens = await exchangeAuthCode(code, codeVerifier)

    const response = NextResponse.redirect(
      new URL('/projects/spotify-mood', request.url)
    )

    // Set httpOnly cookies for tokens
    response.cookies.set('spotify_access_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: tokens.expires_in, // Usually 3600 (1 hour)
    })

    response.cookies.set('spotify_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 2592000, // 30 days
    })

    return response
  } catch (error) {
    console.error('Token exchange failed:', error)
    return NextResponse.json(
      { error: 'Token exchange failed' },
      { status: 400 }
    )
  }
}
