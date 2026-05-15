import { getRecommendations, getTopArtists, getTopTracks } from '@/lib/spotify'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

type MoodConfig = {
  energy: number
  valence: number
  danceability: number
  tempo: number
}

const MOOD_CONFIGS: Record<string, MoodConfig> = {
  energetic: { energy: 0.88, valence: 0.7, danceability: 0.8, tempo: 138 },
  chill: { energy: 0.28, valence: 0.5, danceability: 0.38, tempo: 88 },
  focus: { energy: 0.5, valence: 0.38, danceability: 0.28, tempo: 108 },
  happy: { energy: 0.72, valence: 0.88, danceability: 0.7, tempo: 124 },
  melancholy: { energy: 0.28, valence: 0.18, danceability: 0.28, tempo: 78 },
  party: { energy: 0.9, valence: 0.82, danceability: 0.9, tempo: 132 },
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mood = (searchParams.get('mood') || 'chill').toLowerCase()
  const energyMod = parseFloat(searchParams.get('energy_mod') || '0')
  const valenceMod = parseFloat(searchParams.get('valence_mod') || '0')

  if (!MOOD_CONFIGS[mood]) {
    return NextResponse.json({ error: 'Invalid mood' }, { status: 400 })
  }

  try {
    // Fetch user's top artists and tracks for seeding
    const [topArtists, topTracks] = await Promise.all([
      getTopArtists(2),
      getTopTracks(3),
    ])

    const seedArtists = topArtists.items.map((a) => a.id).slice(0, 2)
    const seedTracks = topTracks.items.map((t) => t.id).slice(0, 3)

    const config = MOOD_CONFIGS[mood]
    const targetEnergy = Math.max(0, Math.min(1, config.energy + energyMod))
    const targetValence = Math.max(0, Math.min(1, config.valence + valenceMod))

    const recommendations = await getRecommendations({
      seed_artists: seedArtists,
      seed_tracks: seedTracks,
      limit: 10,
      target_energy: targetEnergy,
      target_valence: targetValence,
      target_danceability: config.danceability,
      target_tempo: config.tempo,
    })

    return NextResponse.json({
      tracks: recommendations.tracks,
      mood,
      energy_mod: energyMod,
      valence_mod: valenceMod,
    })
  } catch (error) {
    console.error('Recommendations fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
