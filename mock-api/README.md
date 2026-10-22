# Mock API

Two implementations of the same contract:

| File | What it is |
| --- | --- |
| `server.mjs` | Zero-dependency Node HTTP server (port 4010) |
| `handlers.ts` | MSW v2 handlers for the browser and Vitest |
| `db.json` | Seed data used by both |

Full endpoint documentation: [`../brief/api-contract.md`](../brief/api-contract.md).

## Run the Node server

```bash
node mock-api/server.mjs
# [mock-api] listening on http://localhost:4010
```

Proxy it from Vite:

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

## Use MSW instead (recommended for deployment)

```bash
npm i -D msw
npx msw init public/ --save
mkdir -p src/mocks
cp mock-api/handlers.ts mock-api/db.json src/mocks/
```

```ts
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

```tsx
// src/main.tsx
async function enableMocking() {
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
}

enableMocking().then(() => {
  // render <App />
})
```

In tests, import `handlers` and `resetMockDb` (adjust the path if your setup
file lives somewhere other than `src/test/`):

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
  served over HTTPS (or `localhost`).
- **Deployed demo has no data:** MSW must be started in the production build —
  it is not dev-only unless you make it so.
