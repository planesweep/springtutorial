/**
 * Open-Meteo API DataSource
 * https://open-meteo.com — vollständig kostenlos, kein API-Key
 *
 * Stellt Wetterdaten für zwei Use-Cases bereit:
 *  1. Homepage-Widget: Aktuelles Wetter am "Store-Standort"
 *  2. Wetterbasierte Produkt-Empfehlungen:
 *     Regen  → Regenjacken, Schirme
 *     Kalt   → Winterjacken, Mützen
 *     Heiß   → Shorts, Sonnenbrillen
 *
 * Endpoint: GET /v1/forecast
 * Docs: https://open-meteo.com/en/docs
 */

const BASE_URL = 'https://api.open-meteo.com/v1'

export interface CurrentWeather {
  temperature: number        // °C
  windspeed: number          // km/h
  winddirection: number      // Grad
  weathercode: number        // WMO Code (0=klar, 1-3=leicht bewölkt, etc.)
  is_day: number             // 1=Tag, 0=Nacht
  time: string               // ISO 8601
}

export interface DailyForecast {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  weathercode: number[]
  precipitation_sum: number[]
  windspeed_10m_max: number[]
}

export interface OpenMeteoResponse {
  latitude: number
  longitude: number
  timezone: string
  current_weather: CurrentWeather
  daily: DailyForecast
}

/** WMO Weather Interpretation Codes → lesbarer Status */
export function decodeWeatherCode(code: number): {
  label: string
  icon: string
  category: 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm'
} {
  if (code === 0) return { label: 'Klar', icon: '☀️', category: 'clear' }
  if (code <= 3) return { label: 'Leicht bewölkt', icon: '⛅', category: 'cloudy' }
  if (code <= 48) return { label: 'Nebel / Dunst', icon: '🌫️', category: 'cloudy' }
  if (code <= 57) return { label: 'Nieselregen', icon: '🌦️', category: 'rain' }
  if (code <= 67) return { label: 'Regen', icon: '🌧️', category: 'rain' }
  if (code <= 77) return { label: 'Schnee', icon: '❄️', category: 'snow' }
  if (code <= 82) return { label: 'Regenschauer', icon: '⛈️', category: 'rain' }
  if (code <= 86) return { label: 'Schneeschauer', icon: '🌨️', category: 'snow' }
  return { label: 'Gewitter', icon: '⛈️', category: 'storm' }
}

/**
 * Gibt Produkt-Tags zurück die bei diesem Wetter empfohlen werden.
 * Wird vom Search-Resolver für "Wetter-Empfehlungen" genutzt.
 */
export function getWeatherProductTags(weatherCode: number, tempMax: number): string[] {
  const { category } = decodeWeatherCode(weatherCode)
  const tags: string[] = []

  if (category === 'rain' || category === 'storm') tags.push('raincoat', 'umbrella', 'boots')
  if (category === 'snow') tags.push('winter', 'boots', 'gloves', 'jacket')
  if (category === 'clear' && tempMax > 22) tags.push('sunglasses', 'shorts', 'tshirt', 'sunscreen')
  if (tempMax < 10) tags.push('jacket', 'sweater', 'scarf')

  return tags
}

export const OpenMeteoAPI = {
  /**
   * Aktuelles Wetter + 7-Tage-Forecast für eine Location.
   *
   * @param latitude  Breitengrad (z.B. 48.21 für Wien)
   * @param longitude Längengrad (z.B. 16.37 für Wien)
   * @param timezone  IANA Timezone (z.B. "Europe/Vienna"), default "auto"
   */
  async getForecast(
    latitude: number,
    longitude: number,
    timezone = 'auto',
  ): Promise<OpenMeteoResponse> {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      timezone,
      current_weather: 'true',
      // Täglich: Temperatur-Range, Niederschlag, Windspitze, Wettercode
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'weathercode',
        'precipitation_sum',
        'windspeed_10m_max',
      ].join(','),
      forecast_days: '7',
    })

    const res = await fetch(`${BASE_URL}/forecast?${params}`, {
      // Wetter cachen: 30 Min genügen (keine ISR-Tags nötig, kein User-Bezug)
      next: { revalidate: 1800 },
    })

    if (!res.ok) throw new Error(`Open-Meteo API error ${res.status}`)
    return res.json() as Promise<OpenMeteoResponse>
  },

  /**
   * Wetter für vordefinierte Store-Standorte.
   * Im Demo: Wien als Hauptstandort.
   */
  async getStoreWeather(): Promise<OpenMeteoResponse> {
    // Wien: Hauptstandort des Demo-Shops
    return OpenMeteoAPI.getForecast(48.2082, 16.3738, 'Europe/Vienna')
  },
}
