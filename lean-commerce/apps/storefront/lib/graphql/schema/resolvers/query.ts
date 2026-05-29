/**
 * Query Resolver — verbindet GraphQL Queries mit den DataSources.
 *
 * Pattern: Jeder Resolver delegiert sofort an einen DataSource.
 * Keine Business-Logik hier; Transformationen in den DataSources.
 * Context enthält: { user?, token? } — durch Auth-Plugin gesetzt.
 */

import { FakeStoreAPI } from '../../datasources/FakeStoreAPI'
import { DummyJsonAPI } from '../../datasources/DummyJsonAPI'
import { OpenMeteoAPI, decodeWeatherCode, getWeatherProductTags } from '../../datasources/OpenMeteoAPI'
import type { GraphQLContext } from '../../context'

// Helpers: FakeStore-Produkt → GraphQL Product Type mappen
function mapFakeProduct(p: Awaited<ReturnType<typeof FakeStoreAPI.getProductById>>) {
  if (!p) return null
  return {
    id: String(p.id),
    title: p.title,
    price: p.price,
    description: p.description,
    category: p.category,
    image: p.image,
    rating: { rate: p.rating.rate, count: p.rating.count },
    // details wird lazy per Field Resolver geladen (products.details Resolver)
    details: null,
  }
}

// DummyJSON-Produkt → GraphQL Product Type mappen
function mapDummyProduct(p: NonNullable<Awaited<ReturnType<typeof DummyJsonAPI.getProductById>>>) {
  return {
    id: String(p.id),
    title: p.title,
    price: p.price,
    description: p.description,
    category: p.category,
    image: p.thumbnail,
    rating: { rate: p.rating, count: p.reviews?.length ?? 0 },
    details: {
      brand: p.brand,
      sku: p.sku,
      stock: p.stock,
      discountPercentage: p.discountPercentage,
      availabilityStatus: p.availabilityStatus,
      tags: p.tags ?? [],
      images: p.images ?? [p.thumbnail],
      reviews: (p.reviews ?? []).map(r => ({
        rating: r.rating,
        comment: r.comment,
        reviewerName: r.reviewerName,
        date: r.date,
      })),
      shippingInformation: p.shippingInformation,
      returnPolicy: p.returnPolicy,
    },
  }
}

// Open-Meteo Response → GraphQL WeatherForecast mappen
function mapWeather(raw: Awaited<ReturnType<typeof OpenMeteoAPI.getForecast>>) {
  const { label, icon, category } = decodeWeatherCode(raw.current_weather.weathercode)
  const todayMaxTemp = raw.daily.temperature_2m_max[0] ?? raw.current_weather.temperature

  return {
    latitude: raw.latitude,
    longitude: raw.longitude,
    timezone: raw.timezone,
    current: {
      temperature: raw.current_weather.temperature,
      windspeed: raw.current_weather.windspeed,
      winddirection: raw.current_weather.winddirection,
      weatherCode: raw.current_weather.weathercode,
      weatherLabel: label,
      weatherIcon: icon,
      weatherCategory: category,
      isDay: raw.current_weather.is_day === 1,
      time: raw.current_weather.time,
    },
    daily: raw.daily.time.map((date, i) => {
      const { label: dl, icon: di } = decodeWeatherCode(raw.daily.weathercode[i])
      return {
        date,
        tempMax: raw.daily.temperature_2m_max[i],
        tempMin: raw.daily.temperature_2m_min[i],
        weatherCode: raw.daily.weathercode[i],
        weatherLabel: dl,
        weatherIcon: di,
        precipitationSum: raw.daily.precipitation_sum[i],
        windspeedMax: raw.daily.windspeed_10m_max[i],
      }
    }),
    recommendedProductTags: getWeatherProductTags(raw.current_weather.weathercode, todayMaxTemp),
  }
}

