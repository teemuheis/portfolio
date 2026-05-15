import { getTopTracks, searchTracks } from '@/lib/spotify'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

const MOOD_SEARCH_QUERIES: Record<string, string[]> = {
  energetic: ['workout motivation energetic', 'high energy running', 'power metal energetic'],
  chill: ['lo-fi chill study', 'calm relaxing indie', 'ambient chill vibes'],
  focus: ['focus deep work instrumental', 'concentration study music', 'minimalist piano focus'],
  happy: ['happy feel good pop', 'upbeat feel good songs', 'summer happy vibes'],
  melancholy: ['melancholy sad indie', 'emotional rainy day', 'post-rock atmospheric sad'],
  party: ['party dance hits', 'edm club dance', 'house party anthems'],
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mood = (searchParams.get('mood') || 'chill').toLowerCase()

  if (!MOOD_SEARCH_QUERIES[mood]) {
    return NextResponse.json({ error: 'Invalid mood' }, { status: 400 })
  }

  try {
    const queries = MOOD_SEARCH_QUERIES[mood]
    // Pick two different queries for variety
    const shuffledQueries = queries.sort(() => Math.random() - 0.5)
    const [query1, query2] = shuffledQueries

    const [topTracks, searchResults1, searchResults2] = await Promise.all([
      getTopTracks(50),
      searchTracks(query1, 20),
      searchTracks(query2, 10),
    ])

    // Teemu recommends: shuffle personal top tracks, take 8
    const personal = topTracks.items
      .sort(() => Math.random() - 0.5)
      .slice(0, 8)

    // General mood picks: blend two searches, dedupe, take 10
    const seen = new Set<string>(personal.map((t) => t.id))
    const general = [...searchResults1, ...searchResults2]
      .sort(() => Math.random() - 0.5)
      .filter((t) => {
        if (seen.has(t.id)) return false
        seen.add(t.id)
        return true
      })
      .slice(0, 10)

    return NextResponse.json({ general, personal, mood })
  } catch (error) {
    console.error('Recommendations fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
