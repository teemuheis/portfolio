import { getWeatherModifier } from '@/lib/weather'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lon = parseFloat(searchParams.get('lon') ?? '')

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: 'Invalid lat/lon parameters' },
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
