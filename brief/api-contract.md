# Mock API contract

Base URL: `http://localhost:4010/api`

The same contract is implemented twice, with identical behaviour:

| Implementation | File | Use |
| --- | --- | --- |
| Node server (zero dependencies) | `mock-api/server.mjs` | Local dev, `curl`, debugging |
| MSW handlers | `mock-api/handlers.ts` | Browser dev **and deployed demos**, tests |

Both are seeded from `mock-api/db.json`. State lives in memory and resets when
the server restarts / the page reloads. There is a reset endpoint for tests.

---

## Conventions

- JSON in, JSON out. All money values are numbers in **SGD**, 2 decimals.
- Dates are ISO 8601 strings. Display them in the browser's local timezone.
- CORS is open (`*`) on the Node server; MSW runs in the page.
- Artificial latency: **500 ms** per request. Override with `?delay=1500`
  (capped at 5000 ms).
- All errors use one shape:

```ts
interface ApiErrorBody {
  error: {
    code: string
    message: string
    fields?: Record<string, string> // field name -> human-readable message
    meta?: Record<string, unknown>  // e.g. available balance, limit
  }
}
```

- Request bodies are `application/json`.
- The API never returns a full account number. Payees expose a masked number
  only; the server resolves the real number when `payeeId` is sent.

---

## Types

Copy these into your app (e.g. `src/types/api.ts`).

```ts
export type Segment = 'retail' | 'premium'
export type AccountType = 'checking' | 'savings' | 'credit'
export type TransactionDirection = 'in' | 'out'
export type TransactionStatus = 'posted' | 'pending'

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  segment: Segment
  dailyTransferLimit: number // 5000
  transferredToday: number   // starts at 0, increases after each transfer
}

export interface Account {
  id: string
  name: string
  type: AccountType
  maskedNumber: string // "•••• 4821"
  balance: number      // credit card balances are negative
  currency: 'SGD'
}

export interface Transaction {
  id: string
  accountId: string
  date: string // ISO 8601
  description: string
  category: string // income | groceries | dining | transport | bills | shopping | subscriptions | health | transfer
  direction: TransactionDirection
  amount: number // always positive; direction determines the sign
  status: TransactionStatus
}

export interface Payee {
  id: string
  name: string
  bank: string
  accountNumberMasked: string // "•••• 3391"
  initials: string             // "JT"
  lastUsedAt: string           // ISO 8601
}

export interface Transfer {
  id: string
  reference: string // "TRF-7QK2M9"
  status: 'completed'
  fromAccountId: string
  recipient: {
    name: string
    bank: string
    accountNumberMasked: string
  }
  amount: number
  fee: number // 0
  currency: 'SGD'
  note: string | null
  createdAt: string
}

export interface CreateTransferRequest {
  fromAccountId: string
  amount: number
  note?: string
  payeeId?: string // exactly one of payeeId / recipient
  recipient?: {
    name: string
    accountNumber: string // 8 digits
    bank: string
  }
}
```

---

## Endpoints

### `GET /api/health`

```json
{ "ok": true }
```

### `GET /api/customer`

```json
{
  "customer": {
    "id": "cus_001",
    "firstName": "Ava",
    "lastName": "Chen",
    "email": "ava.chen@example.com",
    "segment": "retail",
    "dailyTransferLimit": 5000,
    "transferredToday": 0
  }
}
```

`segment` is the customer's default segment. The UI switch may override it;
no API call is needed to change segment.

### `GET /api/accounts`

```json
{
  "accounts": [
    {
      "id": "acc_checking",
      "name": "Everyday Checking",
      "type": "checking",
      "maskedNumber": "•••• 4821",
      "balance": 4280.55,
      "currency": "SGD"
    },
    {
      "id": "acc_savings",
      "name": "Savings Plus",
      "type": "savings",
      "maskedNumber": "•••• 9930",
      "balance": 12840,
      "currency": "SGD"
    },
    {
      "id": "acc_credit",
      "name": "Rewards Card",
      "type": "credit",
      "maskedNumber": "•••• 7712",
      "balance": -420.3,
      "currency": "SGD"
    }
  ]
}
```

