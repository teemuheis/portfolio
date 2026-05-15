import { getTopTracks, searchTracks } from '@/lib/spotify'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0

// Spotify's /recommendations endpoint is disabled for new apps (post Nov 2024).
// Strategy: blend user's top tracks with mood-keyword search results.

const MOOD_SEARCH_QUERIES: Record<string, string[]> = {
  energetic: ['workout motivation energetic', 'high energy running'],
  chill: ['lo-fi chill study', 'calm relaxing indie'],
  focus: ['focus deep work instrumental', 'concentration study music'],
  happy: ['happy feel good pop', 'upbeat feel good songs'],
  melancholy: ['melancholy sad indie', 'emotional rainy day'],
  party: ['party dance hits', 'edm club dance'],
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mood = (searchParams.get('mood') || 'chill').toLowerCase()

  if (!MOOD_SEARCH_QUERIES[mood]) {
    return NextResponse.json({ error: 'Invalid mood' }, { status: 400 })
  }

  try {
    // Fetch user's top tracks + mood-based search results in parallel
    const queries = MOOD_SEARCH_QUERIES[mood]
    const randomQuery = queries[Math.floor(Math.random() * queries.length)]

    const [topTracks, searchResults] = await Promise.all([
      getTopTracks(20),
      searchTracks(randomQuery, 20),
    ])

    // Shuffle top tracks and take 5
    const shuffledTop = topTracks.items
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)

    // Take 5 from search results
    const searchPicks = searchResults
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)

    // Blend: 5 personal + 5 discovery, deduplicate by id
    const seen = new Set<string>()
    const tracks = [...shuffledTop, ...searchPicks].filter((t) => {
      if (seen.has(t.id)) return false
      seen.add(t.id)
      return true
    })

    return NextResponse.json({ tracks, mood })
  } catch (error) {
    console.error('Recommendations fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
