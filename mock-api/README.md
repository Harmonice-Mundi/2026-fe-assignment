# Mock API

Two implementations of the same contract:

| File | What it is |
| --- | --- |
| `handlers.ts` | MSW v2 handlers for the browser and Vitest |
| `db.json` | Seed data used by both |
| `server.mjs` | Optional zero-dependency Node HTTP server (port 4010) |

The starter already uses the MSW handlers through `src/mocks/handlers.ts`. The
Node server is optional and useful for `curl` debugging.

Full endpoint documentation: [`../brief/api-contract.md`](../brief/api-contract.md).
Deployment troubleshooting: [`../DEPLOYMENT.md`](../DEPLOYMENT.md).

## Optional: run the Node server

```bash
npm run mock
# [mock-api] listening on http://localhost:4010
```

Proxy it from Vite if you want to use it instead of MSW:

```ts
// vite.config.ts
server: { proxy: { '/api': 'http://localhost:4010' } }
```

Check it:

```bash
curl http://localhost:4010/api/accounts
curl "http://localhost:4010/api/transactions?limit=2&q=grab"
curl -X POST http://localhost:4010/api/transfers \
  -H 'content-type: application/json' \
  -d '{"fromAccountId":"acc_checking","payeeId":"pay_001","amount":120,"note":"Dinner"}'
```

Custom port:

```bash
PORT=4011 node mock-api/server.mjs
```

## MSW (already wired)

| Piece | File |
| --- | --- |
| Shared handlers + seed | `mock-api/handlers.ts`, `mock-api/db.json` |
| App re-export | `src/mocks/handlers.ts` |
| Worker | `src/mocks/browser.ts` |
| Worker startup | `src/main.tsx` |
| Service worker | `public/mockServiceWorker.js` |

The app starts the worker before rendering and sends `/api/...` requests through
`src/api/client.ts`. Do not copy the handlers into `src/mocks/`; the re-export
keeps the browser, tests, and Node server on one contract.

In tests, import `handlers` and `resetMockDb` from `src/mocks/handlers`
(adjust the path if your setup file lives somewhere else):

```ts
import { setupServer } from 'msw/node'
import { handlers, resetMockDb } from '../mocks/handlers'

export const server = setupServer(...handlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => resetMockDb())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Seed data

- Customer: Ava Chen, retail, daily limit `SGD 5,000`, `0` used.
- Accounts: Everyday Checking `4,280.55`, Savings Plus `12,840.00`,
  Rewards Card `-420.30`. Deposit total: **`SGD 17,120.55`**.
- 15 transactions (8 newest shown on the dashboard).
- 4 payees: Jamie Tan, Marcus Lee, Priya Nair, Mum.
- Transfers mutate balances, add a transaction, and increase the daily usage.
  State is in memory — restart the server or reload the page to reset.

## Hooks

| Hook | Effect |
| --- | --- |
| `?scenario=error` (GET) | `500 INTERNAL_ERROR` |
| `?scenario=empty` (GET lists) | Empty arrays |
| `?delay=1500` | Extra latency, max 5000 ms |
| Note contains `#fail` | `500` from the transfer endpoint, no money moves |
| `POST /api/__reset` | Restore seed data |

Examples:

```bash
curl "http://localhost:4010/api/accounts?scenario=error"
curl "http://localhost:4010/api/transactions?scenario=empty"
curl -X POST http://localhost:4010/api/transfers \
  -H 'content-type: application/json' \
  -d '{"fromAccountId":"acc_checking","payeeId":"pay_001","amount":120,"note":"#fail"}'
curl -X POST http://localhost:4010/api/__reset
```

## Troubleshooting

- **Port in use:** `PORT=4011 node mock-api/server.mjs` and update the proxy.
- **CORS:** the server allows `*`; if you see CORS errors, you are probably
  hitting the wrong port.
- **State looks stale:** restart the server or call `/api/__reset`.
- **MSW 404s:** the service worker file must be in `public/`, and the app must be
  served over HTTPS (or `localhost`). See [`../DEPLOYMENT.md`](../DEPLOYMENT.md).
- **Deployed demo has no data:** MSW must be started in the production build —
  it is not dev-only in the starter.
