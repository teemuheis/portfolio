import type { StravaActivity } from '@/types/strava'

export const revalidate = 0   // no cache — fresh shuffle on every request

export async function GET() {
  try {
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.STRAVA_CLIENT_ID!,
        client_secret: process.env.STRAVA_CLIENT_SECRET!,
        refresh_token: process.env.STRAVA_REFRESH_TOKEN!,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenRes.ok) {
      console.error('Strava token refresh failed:', await tokenRes.text())
      return Response.json([])
    }

    const { access_token } = await tokenRes.json()

    const activitiesRes = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=50',
      { headers: { Authorization: `Bearer ${access_token}` } },
    )

    if (!activitiesRes.ok) {
      console.error('Strava activities fetch failed:', await activitiesRes.text())
      return Response.json([])
    }

    const raw = await activitiesRes.json()

    // Shuffle so the portfolio shows varied routes across page loads
    const eligible = (Array.isArray(raw) ? raw : [])
      .filter((a: Record<string, unknown>) => a.map && (a.map as Record<string, unknown>).summary_polyline)
    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligible[i], eligible[j]] = [eligible[j], eligible[i]]
    }

    const activities: StravaActivity[] = eligible
      .slice(0, 10)
      .map((a: Record<string, unknown>) => ({
        id: a.id as number,
        name: a.name as string,
        type: (a.sport_type ?? a.type) as string,
        distance: a.distance as number,
        elapsed_time: a.elapsed_time as number,
        total_elevation_gain: a.total_elevation_gain as number,
        polyline: (a.map as Record<string, unknown>).summary_polyline as string,
        start_date: a.start_date_local as string,
      }))

    return Response.json(activities)
  } catch (err) {
    console.error('Strava route error:', err)
    return Response.json([])
  }
}
