# Lean Commerce Demo

Next.js 14 · GraphQL Yoga BFF · GraphQL Hive · Open-Meteo · FakeStore · DummyJSON

Trainingsprojekt für die **Lean Decoupled Commerce Architektur**:
alle Layer vollständig implementiert und kommentiert.

```
Browser
  └─ Edge/CDN (Cloudflare/CloudFront)
       └─ Next.js 14 Storefront  (App Router · SSR/SSG/ISR · Server Actions)
            └─ GraphQL BFF  (Yoga · Hive · Response Cache · Persisted Ops)
                 ├─ FakeStore API    https://fakestoreapi.com  (Produkte, Cart)
                 ├─ DummyJSON API    https://dummyjson.com     (Suche, Auth)
                 └─ Open-Meteo API  https://api.open-meteo.com (Wetter)
```

---

## Schnellstart

### Option A — Docker Compose (empfohlen)

```bash
# Repository klonen
git clone https://github.com/planesweep/springtutorial
cd springtutorial/lean-commerce

# Umgebungsvariablen anlegen (alle APIs funktionieren ohne Keys)
cp apps/storefront/.env.example apps/storefront/.env.local

# Development starten (Hot Reload)
docker compose up

# → http://localhost:3000
# → http://localhost:3000/api/graphql  (GraphiQL Playground)
```

Beim ersten Start lädt Docker die Abhängigkeiten (~2 Min).
Folgeaufrufe starten in ~10 Sekunden (Layer-Cache).

### Option B — Lokal mit pnpm

**Voraussetzungen:** Node.js 20+, pnpm 9+

```bash
# pnpm installieren (falls noch nicht vorhanden)
npm install -g pnpm@9

# Ins Projektverzeichnis wechseln
cd springtutorial/lean-commerce

# Abhängigkeiten installieren
pnpm install

# Umgebungsvariablen
cp apps/storefront/.env.example apps/storefront/.env.local

# Entwicklungsserver starten
pnpm dev
# → http://localhost:3000
```

---

## Anwendung ausführen

### Development (Hot Reload)

```bash
# Alle Services
docker compose up

# Nur Logs streamen
docker compose logs -f storefront

# Im Hintergrund
docker compose up -d && docker compose logs -f
```

### Production Build

```bash
# Image bauen und starten
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Status prüfen
docker compose -f docker-compose.prod.yml ps
curl http://localhost:3000/api/health
```

### Einzelne Befehle

```bash
# Im laufenden Container ausführen
docker compose exec storefront pnpm --filter storefront typecheck
docker compose exec storefront pnpm --filter storefront lint

# Image-Größe prüfen
docker image inspect lean-commerce:latest --format='{{.Size}}' | numfmt --to=iec
```

---

## Seiten & Features

| URL | Rendering | Feature |
|---|---|---|
| `/` | ISR 60s | Homepage · Wetter-Widget · Featured Products |
| `/products` | SSR | Produkt-Listing · Kategorie-Filter · Streaming |
| `/products/[id]` | ISR 5min | Produkt-Detail · generateStaticParams · OG Image |
| `/search?q=phone` | SSR | DummyJSON Volltext-Suche · Facetten |
| `/weather` | SSR | Open-Meteo Forecast · Wetter-Empfehlungen |
| `/cart` | CSR | Zustand Store · Optimistic Updates |
| `/api/graphql` | – | GraphiQL Playground (nur Development) |
| `/api/health` | – | Health Check aller 3 externen APIs |
| `/api/revalidate` | – | Webhook für On-Demand ISR |

### GraphQL Playground

Im Development-Modus ist der GraphiQL Playground unter `/api/graphql` erreichbar.

**Beispiel-Queries:**

```graphql
# Produkte laden
query Products {
  products(limit: 5) {
    id title price category
    rating { rate count }
  }
}

# Suche mit Facetten
query Search {
  search(input: { query: "phone", limit: 10, includeWeatherRecs: true }) {
    totalHits
    query
    products { id title price }
    facets { name values { value count } }
    weatherRecommendations { id title }
  }
}

# Wetter Wien
query StoreWeather {
  storeWeather {
    current { temperature weatherIcon weatherLabel windspeed }
    daily { date tempMax tempMin weatherIcon }
    recommendedProductTags
  }
}

# Login (DummyJSON Test-User)
mutation Login {
  login(input: { username: "emilys", password: "emilyspass" }) {
    accessToken
    user { id firstName lastName email }
  }
}

# Warenkorb anlegen
mutation CreateCart {
  cartCreate { id date totalItems }
}

# Warenkorb mit Produkt füllen
mutation AddToCart {
  cartLinesAdd(cartId: "1", lines: [{ productId: 1, quantity: 2 }]) {
    id totalItems subtotal
    lines { productId quantity product { title price } }
  }
}
```

---

## GraphQL Hive (optional)

Hive überwacht Schema-Änderungen und trackt Query-Nutzung.

### Setup

