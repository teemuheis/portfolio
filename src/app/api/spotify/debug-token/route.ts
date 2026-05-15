import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// TEMPORARY — delete this route after extracting the refresh token
export async function GET() {
  const cookieStore = await cookies()
  return NextResponse.json({
    access_token: cookieStore.get('spotify_access_token')?.value ?? null,
    refresh_token: cookieStore.get('spotify_refresh_token')?.value ?? null,
  })
}
