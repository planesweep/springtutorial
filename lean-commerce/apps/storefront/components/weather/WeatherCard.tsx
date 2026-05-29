/** Detaillierte Wetter-Karte für die /weather Seite. */

interface WeatherCardProps {
  temperature: number
  windspeed: number
  label: string
  icon: string
  isDay: boolean
  timezone: string
  time: string
}

export function WeatherCard({ temperature, windspeed, label, icon, isDay, timezone, time }: WeatherCardProps) {
  return (
    <div className={`rounded-xl p-6 ${isDay ? 'bg-sky-50 border-sky-100' : 'bg-indigo-950 text-white'} border`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-6xl mb-3">{icon}</div>
          <div className="text-4xl font-bold">{temperature.toFixed(1)} °C</div>
          <div className="text-lg mt-1 opacity-80">{label}</div>
          <div className="text-sm mt-2 opacity-60">
            💨 {windspeed} km/h Wind
          </div>
        </div>
        <div className="text-right text-sm opacity-60 space-y-1">
          <div>🌍 {timezone}</div>
          <div>{new Date(time).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })} Uhr</div>
          <div className="mt-2">Open-Meteo API</div>
        </div>
      </div>
    </div>
  )
}
