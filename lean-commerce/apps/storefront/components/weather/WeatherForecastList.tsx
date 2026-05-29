/** 7-Tage-Forecast als horizontale Liste. Server Component. */

import { decodeWeatherCode } from '@/lib/graphql/datasources/OpenMeteoAPI'

interface DailyData {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  weathercode: number[]
  precipitation_sum: number[]
}

export function WeatherForecastList({ daily }: { daily: DailyData }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">7-Tage-Forecast</h2>
      <div className="grid grid-cols-7 gap-2">
        {daily.time.map((date, i) => {
          const { icon } = decodeWeatherCode(daily.weathercode[i])
          return (
            <div key={date} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(date).toLocaleDateString('de-AT', { weekday: 'short' })}
              </div>
              <div className="text-2xl">{icon}</div>
              <div className="text-sm font-bold text-gray-800 mt-1">
                {daily.temperature_2m_max[i].toFixed(0)}°
              </div>
              <div className="text-xs text-gray-400">
                {daily.temperature_2m_min[i].toFixed(0)}°
              </div>
              {daily.precipitation_sum[i] > 0 && (
                <div className="text-xs text-blue-400 mt-1">
                  {daily.precipitation_sum[i].toFixed(1)} mm
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
