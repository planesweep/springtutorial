# React.js & Next.js Tutorial — Junior bis Mid-Level Developer

> **Ziel:** Du verstehst React.js von Grund auf und kannst mit Next.js eine produktionsfähige Web-App entwickeln und auf AWS deployen.
>
> **Projekt:** `lean-commerce` — ein echtes Next.js 14 Storefront mit GraphQL BFF, das du Schritt für Schritt nachvollziehst und erweiterst.

---

## Inhaltsverzeichnis

1. [Anforderungen](#1-anforderungen)
2. [Was ist React? — Das Konzept verstehen](#2-was-ist-react--das-konzept-verstehen)
3. [React Grundlagen: Components, JSX & Props](#3-react-grundlagen-components-jsx--props)
4. [React State & Events](#4-react-state--events)
5. [React Hooks im Detail](#5-react-hooks-im-detail)
6. [Was ist Next.js? — Das Framework verstehen](#6-was-ist-nextjs--das-framework-verstehen)
7. [Next.js App Router & Routing](#7-nextjs-app-router--routing)
8. [Rendering-Strategien: SSR, SSG, ISR, CSR](#8-rendering-strategien-ssr-ssg-isr-csr)
9. [Data Fetching & Server Actions](#9-data-fetching--server-actions)
10. [TypeScript & Tailwind CSS](#10-typescript--tailwind-css)
11. [State Management mit Zustand](#11-state-management-mit-zustand)
12. [GraphQL BFF mit GraphQL Yoga](#12-graphql-bff-mit-graphql-yoga)
13. [Testing mit Jest & React Testing Library](#13-testing-mit-jest--react-testing-library)
14. [AWS-Deployment — Produktiver Einsatz](#14-aws-deployment--produktiver-einsatz)
15. [Best Practices & Checkliste](#15-best-practices--checkliste)

---

## 1. Anforderungen

### Technische Voraussetzungen

| Kategorie | Tool | Version | Wozu? |
|-----------|------|---------|-------|
| **Runtime** | Node.js | **20 LTS** (Pflicht) | JavaScript-Laufzeitumgebung |
| **Paketmanager** | pnpm | **9.x** | Schneller Paketmanager mit Workspaces |
| **IDE** | VS Code | aktuell | Mit React/TS-Extensions |
| **Versionskontrolle** | Git | 2.x | Code-Management |
| **Container** | Docker Desktop | 24+ | Lokales Containerbuilding, AWS-Vorbereitung |
| **Cloud-CLI** | AWS CLI | v2 | AWS-Steuerung via Terminal |
| **AWS-Konto** | Free Tier | — | Deployment (ECS, ECR, CloudFront) |

#### VS Code Extensions (empfohlen)

```
ESLint                    — Code-Qualität
Prettier                  — Formatierung
TypeScript (built-in)     — Typ-Checking
Tailwind CSS IntelliSense — Klassen-Autocomplete
ES7+ React Snippets       — Code-Snippets
GitLens                   — Git-Integration
```

### Wissensvoraussetzungen

- **JavaScript ES6+:** Arrow Functions, Destructuring, Spread/Rest, Template Literals, Promises, `async/await`, Module (`import/export`)
- **HTML & CSS:** Grundstruktur, Box-Modell, Flexbox
- **Terminal:** Einfache Befehle (`cd`, `ls`, `npm/pnpm install`)

> **Du hast diese Grundlagen noch nicht sicher?** Geh zuerst durch [javascript.info](https://javascript.info) — insbesondere Kapitel 1–12. Das ist eine kostenlose, sehr gute Ressource.

### Wissensvoraussetzungen — JavaScript Schnellreferenz

Diese Muster wirst du im gesamten Tutorial brauchen:

```js
// Arrow Function
const greet = (name) => `Hallo, ${name}!`

// Destructuring (Objekt)
const { title, price } = product
// Destructuring (Array)
const [count, setCount] = useState(0)

// Spread Operator
const newCart = [...cart, newItem]
const updated = { ...product, price: 9.99 }

// Async/Await
async function fetchProducts() {
  const res = await fetch('https://fakestoreapi.com/products')
  const data = await res.json()
  return data
}

// Array-Methoden (extrem häufig in React)
products.map(p => <ProductCard key={p.id} {...p} />)
products.filter(p => p.price < 50)
products.find(p => p.id === id)
```

### Projekt klonen & starten

```bash
# 1. Repository klonen
git clone https://github.com/planesweep/springtutorial.git
cd springtutorial/lean-commerce

# 2. Node.js-Version prüfen
node --version   # sollte v20.x.x sein
pnpm --version   # sollte 9.x.x sein

# 3. Abhängigkeiten installieren
pnpm install

# 4. Umgebungsvariablen kopieren
cp apps/storefront/.env.example apps/storefront/.env.local

# 5. Entwicklungsserver starten
pnpm dev
# → http://localhost:3000
```

**Alternativ mit Docker (empfohlen):**

```bash
# Hot Reload via Docker Compose
docker compose up

# Logs streamen
docker compose logs -f storefront
```

> **Was passiert beim ersten Start?** Next.js compiliert alle Pages und zeigt dann die App unter `localhost:3000`. Du siehst Produkte (FakeStore API), eine Wetteranzeige (Open-Meteo) und die Suchfunktion.

---

## 2. Was ist React? — Das Konzept verstehen

### Das Problem ohne React

Stell dir vor, du baust eine Produktliste in klassischem HTML+JavaScript:

```html
<!-- klassisches DOM-Manipulation -->
<ul id="product-list"></ul>

<script>
  async function renderProducts() {
    const products = await fetchProducts()
    const list = document.getElementById('product-list')
    list.innerHTML = ''                          // alles löschen
    products.forEach(p => {
      const li = document.createElement('li')
      li.innerHTML = `<h3>${p.title}</h3><p>${p.price}</p>`
      list.appendChild(li)
    })
  }

  // Problem: wenn sich ein Preis ändert, muss die GANZE Liste neu gerendert werden
  // Problem: kein klarer Zusammenhang zwischen Daten und UI
  // Problem: kompliziertes State-Management bei vielen Interaktionen
</script>
```

**Probleme:**
- Daten und UI sind nicht synchronisiert — du musst manuell das DOM aktualisieren
- Schwer zu testen und wiederverwendbar
- Komplexität wächst exponentiell mit der App-Größe

### Reacts Lösung: Deklarative UI

React dreht das Konzept um: **Du beschreibst, wie die UI aussehen soll — React kümmert sich um die Aktualisierung.**

```jsx
// React: deklarativ
function ProductList({ products }) {
  return (
    <ul>
      {products.map(product => (
        <ProductItem key={product.id} product={product} />
      ))}
    </ul>
  )
}

function ProductItem({ product }) {
  return (
    <li>
      <h3>{product.title}</h3>
      <p>{product.price}</p>
    </li>
  )
}

// Wenn sich `products` ändert, aktualisiert React automatisch nur die betroffenen Teile des DOM
```

### Die 3 Kernprinzipien von React

```
┌─────────────────────────────────────────────────────────────┐
│  1. COMPONENTS          2. PROPS             3. STATE       │
│                                                             │
│  Baustein der UI        Daten von außen      Interne Daten  │
│  (wie Lego-Steine)      (wie Parameter)      (änderbar)     │
│                                                             │
│  function Card() {      <Card title="..." /> count = 0      │
│    return <div>…</div>  Props ↓               setCount(1)   │
│  }                      Card rendert         → re-render    │
└─────────────────────────────────────────────────────────────┘
```

### Virtual DOM — Warum React schnell ist

```
Daten ändern sich
        ↓
React erstellt neuen "Virtual DOM" (JS-Objekt, kein echtes DOM)
        ↓
React vergleicht neuen und alten Virtual DOM ("Diffing")
        ↓
React aktualisiert nur die UNTERSCHIEDE im echten DOM ("Reconciliation")
        ↓
Browser rendert minimale Änderungen → schnell!
```

> **Merke:** Du schreibst nie `document.getElementById` in React. React verwaltet das DOM für dich.

---

## 3. React Grundlagen: Components, JSX & Props

### Was ist JSX?

JSX ist eine Syntax-Erweiterung für JavaScript, die wie HTML aussieht, aber JavaScript ist:

```jsx
// JSX — sieht aus wie HTML, ist aber JavaScript
const element = <h1 className="title">Hallo Welt</h1>

// Was der Compiler daraus macht (musst du nicht tippen!):
const element = React.createElement('h1', { className: 'title' }, 'Hallo Welt')
```

**Wichtige JSX-Regeln:**

```jsx
// ✅ Ein Root-Element (oder Fragment)
return (
  <div>
    <h1>Titel</h1>
    <p>Text</p>
  </div>
)

// ✅ Fragment: kein extra div im DOM
return (
  <>
    <h1>Titel</h1>
    <p>Text</p>
  </>
)

// ✅ className statt class (class ist JS-Keyword)
<div className="container">

// ✅ JavaScript-Ausdrücke in {}
<p>{product.title}</p>
<p>{2 + 2}</p>
<p>{isLoggedIn ? 'Angemeldet' : 'Gast'}</p>

// ✅ Selbstschließende Tags
<img src={url} alt="Bild" />
<br />

// ❌ Funktionen und Objekte direkt rendern
<p>{() => 'text'}</p>       // Fehler: keine Funktion
<p>{{ key: 'value' }}</p>   // Fehler: kein Objekt
```

### Functional Components

Jede React-Komponente ist eine JavaScript-Funktion, die JSX zurückgibt:

```tsx
// Minimal-Component
function Greeting() {
  return <h1>Hallo!</h1>
}

// Mit TypeScript (empfohlen in lean-commerce)
function Greeting(): JSX.Element {
  return <h1>Hallo!</h1>
}

// Arrow Function (beide Stile sind OK)
const Greeting = () => <h1>Hallo!</h1>
```

### Props — Daten von außen

Props (Properties) sind wie Parameter für Komponenten:

```tsx
// Komponente mit Props definieren
interface ProductCardProps {
  id: string
  title: string
  price: number
  image: string
  category: string
}

function ProductCard({ id, title, price, image, category }: ProductCardProps) {
  return (
    <div className="card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p className="category">{category}</p>
      <span className="price">€{price.toFixed(2)}</span>
    </div>
  )
}

// Komponente verwenden (Props übergeben)
function ProductList() {
  return (
    <div>
      <ProductCard
        id="1"
        title="Laptop"
        price={999.99}
        image="/laptop.jpg"
        category="Electronics"
      />
      <ProductCard
        id="2"
        title="T-Shirt"
        price={29.99}
        image="/shirt.jpg"
        category="Clothing"
      />
    </div>
  )
}
```

**Sieh dir das in lean-commerce an:** `lean-commerce/apps/storefront/components/product/ProductCard.tsx`

Die echte `ProductCard`-Komponente hat genau dieses Muster — Props-Interface, Destructuring, JSX.

### Children Props

```tsx
// Card-Component die beliebigen Inhalt aufnimmt
interface CardProps {
  title: string
  children: React.ReactNode  // alles was JSX sein kann
}

function Card({ title, children }: CardProps) {
  return (
    <div className="border rounded-xl p-4">
      <h2 className="font-bold mb-2">{title}</h2>
      {children}
    </div>
  )
}

// Verwendung
<Card title="Produkte">
  <p>Hier kommen die Produkte rein</p>
  <ProductGrid />
</Card>
```

### Übung 1 — Baue eine `PriceBadge`-Komponente

```tsx
// Ziel: Eine Komponente die Preise anzeigt
// - Props: price (number), currency (string, default: "€")
// - Wenn price > 100: roter Hintergrund
// - Wenn price <= 100: grüner Hintergrund

// Starter:
interface PriceBadgeProps {
  price: number
  currency?: string  // ? = optional
}

function PriceBadge({ price, currency = '€' }: PriceBadgeProps) {
  // TODO: deine Lösung hier
}
```

<details>
<summary>Lösung anzeigen</summary>

```tsx
function PriceBadge({ price, currency = '€' }: PriceBadgeProps) {
  const isExpensive = price > 100
  return (
    <span
      className={`px-2 py-1 rounded-full text-sm font-bold ${
        isExpensive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      }`}
    >
      {currency}{price.toFixed(2)}
    </span>
  )
}
```

</details>

---

## 4. React State & Events

### Was ist State?

Props kommen von außen und sind unveränderlich (read-only). State ist der **interne, veränderliche Zustand** einer Komponente.

```tsx
// useState Hook — der wichtigste Hook
import { useState } from 'react'

function Counter() {
  // [aktueller Wert, Funktion zum Ändern]
  const [count, setCount] = useState(0)  // 0 = Initialwert

  return (
    <div>
      <p>Aktueller Stand: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}
```

**Wichtige Regel:** **State niemals direkt mutieren!**

```tsx
// ❌ FALSCH — React bemerkt die Änderung nicht
count = count + 1

// ✅ RICHTIG — immer über die Setter-Funktion
setCount(count + 1)

// ❌ FALSCH bei Objekten
const [user, setUser] = useState({ name: 'Anna', age: 25 })
user.age = 26  // mutiert direkt!

// ✅ RICHTIG — neues Objekt erstellen
setUser({ ...user, age: 26 })

// ❌ FALSCH bei Arrays
cart.push(newItem)

// ✅ RICHTIG — neues Array erstellen
setCart([...cart, newItem])
```

### Event Handling

```tsx
function SearchBar() {
  const [query, setQuery] = useState('')

  // Event Handler als Funktion
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()  // verhindert Seiten-Reload
    console.log('Suche nach:', query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}              // controlled input: Wert kommt von State
        onChange={handleChange}
        placeholder="Produkt suchen..."
      />
      <button type="submit">Suchen</button>
    </form>
  )
}
```

**Sieh dir das in lean-commerce an:** `lean-commerce/apps/storefront/components/search/SearchBar.tsx`

### Komplexerer State: Warenkorb-Logik

```tsx
interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
}

function Cart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        // Menge erhöhen
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div>
      {items.map(item => (
        <div key={item.id} className="flex justify-between">
          <span>{item.title} × {item.quantity}</span>
          <button onClick={() => removeItem(item.id)}>Entfernen</button>
        </div>
      ))}
      <div className="font-bold">Gesamt: €{total.toFixed(2)}</div>
    </div>
  )
}
```

> **Beachte:** `setItems(prev => ...)` — der Setter erhält den **vorherigen State** als Argument. Das ist sicherer als `setItems([...items, ...])`, weil React State-Updates manchmal batchet.

### Bedingtes Rendering

```tsx
function ProductStatus({ inStock, loading }: { inStock: boolean; loading: boolean }) {
  // 1. Early return für Ladezustand
  if (loading) return <div className="animate-pulse h-4 bg-gray-200 rounded" />

  // 2. Ternary Operator
  return (
    <span className={inStock ? 'text-green-600' : 'text-red-600'}>
      {inStock ? 'Auf Lager' : 'Nicht verfügbar'}
    </span>
  )
}

// 3. && Short-Circuit (nur rendern wenn true)
function ProductCard({ product, isNew }) {
  return (
    <div>
      {isNew && <span className="badge">NEU</span>}
      <h3>{product.title}</h3>
    </div>
  )
}
```

### Übung 2 — Interaktive Produktliste

```tsx
// Ziel: Eine Liste mit "Zur Wunschliste"-Button
// - Anfangs sind alle Produkte nicht in der Wunschliste
// - Klick auf Button: Produkt hinzufügen/entfernen
// - Zähler oben: "X Produkte auf Wunschliste"

const PRODUCTS = [
  { id: '1', title: 'Laptop', price: 999 },
  { id: '2', title: 'T-Shirt', price: 29 },
  { id: '3', title: 'Kopfhörer', price: 149 },
]

function WishlistDemo() {
  // TODO: State für Wunschliste (Array von IDs)
  // TODO: addToWishlist / removeFromWishlist Funktionen
  // TODO: isWished(id) Hilfsfunktion
}
```

---

## 5. React Hooks im Detail

Hooks sind spezielle Funktionen, die React-Features in Funktionskomponenten einbinden. **Hooks beginnen immer mit `use`.**

### Hooks-Regeln (WICHTIG)

```
1. Nur auf der TOP-EBENE einer Komponente aufrufen
   — nie in Schleifen, Bedingungen oder verschachtelten Funktionen

2. Nur in React-Funktionskomponenten oder Custom Hooks aufrufen
   — nie in normalen JS-Funktionen
```

```tsx
// ❌ FALSCH — Hook in Bedingung
function Bad() {
  if (someCondition) {
    const [count, setCount] = useState(0)  // Fehler!
  }
}

// ✅ RICHTIG — Hook immer auf Top-Level
function Good() {
  const [count, setCount] = useState(0)  // immer, unabhängig von Bedingungen
  if (someCondition) {
    // benutze count hier
  }
}
```

### useEffect — Seiteneffekte

`useEffect` führt Code aus, der **nach dem Render** stattfindet: API-Calls, DOM-Manipulation, Subscriptions.

```tsx
import { useState, useEffect } from 'react'

function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 1. Effekt ausführen wenn `id` sich ändert
    let cancelled = false  // verhindert State-Update bei unmounted Component

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`https://fakestoreapi.com/products/${id}`)
        if (!res.ok) throw new Error('Produkt nicht gefunden')
        const data = await res.json()
        if (!cancelled) setProduct(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    // 2. Cleanup-Funktion (wird bei Unmount oder vor dem nächsten Effekt ausgeführt)
    return () => { cancelled = true }

  }, [id])  // 3. Dependency Array: Effekt läuft neu wenn `id` sich ändert

  if (loading) return <div>Laden...</div>
  if (error) return <div>Fehler: {error}</div>
  return <div>{product?.title}</div>
}
```

**Dependency Array — die 3 Varianten:**

```tsx
useEffect(() => {
  // Läuft bei JEDEM Render
})

useEffect(() => {
  // Läuft nur beim ersten Render (wie componentDidMount)
}, [])

useEffect(() => {
  // Läuft beim ersten Render UND wenn sich `value` ändert
}, [value])
```

> **Tipp:** In Next.js Server Components brauchst du `useEffect` für Datenfetching fast nie — Server Components können direkt `await` nutzen. `useEffect` ist für Client Components nötig.

### useContext — Daten durch den Component-Tree

Context löst das "Prop Drilling"-Problem: Daten, die viele Ebenen tief gebraucht werden.

```tsx
import { createContext, useContext, useState } from 'react'

// 1. Context erstellen
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

// 2. Provider — gibt Context-Daten an alle Kind-Komponenten
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 3. Consumer — zugreifen auf Context-Daten
function ThemeToggle() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('ThemeToggle muss in ThemeProvider sein')

  return (
    <button onClick={ctx.toggleTheme}>
      Jetzt: {ctx.theme === 'light' ? '☀️ Hell' : '🌙 Dunkel'}
    </button>
  )
}
```

### useMemo & useCallback — Performance-Optimierung

```tsx
import { useMemo, useCallback } from 'react'

function ProductGrid({ products, filterCategory }) {
  // useMemo: berechneten Wert cachen
  // Wird nur neu berechnet wenn products oder filterCategory sich ändern
  const filtered = useMemo(() => {
    return products.filter(p =>
      filterCategory ? p.category === filterCategory : true
    )
  }, [products, filterCategory])

  // useCallback: Funktion cachen
  // Wird nur neu erstellt wenn products sich ändert
  const handleSort = useCallback((key: string) => {
    return [...products].sort((a, b) => a[key] > b[key] ? 1 : -1)
  }, [products])

  return (
    <div className="grid grid-cols-4 gap-4">
      {filtered.map(p => <ProductCard key={p.id} {...p} />)}
    </div>
  )
}
```

> **Wann benutzen?** Nur wenn du ein Performance-Problem identifiziert hast. Premature optimization ist teuer. Starte ohne, messe, optimiere dann.

### Custom Hooks — Logik wiederverwenden

Custom Hooks sind einfach Funktionen, die andere Hooks verwenden:

```tsx
// Custom Hook für API-Fetching (wiederverwendbar)
function useProducts(category?: string) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = category
      ? `https://fakestoreapi.com/products/category/${category}`
      : 'https://fakestoreapi.com/products'

    fetch(url)
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [category])

  return { products, loading, error }
}

// Verwendung in mehreren Komponenten
function ElectronicsPage() {
  const { products, loading } = useProducts('electronics')
  if (loading) return <Spinner />
  return <ProductGrid products={products} />
}

function AllProductsPage() {
  const { products, loading } = useProducts()  // kein Filter
  if (loading) return <Spinner />
  return <ProductGrid products={products} />
}
```

---

## 6. Was ist Next.js? — Das Framework verstehen

### React allein vs. Next.js

```
React allein (Vite/CRA):          Next.js:
━━━━━━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Einfach zu starten             ✅ File-basiertes Routing
✅ Flexible Architektur           ✅ Server-Side Rendering
❌ Kein Routing eingebaut         ✅ Static Site Generation
❌ Kein SSR/SSG                   ✅ API Routes (Backend im gleichen Projekt)
❌ SEO schwierig                  ✅ Image Optimization
❌ Code-Splitting manuell         ✅ Code-Splitting automatisch
❌ Produktions-Setup komplex      ✅ Optimierter Build
                                  ✅ SEO-freundlich
```

Next.js ist das **Produktions-Framework für React**. Es löst alle Probleme, die bei größeren React-Apps auftreten.

### App Router vs. Pages Router

Next.js hat zwei Router-Varianten. **lean-commerce verwendet den App Router (Next.js 13+).**

```
Pages Router (alt):          App Router (neu, empfohlen):
pages/                        app/
  index.js          →           page.tsx          (Seite)
  products.js       →           products/
  products/[id].js  →             page.tsx
  _app.js           →           layout.tsx        (Layout)
  _document.js      →           (automatisch)
```

Der App Router nutzt React Server Components und ist leistungsfähiger.

### Verzeichnisstruktur von lean-commerce

```
lean-commerce/apps/storefront/
├── app/                     ← App Router Root
│   ├── layout.tsx           ← Root Layout (HTML, Body, Providers)
│   ├── page.tsx             ← Homepage /
│   ├── globals.css          ← Globale Styles
│   └── (shop)/              ← Route Group (kein URL-Segment)
│       ├── layout.tsx       ← Shop-Layout (Navigation, Footer)
│       ├── products/
│       │   ├── page.tsx     ← /products
│       │   ├── loading.tsx  ← Ladeanimation für /products
│       │   └── [id]/
│       │       └── page.tsx ← /products/123
│       ├── cart/
│       │   └── page.tsx     ← /cart
│       └── search/
│           └── page.tsx     ← /search
├── components/              ← Wiederverwendbare UI-Komponenten
│   ├── product/
│   ├── cart/
│   └── weather/
├── lib/                     ← Utilities, Datenfetching, Store
│   ├── graphql/             ← GraphQL Schema + Resolvers
│   ├── store/               ← Zustand State Management
│   └── products.ts
└── public/                  ← Statische Dateien (Bilder, robots.txt)
```

---

## 7. Next.js App Router & Routing

### Spezielle Dateien im App Router

| Datei | Zweck |
|-------|-------|
| `page.tsx` | Rendert die Route als Seite |
| `layout.tsx` | Wrapper für mehrere Seiten (Sidebar, Nav) |
| `loading.tsx` | Automatischer Suspense-Fallback |
| `error.tsx` | Fehlerbehandlung für die Route |
| `not-found.tsx` | 404-Seite |
| `route.ts` | API Endpoint (kein React) |

### layout.tsx — Das Root-Layout

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Lean Commerce',  // Tab-Titel
    default: 'Lean Commerce',
  },
  description: 'Next.js Demo Shop',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

### page.tsx — Eine Route

```tsx
// app/(shop)/products/page.tsx
import type { Metadata } from 'next'

// Metadaten für SEO — wird im <head> gerendert
export const metadata: Metadata = {
  title: 'Alle Produkte',
  description: 'Unser gesamtes Sortiment'
}

// Async Server Component — kann direkt auf Daten zugreifen
export default async function ProductsPage() {
  const products = await fetchProducts()  // direkt awaiten, kein useState nötig!

  return (
    <main>
      <h1>Alle Produkte</h1>
      <ProductGrid products={products} />
    </main>
  )
}
```

### Dynamische Routen `[id]`

```tsx
// app/(shop)/products/[id]/page.tsx

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | undefined }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await fetchProduct(params.id)

  if (!product) {
    notFound()  // rendert not-found.tsx (404)
  }

  return (
    <main>
      <h1>{product.title}</h1>
      <p>€{product.price}</p>
    </main>
  )
}

// Optional: Statische Parameter für SSG generieren
export async function generateStaticParams() {
  const products = await fetchAllProducts()
  return products.map(p => ({ id: String(p.id) }))
}
```

### loading.tsx — Automatisches Skeleton

```tsx
// app/(shop)/products/loading.tsx
// Wird automatisch als Suspense-Fallback eingesetzt!

export default function ProductsLoading() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-xl mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-1" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}
```

### error.tsx — Fehlerbehandlung

```tsx
// app/(shop)/products/error.tsx
'use client'  // error.tsx muss Client Component sein!

export default function ProductsError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-bold text-red-600 mb-2">Etwas ist schiefgelaufen</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}  // versucht, die Route neu zu rendern
        className="btn-primary"
      >
        Nochmal versuchen
      </button>
    </div>
  )
}
```

### Navigation — Link Component & useRouter

```tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Deklarative Navigation (Server + Client Components)
function ProductCard({ id, title }) {
  return (
    <Link href={`/products/${id}`} className="hover:underline">
      {title}
    </Link>
  )
}

// Programmatische Navigation (nur Client Components)
'use client'
function SearchForm() {
  const router = useRouter()

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }
}
```

### Route Groups `(gruppe)`

```
app/
├── (shop)/          ← Gruppe: kein URL-Segment, eigenes Layout
│   ├── layout.tsx   ← Gilt nur für (shop)-Routen
│   ├── products/
│   └── cart/
├── (auth)/          ← Gruppe für Auth-Routen
│   ├── login/
│   └── register/
└── layout.tsx       ← Root Layout (gilt für alle)
```

Route Groups ermöglichen **mehrere Layouts** ohne URL-Veränderung.

---

## 8. Rendering-Strategien: SSR, SSG, ISR, CSR

Das ist einer der wichtigsten Unterschiede zu reinem React. Next.js kann für jede Route eine andere Strategie verwenden.

```
┌──────────────────────────────────────────────────────────────────────┐
│  CSR  Client-Side Rendering                                          │
│  HTML kommt leer, JS holt Daten im Browser                          │
│  → Schlechtes SEO, langsames FCP, aber nach Load sehr interaktiv   │
│  Wann: Dashboard hinter Login, stark personalisierte Inhalte        │
├──────────────────────────────────────────────────────────────────────┤
│  SSR  Server-Side Rendering                                          │
│  HTML wird bei jedem Request auf dem Server generiert               │
│  → Gutes SEO, immer frische Daten, aber jeder Request kostet CPU   │
│  Wann: Personalisierte Seiten, häufig wechselnde Daten             │
├──────────────────────────────────────────────────────────────────────┤
│  SSG  Static Site Generation                                         │
│  HTML wird beim Build generiert, CDN-auslieferbar                   │
│  → Schnellstes Laden, günstiger Hosting, aber Daten statisch       │
│  Wann: Blog, Marketing-Seiten, Dokumentation                        │
├──────────────────────────────────────────────────────────────────────┤
│  ISR  Incremental Static Regeneration  ← lean-commerce nutzt das!  │
│  SSG + automatische Revalidierung nach X Sekunden                  │
│  → Schnell wie SSG, frisch wie SSR                                  │
│  Wann: Produkt-Seiten, Preislisten, Shops                           │
└──────────────────────────────────────────────────────────────────────┘
```

### ISR in der Praxis (lean-commerce Homepage)

```tsx
// app/page.tsx — Homepage mit ISR
// Sieh dir die echte Datei an: lean-commerce/apps/storefront/app/page.tsx

// Diese Zeile steuert ISR: Seite wird alle 60 Sekunden regeneriert
export const revalidate = 60

export default async function HomePage() {
  return (
    <main>
      {/* Daten werden beim Build + alle 60s neu gefetcht */}
      <FeaturedProducts />
    </main>
  )
}
```

### On-Demand Revalidation (Webhooks)

```tsx
// app/api/revalidate/route.ts
// Externe Systeme können diese URL aufrufen um Seiten zu invalidieren
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { secret, path } = await request.json()

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidatePath(path)  // z.B. '/products'
  return NextResponse.json({ revalidated: true })
}
```

### Server Components vs. Client Components

Das ist das Herzstück des App Routers:

```tsx
// SERVER COMPONENT (Default!)
// - Läuft nur auf dem Server
// - Kann async/await verwenden
// - Keine React Hooks (useState, useEffect etc.)
// - Kann direkt auf Datenbanken, Dateisystem zugreifen
// - Wird NICHT ins JS-Bundle für den Browser gesendet → kleiner Bundle!

async function ProductList() {
  const products = await db.products.findAll()  // direkte DB-Abfrage möglich!
  return <ul>{products.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}

// CLIENT COMPONENT
// - Wird mit 'use client' markiert
// - Läuft im Browser UND beim ersten Render auf dem Server
// - Kann React Hooks verwenden
// - Hat Zugriff auf Browser-APIs (localStorage, window, etc.)

'use client'

function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false)

  return (
    <button onClick={() => setAdded(true)}>
      {added ? '✅ Hinzugefügt' : 'In den Warenkorb'}
    </button>
  )
}
```

**Die goldene Regel:** Default Server Component. Erst `'use client'` wenn du es brauchst (Interaktivität, Browser-APIs, Hooks).

```
Was macht die Komponente?
├── Daten laden, Template rendern → Server Component (kein Direktiv nötig)
├── onClick, onChange, State     → 'use client'
├── useEffect, useRef            → 'use client'
├── localStorage, window         → 'use client'
└── Zustand-Hook                 → 'use client'
```

---

## 9. Data Fetching & Server Actions

### Datenfetching in Server Components

```tsx
// Der einfachste Weg: async Server Component
async function ProductsPage() {
  // Parallele Fetches mit Promise.all
  const [products, categories] = await Promise.all([
    fetch('https://fakestoreapi.com/products', {
      next: { revalidate: 300 }  // Next.js Cache: 5 Minuten
    }).then(r => r.json()),
    fetch('https://fakestoreapi.com/products/categories').then(r => r.json()),
  ])

  return <ProductGrid products={products} categories={categories} />
}
```

### Next.js Fetch-Cache

```tsx
// 1. Cache für 1 Stunde
const data = await fetch(url, { next: { revalidate: 3600 } })

// 2. Nie cachen (wie SSR bei jedem Request)
const data = await fetch(url, { cache: 'no-store' })

// 3. Immer cachen (wie SSG, niemals revalidieren)
const data = await fetch(url, { cache: 'force-cache' })

// 4. Tag-basierte Invalidierung
const data = await fetch(url, { next: { tags: ['products'] } })
// Später: revalidateTag('products')
```

### API Routes — Backend im gleichen Projekt

```tsx
// app/api/graphql/route.ts
// → erreichbar unter: /api/graphql

import { createYoga } from 'graphql-yoga'
import { schema } from '@/lib/graphql/schema'

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response, Request, ReadableStream },
})

export const GET = handleRequest
export const POST = handleRequest
```

**Eigene API Route erstellen:**

```tsx
// app/api/products/route.ts
import { NextResponse } from 'next/server'

// GET /api/products
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const url = category
    ? `https://fakestoreapi.com/products/category/${category}`
    : 'https://fakestoreapi.com/products'

  const products = await fetch(url).then(r => r.json())
  return NextResponse.json(products)
}

