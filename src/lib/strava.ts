import type { StravaActivity } from '@/types/strava'

export async function getStravaActivities(): Promise<StravaActivity[]> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/strava/activities`, {
      cache: 'no-store',
    })

    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
