# syntax=docker/dockerfile:1
#
# Multi-Stage Dockerfile für lean-commerce Storefront
#
# Stages:
#  base    → Node 20 + pnpm
#  deps    → Abhängigkeiten installieren (Layer-Cache)
#  builder → next build (standalone output)
#  runner  → minimales Production-Image (~200MB)
#
# Build:
#   docker build -t lean-commerce .
#
# Run:
#   docker run -p 3000:3000 --env-file apps/storefront/.env.local lean-commerce

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Base Image mit pnpm
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base

# pnpm via corepack (kein separates npm install)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Dependencies
# Nur package.json-Dateien kopieren → Layer wird nur bei Dep-Änderungen invalidiert
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS deps

WORKDIR /app

# Monorepo-Manifeste
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/storefront/package.json ./apps/storefront/package.json

# Alle Abhängigkeiten installieren (inkl. devDeps für den Build)
RUN pnpm install --no-frozen-lockfile

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: Builder
# next build mit standalone output → minimale Dateimenge für Production
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

# Source-Code kopieren
COPY . .

# Telemetrie deaktivieren
ENV NEXT_TELEMETRY_DISABLED=1

# Build-Zeit Umgebungsvariablen (keine Secrets!)
# NEXT_PUBLIC_* Variablen müssen zur Build-Zeit gesetzt sein
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3000
ARG NEXT_PUBLIC_APP_VERSION=0.1.0
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION}

RUN pnpm --filter storefront build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4: Runner (Production Image)
# Nur standalone output → kein node_modules im vollen Umfang
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Unprivilegierten User anlegen (Security Best Practice)
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Standalone-Build enthält bereits alle notwendigen node_modules
# Struktur: .next/standalone/ → server.js + node_modules/ + .next/server/
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/.next/static     ./apps/storefront/.next/static

# public/ Verzeichnis (statische Assets)
# Erstelle leeres Verzeichnis falls keines existiert
RUN mkdir -p ./apps/storefront/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/public ./apps/storefront/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js ist der Entry-Point des standalone builds
# Pfad: apps/storefront/ weil pnpm --filter vom Monorepo-Root baut
CMD ["node", "apps/storefront/server.js"]