// POST /api/products
export async function POST(request: Request) {
  const body = await request.json()
  // ... Produkt speichern
  return NextResponse.json({ id: '123' }, { status: 201 })
}
```

### Server Actions — Formulare ohne API

Server Actions sind **serverseitige Funktionen**, die direkt aus Client Components aufgerufen werden können:

```tsx
// lib/actions/checkout.ts
'use server'  // Markiert alle Funktionen als Server Actions

import { revalidatePath } from 'next/cache'

export async function addToCart(formData: FormData) {
  const productId = formData.get('productId') as string
  const quantity = Number(formData.get('quantity'))

  // Direkt Datenbankzugriff, externe API-Call, etc.
  await db.cart.upsert({ productId, quantity })

  revalidatePath('/cart')  // Cache für /cart invalidieren
}

// Verwendung in einer Client Component
'use client'
import { addToCart } from '@/lib/actions/checkout'

function AddToCartForm({ productId }) {
  return (
    <form action={addToCart}>
      <input type="hidden" name="productId" value={productId} />
      <input type="number" name="quantity" defaultValue={1} />
      <button type="submit">In den Warenkorb</button>
    </form>
  )
}
```

**Sieh dir das in lean-commerce an:** `lean-commerce/apps/storefront/lib/actions/checkout.ts`

### Suspense & Streaming

```tsx
import { Suspense } from 'react'

