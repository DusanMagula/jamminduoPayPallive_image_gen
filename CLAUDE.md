# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

E-commerce website for **Jammin' Duo** — a small homemade jam business. Sells three jam varieties (Strawberry, Blueberry, Mixed Berry at £5.49 each) with PayPal checkout. Currency is GBP.

## Commands

```bash
# Development (full stack: Express + Vite)
npm run dev:full

# Frontend only (Vite dev server)
npm run dev

# Type checking
npm run check

# Production build (Vite frontend + ESBuild server)
npm run build

# Run production build
npm start

# Push DB schema changes (requires DATABASE_URL env var)
npm run db:push
```

## Architecture

This is a monorepo with a mostly client-side app. The Express backend (`server/`) is minimal and currently has no API routes — all business logic lives in the React frontend.

**Key structural points:**
- `shared/schema.ts` — Drizzle ORM schema (PostgreSQL) + Zod validation types, shared between client and server
- `server/storage.ts` — `IStorage` interface with an in-memory `MemStorage` implementation; swap this for a Drizzle/Postgres implementation when connecting a real database
- `server/routes.ts` — Empty route registration; all new API routes go here, prefixed with `/api`
- `client/src/App.tsx` — Single-component React app containing all UI, cart state, and PayPal integration

**Path aliases** (configured in `vite.config.ts`):
- `@` → `client/src/`
- `@shared` → `shared/`
- `@assets` → `attached_assets/`

**PayPal integration:**
- Uses `@paypal/react-paypal-js` with `PayPalScriptProvider` wrapping the entire app
- Client ID sourced from `VITE_PAYPAL_CLIENT_ID` env var (falls back to `'sb'` sandbox mode)
- Payment currency is GBP; `disableFunding: 'card'` hides card payment option

**Database:**
- Schema defined but backend uses `MemStorage` by default — data is not persisted between restarts
- To enable PostgreSQL: set `DATABASE_URL` env var and replace `MemStorage` in `server/storage.ts` with a Drizzle implementation

**Port:** Server always runs on port 5000, serving both the API and the Vite-built frontend.