Dashboard total = sum of `type !== 'credit'` → `17120.55`.

### `GET /api/transactions`

Query params (all optional):

| Param | Values | Default | Notes |
| --- | --- | --- | --- |
| `accountId` | `all` or an account id | `all` | Filter by account |
| `q` | string | — | Case-insensitive match on description **or** category |
| `direction` | `in` \| `out` | — | Filter by direction |
| `limit` | 1–50 | `20` | Applied after filtering and sorting |

Sorted by `date` descending. Response:

```json
{
  "transactions": [
    {
      "id": "txn_2001",
      "accountId": "acc_checking",
      "date": "2026-10-19T18:42:00+08:00",
      "description": "FairPrice Finest",
      "category": "groceries",
      "direction": "out",
      "amount": 86.4,
      "status": "posted"
    }
  ],
  "total": 8
}
```

`total` = number of matches **before** `limit`, so the UI can say `Showing 8
of 14` when unfiltered.

The dashboard must request `limit=8` and display exactly those 8.

### `GET /api/payees`

```json
{
  "payees": [
    {
      "id": "pay_001",
      "name": "Jamie Tan",
      "bank": "DBS",
      "accountNumberMasked": "•••• 3391",
      "initials": "JT",
      "lastUsedAt": "2026-10-12T10:00:00+08:00"
    }
  ]
}
```

Sorted by `lastUsedAt` descending.

### `POST /api/transfers`

Request — saved payee:

```json
{
  "fromAccountId": "acc_checking",
  "payeeId": "pay_001",
  "amount": 120,
  "note": "Dinner"
}
```

Request — new recipient:

```json
{
  "fromAccountId": "acc_checking",
  "amount": 120,
  "note": "Dinner",
  "recipient": {
    "name": "Alex Lim",
    "accountNumber": "12345678",
    "bank": "OCBC"
  }
}
```

Success: **201 Created**

```json
{
  "transfer": {
    "id": "trf_01JB2K9Q",
    "reference": "TRF-7QK2M9",
    "status": "completed",
    "fromAccountId": "acc_checking",
    "recipient": {
      "name": "Jamie Tan",
      "bank": "DBS",
      "accountNumberMasked": "•••• 3391"
    },
    "amount": 120,
    "fee": 0,
    "currency": "SGD",
    "note": "Dinner",
    "createdAt": "2026-10-20T10:15:00.000Z"
  },
  "account": {
    "id": "acc_checking",
    "balance": 4160.55
  },
  "dailyLimit": {
    "limit": 5000,
    "used": 120,
    "remaining": 4880
  }
}
```

Side effects: the account balance drops, a posted `transfer` transaction is
added, and `transferredToday` increases. The transfer is **not** idempotent —
disable the submit button while pending.

On success, refresh `accounts`, `transactions`, and `customer` (invalidate their
query keys, or apply the response with `setQueryData`). Both are acceptable.

---

## Validation and errors

| Check | Status | Code | `fields` key |
| --- | --- | --- | --- |
| Body is valid JSON | 400 | `INVALID_JSON` | — |
| `fromAccountId` provided and exists | 400 | `VALIDATION_ERROR` | `fromAccountId` |
| From account is not a credit card | 400 | `VALIDATION_ERROR` | `fromAccountId` |
| Exactly one of `payeeId` / `recipient` | 400 | `VALIDATION_ERROR` | `payeeId` |
| `payeeId` exists | 400 | `VALIDATION_ERROR` | `payeeId` |
| `recipient.name` 2–50 chars | 400 | `VALIDATION_ERROR` | `recipient.name` |
| `recipient.accountNumber` exactly 8 digits | 400 | `VALIDATION_ERROR` | `recipient.accountNumber` |
| `recipient.bank` 2–30 chars | 400 | `VALIDATION_ERROR` | `recipient.bank` |
| `amount` is a number ≥ 1.00 | 400 | `VALIDATION_ERROR` | `amount` |
| `amount` has at most 2 decimals | 400 | `VALIDATION_ERROR` | `amount` |
| `note` ≤ 50 chars | 400 | `VALIDATION_ERROR` | `note` |
| `amount` ≤ account balance | 422 | `INSUFFICIENT_FUNDS` | `amount` |
| `amount` ≤ remaining daily limit | 422 | `DAILY_LIMIT_EXCEEDED` | `amount` |
| Note contains `#fail` (testing hook) | 500 | `INTERNAL_ERROR` | — |