// Mehrere Suspense-Grenzen → paralleles Streaming
export default function Page() {
  return (
    <main>
      {/* Sofort sichtbar */}
      <Hero />

      {/* Streamt separat, wenn Daten fertig */}
      <Suspense fallback={<WeatherSkeleton />}>
        <WeatherWidget />  {/* async Server Component */}
      </Suspense>

      {/* Streamt unabhängig */}
      <Suspense fallback={<ProductsSkeleton />}>
        <FeaturedProducts />  {/* async Server Component */}
      </Suspense>
    </main>
  )
}
```

---

## 10. TypeScript & Tailwind CSS

### TypeScript in React

TypeScript ist **Pflicht** in lean-commerce. Es macht deinen Code sicherer und die IDE hilft dir besser.

```tsx
// Interface für Props
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'  // Union Type
  disabled?: boolean
  children?: React.ReactNode
}

// Generische Types
interface ApiResponse<T> {
  data: T
  error: string | null
  loading: boolean
}

// Verwendung
function useApi<T>(url: string): ApiResponse<T> {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null as T,
    error: null,
    loading: true,
  })
  // ...
  return state
}

const { data } = useApi<Product[]>('/api/products')
//          ↑ TypeScript weiß: data ist Product[]

// Type Assertions
const price = (event.target as HTMLInputElement).value

