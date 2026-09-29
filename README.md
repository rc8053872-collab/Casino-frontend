# Orbit Casino

Premium casino lobby UI built in React and TypeScript with a mock game-provider boundary.

## Run locally

```bash
npm install
npm run dev
```

The app runs in mock mode by default. Copy `.env.example` to `.env` when connecting a backend.

## Architecture

The frontend talks to `GameProvider`, not to a vendor API. `src/services/gameProvider.ts` currently exports `mockGameProvider`; a production adapter can implement the same interface and keep provider credentials on a server-side API gateway. The demo launch action returns a session payload to model the future `POST /api/games/:id/launch` flow.

Planned API boundaries include `/api/auth`, `/api/games`, `/api/categories`, `/api/promotions`, `/api/vip`, `/api/wallet`, and `/api/favorites`. Real-money play, payments, identity checks, jurisdiction gating, and responsible-gaming controls must be enabled only with the appropriate licensed providers and compliance review.