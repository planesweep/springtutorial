/**
 * WeatherWidget — async Server Component für die Homepage.
 * Kompakte Anzeige: Icon, Temperatur, Windgeschwindigkeit.
 * Wird via Suspense gestreamt (Open-Meteo API kann 1-2s brauchen).
 *
 * Resilienz: Schlägt der Open-Meteo-Abruf fehl (z.B. eingeschränktes Netz beim
 * statischen Prerender), wird ein Fallback gerendert statt den Build/SSR zu
 * crashen. Die Seite bleibt funktionsfähig.
 */

import { OpenMeteoAPI, decodeWeatherCode } from '@/lib/graphql/datasources/OpenMeteoAPI'

export async function WeatherWidget() {
  let weather: Awaited<ReturnType<typeof OpenMeteoAPI.getStoreWeather>>
  try {
    weather = await OpenMeteoAPI.getStoreWeather()
  } catch {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-gray-400 text-sm">
        Wetterdaten momentan nicht verfügbar (Open-Meteo nicht erreichbar).
      </div>
    )
  }

  const { label, icon } = decodeWeatherCode(weather.current_weather.weathercode)

  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-100 border border-blue-100 rounded-xl p-6">
      <div className="flex items-center gap-6">
        <div className="text-5xl">{icon}</div>
        <div>
          <div className="text-3xl font-bold text-gray-900">
            {weather.current_weather.temperature.toFixed(1)} °C
          </div>
          <div className="text-gray-600">{label}</div>
          <div className="text-sm text-gray-400 mt-1">
            💨 {weather.current_weather.windspeed} km/h · Wien · Open-Meteo
          </div>
        </div>
        <div className="ml-auto hidden md:flex gap-3">
          {weather.daily.time.slice(0, 5).map((date, i) => {
            const { icon: di } = decodeWeatherCode(weather.daily.weathercode[i])
            return (
              <div key={date} className="text-center">
                <div className="text-lg">{di}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(date).toLocaleDateString('de-AT', { weekday: 'short' })}
                </div>
                <div className="text-xs font-medium">{weather.daily.temperature_2m_max[i].toFixed(0)}°</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