// Non-null assertion (nur wenn du sicher bist!)
const el = document.getElementById('root')!
```

### Tailwind CSS — Utility-First

Tailwind bietet vordefinierte CSS-Klassen, die direkt im HTML stehen:

```tsx
// Klassisches CSS:
// .card { background: white; border-radius: 8px; padding: 16px; }

// Tailwind:
<div className="bg-white rounded-xl p-4">

// Häufigste Muster:

// Layout
<div className="flex items-center justify-between gap-4">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

// Farben
<div className="text-gray-900 bg-blue-50 border border-blue-200">

// Spacing
<div className="mt-4 mb-2 px-6 py-3">   // margin-top, margin-bottom, padding-x, padding-y

// Responsive (mobile-first)
<div className="text-sm md:text-base lg:text-lg">
//              ↑ default  ↑ ab 768px    ↑ ab 1024px

// Hover / Focus
<button className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">

// Conditional Classes (clsx oder Template Literals)
import { clsx } from 'clsx'

<button
  className={clsx(
    'px-4 py-2 rounded-lg font-medium',
    variant === 'primary' && 'bg-blue-600 text-white',
    variant === 'secondary' && 'bg-gray-100 text-gray-700',
    disabled && 'opacity-50 cursor-not-allowed',
  )}
>
```

**Tailwind-Konfiguration in lean-commerce:** `lean-commerce/apps/storefront/tailwind.config.ts`

---

## 11. State Management mit Zustand

Bei größeren Apps wird Context zu komplex. **Zustand** ist eine minimalistische State-Management-Bibliothek — kein Redux-Boilerplate.

### Zustand-Store (lean-commerce Warenkorb)

Sieh dir die echte Implementierung an: `lean-commerce/apps/storefront/lib/store/cart.ts`

```tsx
// lib/store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface CartLine {
  productId: string
  title: string
  price: number
  image: string
  quantity: number
}

