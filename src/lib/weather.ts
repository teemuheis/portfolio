export type WeatherModifier = {
  energy: number
  valence: number
  code: number
  description: string
}

// WMO codes: https://open-meteo.com/en/docs
// 0-2: Clear, mainly clear, partly cloudy
// 3: Overcast
// 45, 48: Foggy
// 51-67: Drizzle and rain
// 71-77: Snow
// 80-82: Rain showers
// 85-86: Snow showers
// 80-99: Thunderstorm

function wmoCodeToModifier(code: number): WeatherModifier {
  let energy = 0
  let valence = 0
  let description = 'Unknown'

  if (code >= 0 && code <= 2) {
    energy = 0.08
    valence = 0.08
    description = 'Sunny'
  } else if (code === 3 || code === 4) {
    energy = 0
    valence = 0
    description = 'Cloudy'
  } else if (code === 45 || code === 48) {
    energy = -0.05
    valence = -0.08
    description = 'Foggy'
  } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    energy = -0.08
    valence = -0.1
    description = 'Rainy'
  } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    energy = -0.1
    valence = -0.05
    description = 'Snowy'
  } else if (code >= 80 && code <= 99) {
    energy = -0.12
    valence = -0.15
    description = 'Stormy'
  }

  return { energy, valence, code, description }
}

export async function getWeatherModifier(
  lat: number,
  lon: number
): Promise<WeatherModifier> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code&timezone=auto`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      console.error('Weather API error:', response.statusText)
      return { energy: 0, valence: 0, code: -1, description: 'Unknown' }
    }

    const data = (await response.json()) as { current: { weather_code: number } }
    const code = data.current.weather_code

    return wmoCodeToModifier(code)
  } catch (error) {
    console.error('Weather fetch failed:', error)
    return { energy: 0, valence: 0, code: -1, description: 'Unknown' }
  }
}