Error examples:

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Amount exceeds available balance.",
    "fields": {
      "amount": "Amount can't be more than your available balance (SGD 4,280.55)."
    },
    "meta": { "available": 4280.55 }
  }
}
```

```json
{
  "error": {
    "code": "DAILY_LIMIT_EXCEEDED",
    "message": "Amount exceeds remaining daily limit.",
    "fields": {
      "amount": "This transfer exceeds your remaining daily limit (SGD 5,000.00)."
    },
    "meta": { "limit": 5000, "used": 0, "remaining": 5000 }
  }
}
```

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Something went wrong. Your money hasn't left your account."
  }
}
```

Client validation should mirror these rules **before** sending, but the API is
the final authority. Show `fields.amount` (or your own equivalent copy) inline,
and `message` in a `role="alert"` banner for 422/500 errors.

---

## Demo / debugging hooks

| Hook | Effect |
| --- | --- |
| `GET ...?scenario=error` | Any GET returns 500 `INTERNAL_ERROR` |
| `GET ...?scenario=empty` | List endpoints return empty arrays |
| `?delay=1500` | Adds 1500 ms latency (max 5000) |
| Note includes `#fail` | Transfer returns 500 after validation; no money moves |
| `POST /api/__reset` | Restores seed data (tests, demos) |

`scenario` and `delay` are read by both the Node server and the MSW handlers.
They are for demoing states, not for production logic.

To show the dashboard error state in a deployed demo, either use DevTools →
Network → Offline, or add a small debug menu (should-have) that appends
`?scenario=error` to requests. Do not ship a permanent "break the app" button in
the main UI.

---

## Setup

### Option A — Node mock server + Vite proxy (fastest for local dev)

```bash
node mock-api/server.mjs
# [mock-api] listening on http://localhost:4010
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:4010' } },
})
```

Smoke test:

```bash
curl http://localhost:4010/api/accounts
curl -X POST http://localhost:4010/api/transfers \
  -H 'content-type: application/json' \
  -d '{"fromAccountId":"acc_checking","payeeId":"pay_001","amount":1}'
```

### Option B — MSW in the browser (required for a static deployment)

MSW intercepts `fetch` in the browser, works in dev and on Netlify / Vercel /
GitHub Pages, and the same handlers run in Vitest.

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
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

async function enableMocking() {
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
```

Notes:

- `handlers.ts` imports `./db.json` — keep them in the same folder.
- If your `tsconfig` doesn't already include JSON imports, add
  `"resolveJsonModule": true` to `compilerOptions` (some Vite templates leave it
  out, which breaks `tsc -b`).
- MSW requires HTTPS (Netlify/Vercel/Cloudflare/GitHub Pages all provide it).
- For GitHub Pages, set `base` in `vite.config.ts` and the service worker URL
  above handles the sub-path.
- MSW state is in memory; a refresh resets balances to the seed. That is fine
  for a demo. `POST /api/__reset` is available for tests.

### Tests

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { handlers, resetMockDb } from '../mocks/handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => resetMockDb())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Override a response inside a test:

```ts
import { http, HttpResponse } from 'msw'
import { server } from '@/test/setup'

server.use(
  http.get('/api/accounts', () =>
    HttpResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Down' } }, { status: 500 }),
  ),
)
```

Remember to `resetMockDb()` between tests, otherwise transfers mutate the seed
for later tests.

---

## What not to change

- Do not edit `db.json` or the handler logic to make a screen pass. If a case is
  missing, add a test override.
- Do not call the API from components directly; keep a typed `src/api/` layer.
- Do not send `recipient.accountNumber` for saved payees — send `payeeId`. The
  masked number in the payee list is intentionally not a real account number.
