import { getWeatherModifier } from '@/lib/weather'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lon = parseFloat(searchParams.get('lon') || '0')

  if (lat === 0 && lon === 0) {
    return NextResponse.json(
      { error: 'Missing lat/lon parameters' },
      { status: 400 }
    )
  }

  try {
    const modifier = await getWeatherModifier(lat, lon)
    return NextResponse.json(modifier)
  } catch (error) {
    console.error('Weather modifier fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather' },
      { status: 500 }
    )
  }
}