export const queryResolvers = {
  Query: {
    /** Produkte von FakeStore API. Kategorie-Filter und Limit werden direkt übergeben. */
    products: async (_: unknown, args: { category?: string; limit?: number; sort?: string }) => {
      const products = await FakeStoreAPI.getProducts({
        category: args.category,
        limit: args.limit,
        sort: (args.sort as 'asc' | 'desc') ?? 'asc',
      })
      return products.map(mapFakeProduct).filter(Boolean)
    },

    /** Einzelnes Produkt: primär FakeStore, falls nicht gefunden DummyJSON als Fallback. */
    product: async (_: unknown, args: { id: string }) => {
      const numId = parseInt(args.id, 10)
      const fp = await FakeStoreAPI.getProductById(numId)
      if (fp) return mapFakeProduct(fp)

      // Fallback: DummyJSON enthält tausende Produkte
      const dp = await DummyJsonAPI.getProductById(numId)
      return dp ? mapDummyProduct(dp) : null
    },

    /** Kategorien von FakeStore API (men's clothing, electronics, etc.) */
    categories: () => FakeStoreAPI.getCategories(),

    /**
     * Volltextsuche via DummyJSON /products/search.
     * Aggregiert Kategorien als Facetten.
     * Optional: Wetter-Empfehlungen aus Open-Meteo.
     */
    search: async (_: unknown, args: { input: { query: string; category?: string; limit?: number; skip?: number; includeWeatherRecs?: boolean } }) => {
      const { query, category, limit = 20, skip = 0, includeWeatherRecs = false } = args.input

      // Suche via DummyJSON (bei Kategorie-Filter: category endpoint nutzen)
      const result = category
        ? await DummyJsonAPI.getProductsByCategory(category, { limit, skip })
        : await DummyJsonAPI.searchProducts({ q: query, limit, skip })

      const products = result.products.map(mapDummyProduct)

      // Facetten: Kategorien aus den Treffern aggregieren
      const categoryMap = new Map<string, number>()
      result.products.forEach(p => {
        categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1)
      })
      const facets = [
        {
          name: 'category',
          values: Array.from(categoryMap.entries()).map(([value, count]) => ({ value, count })),
        },
      ]

      // Wetter-Empfehlungen: nur wenn explizit angefragt (Performance)
      let weatherRecommendations = null
      if (includeWeatherRecs) {
        try {
          const weather = await OpenMeteoAPI.getStoreWeather()
          const tags = getWeatherProductTags(
            weather.current_weather.weathercode,
            weather.daily.temperature_2m_max[0],
          )
          // Produkte die einen der Wetter-Tags enthalten
          weatherRecommendations = result.products
            .filter(p => p.tags?.some(t => tags.some(wt => t.toLowerCase().includes(wt))))
            .slice(0, 4)
            .map(mapDummyProduct)
        } catch {
          // Wetter-Empfehlungen sind optional → Fehler nicht weiterwerfen
          weatherRecommendations = []
        }
      }

      return {
        products,
        totalHits: result.total,
        query,
        facets,
        weatherRecommendations,
      }
    },

    /** Warenkorb von FakeStore API. Produkte werden per CartLine-Resolver geladen. */
    cart: async (_: unknown, args: { id: string }) => {
      const cart = await FakeStoreAPI.getCart(parseInt(args.id, 10))
      if (!cart) return null

      return {
        id: String(cart.id),
        userId: cart.userId,
        date: cart.date,
        lines: cart.products.map(p => ({ productId: p.productId, quantity: p.quantity, product: null })),
        subtotal: 0,  // wird per Field Resolver berechnet
        totalItems: cart.products.reduce((sum, p) => sum + p.quantity, 0),
      }
    },

    /** Wetter für beliebige Koordinaten. */
    weather: async (_: unknown, args: { latitude: number; longitude: number; timezone?: string }) => {
      const raw = await OpenMeteoAPI.getForecast(args.latitude, args.longitude, args.timezone)
      return mapWeather(raw)
    },

    /** Wetter am Store-Standort Wien (gecacht 30 Min via Next.js fetch). */
    storeWeather: async () => {
      const raw = await OpenMeteoAPI.getStoreWeather()
      return mapWeather(raw)
    },

    /** Aktueller User aus JWT-Token (aus Authorization Header). */
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.token) return null
      const user = await DummyJsonAPI.getCurrentUser(ctx.token)
      if (!user) return null
      return {
        id: String(user.id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        avatarUrl: user.image,
      }
    },
  },
}
