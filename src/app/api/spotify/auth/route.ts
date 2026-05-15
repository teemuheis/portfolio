import { buildAuthUrl } from '@/lib/spotify'
import { NextResponse } from 'next/server'

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  // Encode the raw bytes directly — NOT a hex string
  return Buffer.from(hashBuffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export async function GET() {
  const codeVerifier = generateRandomString(128)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(16)

  // Embed code_verifier in state so it survives the cross-site redirect from Spotify
  const stateWithVerifier = `${state}:${Buffer.from(codeVerifier).toString('base64')}`

  const authUrl = buildAuthUrl(stateWithVerifier, codeChallenge)
  return NextResponse.redirect(authUrl)
}
