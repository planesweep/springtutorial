/**
 * GraphQL Schema Definition (SDL-first).
 *
 * Alle Types in einer Datei für maximale Übersichtlichkeit im Demo.
 * Production: aufteilen in product.graphql, cart.graphql etc. (siehe Spec).
 *
 * Externe Datenquellen:
 *  - FakeStore API  → Product, Category, Cart
 *  - DummyJSON API  → SearchResult, User, Auth
 *  - Open-Meteo API → Weather, WeatherForecast
 */
export const typeDefs = /* GraphQL */ `

  # ─────────────────────────────────────────────────────────────
  # PRODUCT DOMAIN  (FakeStore API + DummyJSON für Details)
  # ─────────────────────────────────────────────────────────────

  """Produkt im Katalog. Daten von FakeStore API."""
  type Product {
    id: ID!
    title: String!
    price: Float!
    description: String!
    category: String!
    image: String!
    rating: ProductRating!
    """Erweiterte Daten von DummyJSON (nur wenn verfügbar)."""
    details: ProductDetails
  }

  type ProductRating {
    rate: Float!
    count: Int!
  }

  """Reichhaltige Produkt-Details von DummyJSON."""
  type ProductDetails {
    brand: String
    sku: String
    stock: Int!
    discountPercentage: Float
    availabilityStatus: String!
    tags: [String!]!
    images: [String!]!
    reviews: [ProductReview!]!
    shippingInformation: String
    returnPolicy: String
  }

  type ProductReview {
    rating: Int!
    comment: String!
    reviewerName: String!
    date: String!
  }

  """Paginierte Produktliste mit Cursor-Pagination."""
  type ProductConnection {
    nodes: [Product!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
    total: Int!
    skip: Int!
    limit: Int!
  }

  # ─────────────────────────────────────────────────────────────
  # SEARCH DOMAIN  (DummyJSON /products/search)
  # ─────────────────────────────────────────────────────────────

  """Suchergebnis mit Produkten und aggregierten Facetten."""
  type SearchResult {
    products: [Product!]!
    totalHits: Int!
    query: String!
    """Kategorie-Facetten aus den Treffern aggregiert."""
    facets: [SearchFacet!]!
    """Wetter-Empfehlungen basierend auf aktuellem Standort-Wetter."""
    weatherRecommendations: [Product!]
  }

  type SearchFacet {
    name: String!
    values: [SearchFacetValue!]!
  }

  type SearchFacetValue {
    value: String!
    count: Int!
  }

  input SearchInput {
    query: String!
    category: String
    limit: Int = 20
    skip: Int = 0
    """Ob Wetter-Empfehlungen eingeblendet werden sollen."""
    includeWeatherRecs: Boolean = false
  }

  # ─────────────────────────────────────────────────────────────
  # CART DOMAIN  (FakeStore API)
  # ─────────────────────────────────────────────────────────────

  """Warenkorb. Enthält Produkt-Referenzen und berechnete Summen."""
  type Cart {
    id: ID!
    userId: Int
    date: String!
    lines: [CartLine!]!
    """Berechnete Gesamtkosten (BFF-seitig aus Produktpreisen kalkuliert)."""
    subtotal: Float!
    totalItems: Int!
  }

  type CartLine {
    productId: Int!
    quantity: Int!
    """Produkt-Details aufgelöst per DataLoader-Pattern."""
    product: Product
  }

  input CartLineInput {
    productId: Int!
    quantity: Int!
  }

  # ─────────────────────────────────────────────────────────────
  # WEATHER DOMAIN  (Open-Meteo API)
  # ─────────────────────────────────────────────────────────────

  """Aktuelles Wetter an einem Standort."""
  type CurrentWeather {
    temperature: Float!
    windspeed: Float!
    winddirection: Float!
    weatherCode: Int!
    """Menschenlesbare Bezeichnung (dekodiert aus WMO Code)."""
    weatherLabel: String!
    """Emoji-Icon zum Wettercode."""
    weatherIcon: String!
    """Wettergruppe für Produkt-Empfehlungs-Logik."""
    weatherCategory: String!
    isDay: Boolean!
    time: String!
  }

  """Tagesprognose (ein Datenpunkt pro Tag)."""
  type DailyForecast {
    date: String!
    tempMax: Float!
    tempMin: Float!
    weatherCode: Int!
    weatherLabel: String!
    weatherIcon: String!
    precipitationSum: Float!
    windspeedMax: Float!
  }

  """Vollständige Wetterauskunft: Aktuell + 7-Tage-Forecast."""
  type WeatherForecast {
    latitude: Float!
    longitude: Float!
    timezone: String!
    current: CurrentWeather!
    daily: [DailyForecast!]!
    """Produkt-Tags die bei diesem Wetter empfohlen werden."""
    recommendedProductTags: [String!]!
  }

  # ─────────────────────────────────────────────────────────────
  # USER & AUTH DOMAIN  (DummyJSON)
  # ─────────────────────────────────────────────────────────────

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    username: String!
    avatarUrl: String
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  input LoginInput {
    """DummyJSON Test-User: emilys / emilyspass"""
    username: String!
    password: String!
  }

  # ─────────────────────────────────────────────────────────────
  # QUERIES
  # ─────────────────────────────────────────────────────────────

  type Query {
    """Alle Produkte, optional nach Kategorie und Limit gefiltert."""
    products(category: String, limit: Int, sort: String): [Product!]!

    """Einzelnes Produkt nach ID (FakeStore ID)."""
    product(id: ID!): Product

    """Alle verfügbaren Produkt-Kategorien (FakeStore API)."""
    categories: [String!]!

    """Volltextsuche via DummyJSON. Unterstützt Facetten + Wetter-Recs."""
    search(input: SearchInput!): SearchResult!

    """Warenkorb nach ID (FakeStore Cart)."""
    cart(id: ID!): Cart

    """Aktuelles Wetter + Forecast für beliebige Koordinaten."""
    weather(latitude: Float!, longitude: Float!, timezone: String): WeatherForecast!

    """Wetter am Store-Standort (Wien). Für Homepage-Widget."""
    storeWeather: WeatherForecast!

    """Aktuell eingeloggter User (erfordert Authorization Header)."""
    me: User
  }

  # ─────────────────────────────────────────────────────────────
  # MUTATIONS
  # ─────────────────────────────────────────────────────────────

  type Mutation {
    """Login via DummyJSON. Test-User: emilys / emilyspass"""
    login(input: LoginInput!): AuthPayload!

    """Neuen Warenkorb erstellen."""
    cartCreate(userId: Int): Cart!

    """Produkte zum Warenkorb hinzufügen."""
    cartLinesAdd(cartId: ID!, lines: [CartLineInput!]!): Cart!

    """Warenkorb-Positionen aktualisieren (Menge ändern)."""
    cartLinesUpdate(cartId: ID!, lines: [CartLineInput!]!): Cart!
  }
`