interface CartStore {
  lines: CartLine[]
  addLine: (item: Omit<CartLine, 'quantity'>) => void
  removeLine: (productId: string) => void
  totalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(            // State in localStorage speichern
    immer((set, get) => ({   // Immer: mutierende Syntax erlaubt
      lines: [],

      addLine: (item) => set(state => {
        const existing = state.lines.find(l => l.productId === item.productId)
        if (existing) {
          existing.quantity += 1      // Immer macht das "mutable" sicher
        } else {
          state.lines.push({ ...item, quantity: 1 })
        }
      }),

      removeLine: (productId) => set(state => {
        state.lines = state.lines.filter(l => l.productId !== productId)
      }),

      totalItems: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    })),
    { name: 'lean-commerce-cart' }
  )
)

// Verwendung in Client Components:
'use client'
function CartIcon() {
  const count = useCartStore(state => state.totalItems())
  return <span>{count}</span>
}
```

**Warum Zustand statt Context?**
- Kein Provider-Wrapping nötig
- Selektives Re-Rendering (nur Komponenten mit dem verwendeten Slice re-rendern)
- DevTools-Integration
- Middleware-System (persist, immer, devtools)

---

## 12. GraphQL BFF mit GraphQL Yoga

lean-commerce hat ein **Backend for Frontend (BFF)**: ein GraphQL-Layer, der externe REST-APIs zusammenfasst und an das Frontend gibt.

```
Browser → Next.js Server Component → GraphQL Yoga (in /api/graphql)
                                          ↓
                              ┌───────────┼───────────┐
                         FakeStore   DummyJSON   Open-Meteo
                          (REST)      (REST)      (REST)
