# Maltiplayx

Premium casino lobby UI built in React and TypeScript with a mock game-provider boundary.

## Run locally

```bash
cd Casino-Backend-main
npm install
npm run dev
```

Run the frontend from a second terminal, also opened at the workspace root:

```bash
cd Casino-frontend-main
npm install
npm run dev
```

The frontend sends `/api` requests through the Vite development proxy to the backend at `http://localhost:3001`. Set `VITE_API_URL` in `.env.development` to override this path if needed.

## Architecture

The frontend talks to `GameProvider`, not to a vendor API. `src/services/gameProvider.ts` currently exports `mockGameProvider`; a production adapter can implement the same interface and keep provider credentials on a server-side API gateway. The demo launch action returns a session payload to model the future `POST /api/games/:id/launch` flow.

Planned API boundaries include `/api/auth`, `/api/games`, `/api/categories`, `/api/promotions`, `/api/vip`, `/api/wallet`, and `/api/favorites`. Real-money play, payments, identity checks, jurisdiction gating, and responsible-gaming controls must be enabled only with the appropriate licensed providers and compliance review.