1. Account erstellen: [app.graphql-hive.com](https://app.graphql-hive.com)
2. Neues Projekt + Target anlegen
3. Token generieren (Project → Settings → Tokens)
4. In `.env.local` eintragen:

```bash
HIVE_TOKEN=your-token-here
```

5. `docker compose restart storefront`

Hive meldet das Schema automatisch beim Start und trackt alle Queries.

### Schema prüfen (CI)

```bash
# Schema gegen Registry prüfen (Breaking Change Detection)
npx @graphql-hive/cli schema:check \
  --token $HIVE_TOKEN \
  apps/storefront/lib/graphql/schema/typeDefs.ts

# Schema publishen
npx @graphql-hive/cli schema:publish \
  --token $HIVE_TOKEN \
  --author "$(git config user.name)" \
  --commit "$(git rev-parse HEAD)" \
  apps/storefront/lib/graphql/schema/typeDefs.ts
```

GitHub Actions führen diesen Check automatisch bei jedem PR aus (`.github/workflows/hive-schema-check.yml`).

---

## Projekt-Struktur

```
lean-commerce/
├── Dockerfile              Production multi-stage build
├── Dockerfile.dev          Development mit Hot Reload
├── docker-compose.yml      Development Compose
├── docker-compose.prod.yml Production Compose
│
└── apps/storefront/
    ├── app/
    │   ├── api/
    │   │   ├── graphql/route.ts    ← GraphQL Yoga BFF Entry
    │   │   ├── health/route.ts     ← Health Check
    │   │   └── revalidate/route.ts ← ISR Webhook
    │   ├── (shop)/
    │   │   ├── products/           SSR + ISR
    │   │   ├── search/             SSR (DummyJSON)
    │   │   ├── weather/            SSR (Open-Meteo)
    │   │   └── cart/               CSR (Zustand)
    │   └── page.tsx                ISR Homepage
    │
    ├── lib/graphql/
    │   ├── datasources/
    │   │   ├── FakeStoreAPI.ts     Commerce Monolith
    │   │   ├── DummyJsonAPI.ts     Search + Auth
    │   │   └── OpenMeteoAPI.ts     Wetter + Empfehlungen
    │   ├── schema/
    │   │   ├── typeDefs.ts         SDL-first Schema
    │   │   └── resolvers/          Query + Mutation + Types
    │   └── context.ts              Request Context (JWT)
    │
    ├── components/
    │   ├── product/                ProductCard, Grid, Featured
    │   ├── weather/                WeatherWidget, Card, Forecast
    │   ├── cart/                   CartIndicator, LineItem, AddButton
    │   └── search/                 SearchBar, SearchResults
    │
    └── lib/
        ├── store/cart.ts           Zustand + Persist + Immer
        └── actions/checkout.ts     Server Action
```

---

## Umgebungsvariablen

Alle Variablen sind in `.env.example` dokumentiert. Pflicht-Variablen:

| Variable | Default | Beschreibung |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Öffentliche URL |
| `JWT_SECRET` | – | Mindestens 32 Zeichen |
| `REVALIDATE_SECRET` | – | Für ISR-Webhook |
| `HIVE_TOKEN` | – | Optional: Hive Integration |

**Keine** der drei externen APIs (FakeStore, DummyJSON, Open-Meteo) benötigt einen API-Key.

---

## Bekannte Einschränkungen

| Problem | Beschreibung | Priorität |
|---|---|---|
| **N+1 Cart** | `Cart.subtotal` macht N parallele API-Calls (einen pro Produkt). In Production: DataLoader verwenden. | Mittel |
| **In-Memory Cache** | `useResponseCache` verliert den Cache bei Neustart. Für Multi-Instance: Redis aktivieren (docker-compose.yml, auskommentiert). | Niedrig |
| **FakeStore Write-Through** | Cart-Mutationen von FakeStore API sind Fake-Responses — Daten werden nicht persistent gespeichert. Nur für Demo. | Bekannt |
| **DummyJSON ID-Konflikt** | FakeStore IDs 1-20 und DummyJSON IDs 1-194 überschneiden sich. Der `product(id)` Resolver bevorzugt FakeStore — DummyJSON-Produkte unter gleicher ID sind nur via Search erreichbar. | Niedrig |
| **Standalone-Pfad** | `server.js` Pfad im Docker-Runner hängt von der pnpm-Version ab. Bei Problemen: `CMD ["node", "server.js"]` ohne Unterverzeichnis versuchen. | Mittel |

---

## Tests ausführen

```bash
# Alle Tests
pnpm test

# Typecheck
pnpm typecheck

# Lint
pnpm lint

# Im Docker
docker compose exec storefront pnpm --filter storefront test
```

---

## Weiterführende Links

- [Next.js 14 App Router Docs](https://nextjs.org/docs)
- [GraphQL Yoga Docs](https://the-guild.dev/graphql/yoga-server)
- [GraphQL Hive](https://graphql-hive.com)
- [FakeStore API](https://fakestoreapi.com)
- [DummyJSON Docs](https://dummyjson.com/docs)
- [Open-Meteo Docs](https://open-meteo.com/en/docs)
- [Technische Spezifikation](../NEXTJS_COMMERCE_SPEC.md)