```

### GraphQL Schema (lean-commerce)

```ts
// lib/graphql/schema/typeDefs.ts
const typeDefs = `
  type Product {
    id: ID!
    title: String!
    price: Float!
    image: String!
    category: String!
    rating: Rating!
  }

  type Rating {
    rate: Float!
    count: Int!
  }

  type Query {
    products(limit: Int): [Product!]!
    product(id: ID!): Product
    searchProducts(q: String!): [Product!]!
  }

  type Mutation {
    addToCart(productId: ID!, quantity: Int!): CartLine!
  }
`
```

### GraphQL Query im Frontend

```tsx
// In einem Server Component: direkt den GraphQL-Endpunkt aufrufen
async function fetchFeaturedProducts() {
  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query FeaturedProducts {
          products(limit: 4) {
            id
            title
            price
            image
            category
            rating { rate }
          }
        }
      `
    }),
    next: { revalidate: 300 },  // 5 Minuten cachen
  })

  const { data } = await res.json()
  return data.products
}
```

### Übung 3 — Neue GraphQL Query hinzufügen

```
Aufgabe: Füge eine neue Query `productsByCategory(category: String!): [Product!]!` hinzu

1. typeDefs.ts: neue Query definieren
2. query.ts: Resolver implementieren (nutze DummyJSON /products/category/:cat)
3. Neue Page /products/category/[slug]/page.tsx erstellen
4. Die neue Query von der Page aus aufrufen
```

---

## 13. Testing mit Jest & React Testing Library

### Warum testen?

```
Unit Tests:        Einzelne Funktionen, Hooks, Utils
Component Tests:   React-Komponenten isoliert testen
Integration Tests: Mehrere Komponenten zusammen
E2E Tests:         Echter Browser (Playwright, Cypress)
```

### Setup in lean-commerce

`lean-commerce/apps/storefront/jest.config.js` ist bereits konfiguriert.

### Unit Test — Hilfsfunktion

```ts
// lib/products.ts
export function formatPrice(price: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(price)
}

// __tests__/products.test.ts
import { formatPrice } from '@/lib/products'

describe('formatPrice', () => {
  it('formatiert Euro korrekt', () => {
    expect(formatPrice(9.99)).toBe('9,99 €')
  })

  it('formatiert USD korrekt', () => {
    expect(formatPrice(9.99, 'USD')).toBe('9,99 $')
  })

  it('rundet korrekt', () => {
    expect(formatPrice(9.999)).toBe('10,00 €')
  })
})
```

### Component Test

```tsx
// __tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/product/ProductCard'

const mockProduct = {
  id: '1',
  title: 'Test Laptop',
  price: 999.99,
  image: '/test.jpg',
  category: 'electronics',
  rating: { rate: 4.5, count: 100 },
}

describe('ProductCard', () => {
  it('zeigt Produkttitel an', () => {
    render(<ProductCard {...mockProduct} />)
    expect(screen.getByText('Test Laptop')).toBeInTheDocument()
  })

  it('formatiert Preis korrekt', () => {
    render(<ProductCard {...mockProduct} />)
    expect(screen.getByText('€999.99')).toBeInTheDocument()
  })

  it('ist ein Link zur Produktdetailseite', () => {
    render(<ProductCard {...mockProduct} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/products/1')
  })
})
```

### Test für Zustand-Store

```ts
// __tests__/cart.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCartStore } from '@/lib/store/cart'

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: [] })  // Store zurücksetzen
  })

  it('fügt Produkt zum Warenkorb hinzu', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addLine({
        productId: '1',
        title: 'Laptop',
        price: 999,
        image: '/test.jpg',
      })
    })

    expect(result.current.lines).toHaveLength(1)
    expect(result.current.lines[0].quantity).toBe(1)
  })

  it('erhöht Menge bei doppeltem Hinzufügen', () => {
    const { result } = renderHook(() => useCartStore())
    const item = { productId: '1', title: 'Laptop', price: 999, image: '/test.jpg' }

    act(() => {
      result.current.addLine(item)
      result.current.addLine(item)
    })

    expect(result.current.lines).toHaveLength(1)
    expect(result.current.lines[0].quantity).toBe(2)
  })
})
```

### Tests ausführen

```bash
# Im lean-commerce Verzeichnis
pnpm test

# Watch-Mode (re-runs bei Änderungen)
pnpm test --watch

# Coverage-Report
pnpm test --coverage
```

---

## 14. AWS-Deployment — Produktiver Einsatz

### Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser / Mobile                                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│  Amazon CloudFront (CDN)                                        │
│  • Statische Assets zwischenspeichern                          │
│  • SSR-Antworten cachen (Cache-Control Headers)                │
│  • WAF — Web Application Firewall                              │
│  • Geo-Routing, Failover                                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  Application Load Balancer (ALB)                                │
│  • HTTPS-Terminierung                                          │
│  • Health Checks auf /api/health                               │
│  • Routing zu ECS Target Group                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  Amazon ECS Fargate (Container-Service)                         │
│  • Next.js Docker-Container                                    │
│  • Auto Scaling (min 1, max 10 Tasks)                         │
│  • Kein Server-Management nötig (Serverless-Container)        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Container-Images aus
┌──────────────────────────▼──────────────────────────────────────┐
│  Amazon ECR (Elastic Container Registry)                        │
│  Private Docker Registry                                        │
└─────────────────────────────────────────────────────────────────┘
                  │              │              │
        ┌─────────▼──────────────▼──────────────▼─────────┐
        │  AWS Secrets Manager  CloudWatch    S3 (Static)  │
        │  ENV-Variablen        Logs/Metrics  Assets       │
        └──────────────────────────────────────────────────┘
```

### Option A: AWS Amplify (einfachster Einstieg)

Amplify ist die einfachste Option für Next.js auf AWS — perfekt zum Starten:

```bash
# 1. Amplify CLI installieren
npm install -g @aws-amplify/cli

# 2. Amplify konfigurieren (einmalig)
amplify configure
# → AWS Credentials eingeben, Region wählen

# 3. Amplify in deinem Next.js-Projekt initialisieren
cd lean-commerce/apps/storefront
amplify init
# → Projekt-Name eingeben, Environment wählen (dev/prod)

# 4. Hosting hinzufügen
amplify add hosting
# → Wähle: Amazon CloudFront and S3

# 5. Deployen
amplify publish
# → Build + Deploy in einem Schritt
```

**Amplify Console (GitHub-Integration):**
1. In der AWS Console → Amplify → "New app" → "Host web app"
2. GitHub-Repo verbinden → Branch auswählen (main)
3. Build-Settings werden automatisch erkannt
4. Jeder Push auf main deployt automatisch

> **Anforderungen für Amplify:** `next.config.mjs` benötigt `output: 'standalone'` NICHT für Amplify. Amplify unterstützt Next.js nativ.

### Option B: Docker → ECR → ECS Fargate (Produktionsstandard)

#### Schritt 1: Dockerfile prüfen

Das `Dockerfile` in lean-commerce ist bereits für Produktion optimiert:

```dockerfile
# lean-commerce/Dockerfile
FROM node:20-alpine AS base

# Abhängigkeiten installieren
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/storefront/package.json apps/storefront/
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Production Image (minimal)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Non-root user für Sicherheit
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

#### Schritt 2: ECR Repository erstellen & Image pushen

```bash
# Variablen setzen
AWS_REGION="eu-central-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="lean-commerce-storefront"

# ECR Repository erstellen
aws ecr create-repository \
  --repository-name $ECR_REPO \
  --region $AWS_REGION

# Docker bei ECR anmelden
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS \
  --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Image bauen und taggen
docker build -t $ECR_REPO .
docker tag $ECR_REPO:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest

# Image pushen
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest

echo "Image URI:"
echo "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest"
```

#### Schritt 3: ECS Fargate Task Definition

```json
{
  "family": "lean-commerce-storefront",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "storefront",
      "image": "ACCOUNT.dkr.ecr.eu-central-1.amazonaws.com/lean-commerce-storefront:latest",
      "portMappings": [{ "containerPort": 3000, "protocol": "tcp" }],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "NEXT_TELEMETRY_DISABLED", "value": "1" }
      ],
      "secrets": [
        {
          "name": "REVALIDATE_SECRET",
          "valueFrom": "arn:aws:secretsmanager:eu-central-1:ACCOUNT:secret:lean-commerce/revalidate-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/lean-commerce-storefront",
          "awslogs-region": "eu-central-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget -qO- http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### Schritt 4: ECS Service erstellen

```bash
# Service erstellen (nach VPC/Subnetz-Konfiguration in der Console)
aws ecs create-service \
  --cluster lean-commerce \
  --service-name storefront \
  --task-definition lean-commerce-storefront:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxx,subnet-yyy],
    securityGroups=[sg-xxx],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "targetGroupArn=arn:aws:...,containerName=storefront,containerPort=3000"
