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

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

function base64url(input: string): string {
  return Buffer.from(input, 'binary')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export async function GET() {
  const codeVerifier = generateRandomString(128)
  const codeChallengeSha = await sha256(codeVerifier)
  const codeChallenge = base64url(codeChallengeSha)
  const state = generateRandomString(16)

  // Encode code_verifier in the state param to pass it back through Spotify's redirect
  // state format: "state_value:code_verifier_encoded"
  // Use standard base64 (URL-safe encoding may cause issues with decoding)
  const encodedVerifier = Buffer.from(codeVerifier).toString('base64')
  const stateWithVerifier = `${state}:${encodedVerifier}`

  const authUrl = buildAuthUrl(stateWithVerifier, codeChallenge)
  const response = NextResponse.redirect(authUrl)

  return response
}
