/**
 * Wetter-Seite — Demo für Open-Meteo API Integration
 *
 * Zeigt:
 *  - Direkter API-Call im Server Component (kein GraphQL Client nötig)
 *  - 30-Minuten-Cache via Next.js fetch
 *  - Wetter-basierte Produkt-Empfehlungen (BFF-Logik)
 *  - Standort-Suche: User gibt Koordinaten ein → URL-Parameter
 */

import type { Metadata } from 'next'
import { OpenMeteoAPI, decodeWeatherCode, getWeatherProductTags } from '@/lib/graphql/datasources/OpenMeteoAPI'
import { DummyJsonAPI } from '@/lib/graphql/datasources/DummyJsonAPI'
import { encodeProductId } from '@/lib/product-id'
import { WeatherCard } from '@/components/weather/WeatherCard'
import { WeatherForecastList } from '@/components/weather/WeatherForecastList'
import { ProductCard } from '@/components/product/ProductCard'

export const metadata: Metadata = {
  title: 'Wetter & Empfehlungen',
  description: 'Aktuelles Wetter und wetterbasierte Produktempfehlungen',
}

interface PageProps {
  searchParams: { lat?: string; lon?: string; tz?: string }
}

// Standard-Standorte für Demo
const LOCATIONS = [
  { name: 'Wien', lat: 48.2082, lon: 16.3738, tz: 'Europe/Vienna' },
  { name: 'Berlin', lat: 52.52, lon: 13.405, tz: 'Europe/Berlin' },
  { name: 'Zürich', lat: 47.3769, lon: 8.5417, tz: 'Europe/Zurich' },
  { name: 'London', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
]

export default async function WeatherPage({ searchParams }: PageProps) {
  const lat = searchParams.lat ? parseFloat(searchParams.lat) : 48.2082
  const lon = searchParams.lon ? parseFloat(searchParams.lon) : 16.3738
  const tz = searchParams.tz ?? 'Europe/Vienna'

  // Wetter laden (30 Min gecacht via fetch)
  const weather = await OpenMeteoAPI.getForecast(lat, lon, tz)
  const { label, icon, category } = decodeWeatherCode(weather.current_weather.weathercode)
  const productTags = getWeatherProductTags(
    weather.current_weather.weathercode,
    weather.daily.temperature_2m_max[0],
  )

  // Wetterbasierte Produktsuche via DummyJSON
  // Ersten Tag nehmen falls mehrere Tags
  const weatherQuery = productTags[0] ?? 'jacket'
  const searchResult = await DummyJsonAPI.searchProducts({ q: weatherQuery, limit: 4 })

  const activeLocation = LOCATIONS.find(l => Math.abs(l.lat - lat) < 0.1 && Math.abs(l.lon - lon) < 0.1)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Wetter & Empfehlungen</h1>
        <span className="text-xs text-gray-400">Open-Meteo API · 30 Min Cache</span>
      </div>

      {/* Standort-Auswahl */}
      <div className="flex flex-wrap gap-2">
        {LOCATIONS.map(loc => (
          <a
            key={loc.name}
            href={`/weather?lat=${loc.lat}&lon=${loc.lon}&tz=${encodeURIComponent(loc.tz)}`}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              activeLocation?.name === loc.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {loc.name}
          </a>
        ))}
      </div>

      {/* Aktuelles Wetter */}
      <div className="grid md:grid-cols-2 gap-6">
        <WeatherCard
          temperature={weather.current_weather.temperature}
          windspeed={weather.current_weather.windspeed}
          label={label}
          icon={icon}
          isDay={weather.current_weather.is_day === 1}
          timezone={weather.timezone}
          time={weather.current_weather.time}
        />

        {/* Wetter-Empfehlungs-Logik erklären */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          <h2 className="font-semibold text-gray-800">Empfohlene Produkte für dieses Wetter</h2>
          <div className="flex flex-wrap gap-1">
            {productTags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Bei <strong>{label} {icon}</strong> ({category}) empfiehlt der BFF-Resolver folgende Produkte.
            Suche via DummyJSON nach &quot;{weatherQuery}&quot;.
          </p>
        </div>
      </div>

      {/* 7-Tage-Forecast */}
      <WeatherForecastList daily={weather.daily} />

      {/* Wetterbasierte Produkt-Empfehlungen */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Produktempfehlungen für &quot;{weatherQuery}&quot;
          <span className="ml-2 text-sm font-normal text-gray-400">(DummyJSON Suche)</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {searchResult.products.map(p => (
            <ProductCard
              key={p.id}
              id={encodeProductId('dummyjson', p.id)}
              title={p.title}
              price={p.price}
              image={p.thumbnail}
              category={p.category}
              rating={p.rating}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