```

#### Schritt 5: Auto Scaling

```bash
# Scaling-Target registrieren
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/lean-commerce/storefront \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 10

# CPU-basiertes Scaling (skaliert bei > 70% CPU)
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/lean-commerce/storefront \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    }
  }'
```

### Umgebungsvariablen mit AWS Secrets Manager

Secrets **nie** hardcoded oder in der Task Definition als Klartext speichern:

```bash
# Secret erstellen
aws secretsmanager create-secret \
  --name "lean-commerce/env" \
  --secret-string '{
    "REVALIDATE_SECRET": "dein-sicherer-token-hier",
    "NEXT_PUBLIC_API_URL": "https://api.lean-commerce.de"
  }'

# In next.config.mjs für lokale .env.local lesen:
# REVALIDATE_SECRET=local-dev-secret

# Secrets in Task Definition referenzieren (wie oben gezeigt)
# ECS holt den Wert zur Laufzeit aus Secrets Manager
```

### CI/CD Pipeline mit GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]

env:
  AWS_REGION: eu-central-1
  ECR_REPOSITORY: lean-commerce-storefront
  ECS_SERVICE: storefront
  ECS_CLUSTER: lean-commerce

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag & push Docker image
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-definition.json
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true

      - name: Invalidate CloudFront Cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DIST_ID }} \
            --paths "/*"
```

