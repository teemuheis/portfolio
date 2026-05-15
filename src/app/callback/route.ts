import { exchangeAuthCode } from '@/lib/spotify'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const cookieStore = await cookies()
  const storedState = cookieStore.get('spotify_auth_state')?.value
  const codeVerifier = cookieStore.get('spotify_code_verifier')?.value

  // Verify state matches (CSRF protection)
  if (!state || state !== storedState) {
    return NextResponse.json(
      { error: 'State mismatch — possible CSRF attack' },
      { status: 403 }
    )
  }

  if (!code) {
    return NextResponse.json(
      { error: 'No authorization code received' },
      { status: 400 }
    )
  }

  if (!codeVerifier) {
    return NextResponse.json(
      { error: 'Code verifier not found' },
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in, // Usually 3600 (1 hour)
    })

    response.cookies.set('spotify_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2592000, // 30 days
    })

    // Clear temporary auth cookies
    response.cookies.delete('spotify_code_verifier')
    response.cookies.delete('spotify_auth_state')

    return response
  } catch (error) {
    console.error('Token exchange failed:', error)
    return NextResponse.json(
      { error: 'Token exchange failed' },
      { status: 400 }
    )
  }
}