### CloudWatch Monitoring

```bash
# Log-Gruppe für ECS erstellen (passiert automatisch, falls in Task Def konfiguriert)
aws logs create-log-group --log-group-name /ecs/lean-commerce-storefront

# Alarm: CPU > 80% für 5 Minuten
aws cloudwatch put-metric-alarm \
  --alarm-name "lean-commerce-high-cpu" \
  --alarm-description "ECS CPU Utilization > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --dimensions Name=ClusterName,Value=lean-commerce Name=ServiceName,Value=storefront \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "arn:aws:sns:eu-central-1:ACCOUNT:lean-commerce-alerts" \
  --statistic Average

# Error-Alarm: 5xx-Fehler im ALB
aws cloudwatch put-metric-alarm \
  --alarm-name "lean-commerce-5xx-errors" \
  --namespace AWS/ApplicationELB \
  --metric-name HTTPCode_Target_5XX_Count \
  --period 60 \
  --evaluation-periods 3 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "arn:aws:sns:eu-central-1:ACCOUNT:lean-commerce-alerts"
```

### Kostenoptimierung — Free Tier Grenzen

| Service | Free Tier | Empfehlung für Produktion |
|---------|-----------|--------------------------|
| ECS Fargate | 750h/Monat (ARM Graviton) | Graviton-Instance nutzen (günstiger) |
| ECR | 500 MB Storage | Lifecycle-Policy: alte Images löschen |
| CloudFront | 1TB Transfer, 10M Requests | Aggressives Caching |
| CloudWatch | 5 GB Logs | Log-Retention auf 30 Tage begrenzen |
| ALB | 750h/Monat | Für Produktion unvermeidbar |

```bash
# ECR Lifecycle Policy: nur die letzten 10 Images behalten
aws ecr put-lifecycle-policy \
  --repository-name lean-commerce-storefront \
  --lifecycle-policy-text '{
    "rules": [{
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": { "tagStatus": "any", "countType": "imageCountMoreThan", "countNumber": 10 },
      "action": { "type": "expire" }
    }]
  }'
```

---

## 15. Best Practices & Checkliste

### Code-Qualität

```
✅ TypeScript-Fehler null halten (kein `any` ohne Kommentar)
✅ Props mit Interfaces typisieren
✅ `key` bei Listen immer stabil (ID, nicht Index)
✅ Default zu Server Components — 'use client' nur wenn nötig
✅ Fehlerbehandlung in async Server Components (try/catch oder error.tsx)
✅ Bilder über next/image (automatische Optimierung)
✅ Links über next/link (Client-Side Navigation)
✅ Fonts über next/font (verhindert Layout Shift)
```

### Performance

```
✅ Parallele Datenfetches mit Promise.all()
✅ Suspense-Grenzen für paralleles Streaming
✅ ISR statt SSR wenn möglich (revalidate = N Sekunden)
✅ Cache-Tags für gezielte Invalidierung
✅ next/image für alle Bilder (lazy loading + WebP)
✅ useMemo/useCallback nur wo gemessen nötig
```

### Sicherheit

```
✅ Secrets nur via Secrets Manager (nie in Code)
✅ REVALIDATE_SECRET für Webhook-Endpunkte
✅ Input-Validierung in Server Actions (zod)
✅ Security Headers in next.config.mjs
✅ HTTPS-only (ALB + CloudFront erzwingen)
✅ WAF-Regeln für ALB/CloudFront aktivieren
✅ ECR-Images auf Sicherheitslücken scannen
```

### AWS-Deployment Checkliste

```
□ Dockerfile multi-stage (builder + runner)
□ Non-root User im Container
□ Health Check Endpoint /api/health implementiert
□ CloudWatch Log Group konfiguriert
□ Auto Scaling Policy gesetzt
□ Secrets in AWS Secrets Manager (nicht als Env-Var Klartext)
□ ECR Lifecycle Policy (alte Images löschen)
□ ALB mit HTTPS + gültigem Zertifikat (ACM)
□ CloudFront vor ALB (CDN + Caching)
□ CloudWatch Alarme: CPU, 5xx-Fehler, Memory
□ GitHub Actions CI/CD Pipeline
□ Staging-Environment (ECS Service: desired count 1)
□ Production-Environment (ECS Service: desired count 2+)
```

### Nächste Schritte nach diesem Tutorial

1. **Datenbank hinzufügen:** PostgreSQL auf Amazon RDS + Prisma ORM
2. **Auth hinzufügen:** NextAuth.js + Cognito
3. **Search:** Algolia oder OpenSearch
4. **Monitoring:** Sentry für Frontend-Fehler
5. **Feature Flags:** AWS AppConfig oder LaunchDarkly
6. **Storybook:** UI-Komponenten dokumentieren
7. **Playwright:** End-to-End Tests

---

> **Du hast es geschafft!** Du kennst jetzt React von den Grundlagen bis zur AWS-Produktion. Das `lean-commerce`-Projekt zeigt alle diese Konzepte in echtem Code. Geh die Codebase durch, baue Komponenten nach, ändere etwas und sieh, was passiert. Lernen durch Tun ist der schnellste Weg.
