# Meridian Banking — Frontend Take-Home

**Role:** Frontend Developer
**Timebox:** 2–3 hours of focused work (hard cap: 3 hours)
**Stack:** React + TypeScript + Vite
**Deliverable:** one deployed, single-page app + private repo + README

> **Start here:** press **Use this template** on the assignment repo, choose
> **Create a new repository**, and create your copy as **Private** in your own
> GitHub account (not the hiring company's organisation). Work in your copy, not
> in the template. Then read this brief end to end before coding.

---

## 1. The brief

Meridian is a digital bank with two customer segments: **Retail** (blue) and
**Premium** (crimson). You are building the signed-in experience for one
customer, **Ava Chen**: a dashboard that shows her money, and a three-step
transfer flow that sends money to a payee.

Everything is client-side against a provided mock API. There is no auth, no real
backend, and **no second page**.

> **What we care about most:** how you structure and extend the starter, the
> architecture and implementation decisions behind it, and a transfer flow that
> works end-to-end. Honest loading/error/empty states matter too. Visual polish
> is welcome, but a clean, complete flow beats a beautiful half-flow.
>
> **AI tools are allowed.** We're evaluating your judgment: what you delegated,
> what you changed, and why. You must be able to explain and modify everything
> you submit.

---

## 2. Timebox and scope

Aim for **2–3 hours**. Stop at 3 hours and submit what you have, with notes on
what is unfinished. A complete core with honest gaps scores better than a broken
bonus.

| Tier | Scope |
| --- | --- |
| **Must** | Dashboard, 3-step transfer, validation, success refresh, loading/error/empty states, responsive, light/dark + two segment themes, 3 tests, deployment, README |
| **Should** | Daily-limit meter, skeleton loaders, dirty-close confirmation, debug menu for states |
| **Bonus** | Third segment, balance privacy toggle, `#transfer` deep link, one E2E test, accessibility pass |
| **Out of scope** | Auth/login, Cards/Payments/Insights pages, charts, notifications, payee CRUD, transaction detail, multi-currency, i18n |

The top navigation in the wireframe (`Cards`, `Payments`, `Insights`) is part of
the visual shell only. Render it disabled or non-interactive. **Do not build
those pages.**

---

## 3. What "done" looks like

These criteria are the specification; the wireframe in
[`wireframes/wireframe.md`](../wireframes/wireframe.md) shows the layout they
refer to. Treat the [API contract](api-contract.md) as the source of truth for
behaviour.

### 3.1 Dashboard

- [ ] **D1 — Data loading.** On load, fetch customer, accounts, and
      transactions (`limit=8`) in parallel. Show skeletons while pending; the
      layout must not jump when data arrives.
- [ ] **D2 — Header.** Meridian mark, greeting `Good evening, Ava`, segment
      switch (`Retail` / `Premium`), theme toggle, avatar `AC`. No menu needed.
- [ ] **D3 — Total available.** `SGD 17,120.55`: the sum of **checking +
      savings only**. The credit card balance is excluded and displayed
      separately as a negative amount. Subtitle: `Across 2 deposit accounts`.
- [ ] **D4 — Accounts.** Three cards: name, masked number, balance. The credit
      card also reads `Amount due` (or similar) and shows `-SGD 420.30`.
- [ ] **D5 — Recent transactions.** The 8 newest across all accounts, newest
      first. Each row: description, category, date (`18 Oct`), signed amount,
      and a `Pending` chip when `status === "pending"`. Inbound amounts use `+`
      and the positive colour; outbound use `−` and the default text colour.
- [ ] **D6 — Search.** Filters by description **or** category,
      case-insensitive. Show a result count and a clear action. No matches →
      empty state with `Clear search`.
- [ ] **D7 — Error state.** If a dashboard request fails, show an inline error
      panel with a specific message and `Retry`; retry refetches. You can force
      this with the mock API's `?scenario=error` hook or DevTools offline mode.
- [ ] **D8 — Mobile.** At 390 px: single column, 16 px gutters, no horizontal
      page scroll, account cards stack or scroll horizontally, primary CTA is
      sticky above the safe area, tap targets ≥ 44 px.

### 3.2 Transfer flow

- [ ] **T1 — Entry and shell.** Primary CTA `New transfer` on the dashboard.
      Desktop (≥ 1024 px): centred modal. Mobile: full-screen sheet. Move focus
      into the dialog, close on `Esc`/`✕`, and return focus to the trigger.
- [ ] **T2 — Step 1: Recipient.** Load payees from the API with search. Select a
      saved payee, or choose `Send to someone new` and enter name, 8-digit
      account number, and bank. Validation is inline; focus the first invalid
      field. Show a stepper (`Recipient → Amount → Review`).
- [ ] **T3 — Step 2: Amount.** From-account select (**deposit accounts only**),
      amount, quick amounts (`50`, `100`, `250`, `500`), optional note
      (50-character counter). Show available balance and remaining daily limit.
      Rules: required, ≥ `1.00`, ≤ available, ≤ remaining daily limit, max 2
      decimals. Validate on blur and on submit.
- [ ] **T4 — Step 3: Review.** From account, recipient (name, masked number,
      bank), amount, fee `SGD 0.00`, total, note. `Back`/`Edit` returns to the
      previous step with all entries preserved.
- [ ] **T5 — Submit.** `POST /api/transfers`. While pending, the button is
      disabled and reads `Sending…`; double submission is impossible. Success
      replaces the dialog content with: `Transfer sent`, amount, recipient,
      reference from the API, and `Back to dashboard`.
- [ ] **T6 — Refresh.** After success, accounts, transactions, and customer
      limits refetch. The new balance and the new transaction are visible
      without a page reload.
- [ ] **T7 — API failure.** Keep the review data, show an alert with the API
      message, and allow retry. Never show a success state on failure.
- [ ] **T8 — Navigation.** `Back` preserves entries. Closing with data entered
      asks `Discard this transfer?` before throwing it away. (Should)
- [ ] **T9 — Accessibility.** Every input has a label; errors are linked with
      `aria-describedby`; submission errors use `role="alert"`; success is
      announced (`aria-live`); the payee list is keyboard operable.

### 3.3 Themes and segments

- [ ] **TH1 — Light/dark.** Toggle switches instantly. On first visit, follow
      `prefers-color-scheme`. Persist the choice in `localStorage` and apply it
      **before first paint** (no flash).
- [ ] **TH2 — Segment.** `Retail` (blue) / `Premium` (crimson) switches brand
      colour only, in both light and dark mode. Persist the choice. Use the
      provided tokens; **no hardcoded brand hex values in components**.
- [ ] **TH3 — Quality.** Toggles are labelled (or `aria-pressed`), focus is
      visible, and text meets WCAG AA contrast in every combination.

### 3.4 Engineering quality

- [ ] **Q1 — Types.** TypeScript strict. Real types for API data. No `any` in
      `src/`.
- [ ] **Q2 — Server state.** Use TanStack Query (recommended) or an equivalent
      with cache, loading/error states, and invalidation (or `setQueryData`)
      after a transfer. Do not copy API data into a global store.
- [ ] **Q3 — Forms.** React Hook Form + Zod (recommended) or equivalent. Define
      each rule once; no duplicated ad-hoc validation.
- [ ] **Q4 — Tests.** At least **three meaningful tests**:
      1. amount greater than the available balance shows an error and does not
         send a request;
      2. a successful transfer shows the success state and updates the balance
         and/or invalidates the right queries;
      3. a dashboard request failure shows the error state, and `Retry`
         refetches.
- [ ] **Q5 — Build.** `npm run build` passes. No console errors on the happy
      path.
- [ ] **Q6 — Deployment.** A public URL works end-to-end without a local server
      (use MSW in the browser, or host the mock API). README is complete.

---

## 4. Layout, design, and copy

### 4.1 Layout rules

- Desktop: max content width **1200 px**, 24 px gutters, 12-column grid.
  Dashboard main column + 300 px right rail.
- Mobile: 16 px gutters, single column, sticky bottom CTA.
- Spacing follows an 8 px scale. Cards use 16–24 px padding.
- Use the system font stack. Larger numerals use tabular figures
  (`font-variant-numeric: tabular-nums`).
- Breakpoints: `640px` and `1024px`. Support down to **360 px**.

### 4.2 Design tokens

The starter imports [`design-tokens.css`](design-tokens.css) in `src/index.css`.
Set the theme on the document element:

```html
<html data-theme="dark" data-segment="premium">
```

Everything visual — surfaces, text, borders, brand, hero gradient, focus ring,
status colours — should come from these variables. Segment switching should
only swap token values, never component styles.

### 4.3 Component inventory

You can name things differently, but this is the shape we expect:

`AppShell` · `Header` (`SegmentSwitch`, `ThemeToggle`, `Avatar`) ·
`BalanceHero` · `AccountCard` · `TransactionList` / `TransactionRow` ·
`SearchInput` · `TransferDialog` (`Stepper`, `PayeeOption`, `AmountField`,
`ReviewSummary`, `SuccessPanel`) · `Button` · `Badge` · `Skeleton` ·
`EmptyState` · `InlineError`.

Icons: `lucide-react` or inline SVG. Don't spend time drawing icons.

### 4.4 Copy

Use this copy exactly where shown; it keeps reviews comparable.

| Where | Copy |
| --- | --- |
| Greeting | `Good evening, Ava` |
| Total label | `Total available` |
| Total caption | `Across 2 deposit accounts` |
| Primary CTA | `New transfer` |
| Transactions title | `Recent transactions` |
| Search placeholder | `Search transactions` |
| Empty search | `No transactions match your search.` + `Clear search` |
| Dashboard error | `We couldn't load your dashboard.` + `Retry` |
| Transfer title | `New transfer` |
| Step 1 title | `Who are you sending to?` |
| Step 2 title | `How much?` |
| Step 3 title | `Check the details` |
| Amount error (over balance) | `Amount can't be more than your available balance (SGD 4,280.55).` |
| Amount error (limit) | `This transfer exceeds your remaining daily limit (SGD 5,000.00).` |
| Account error | `Enter a valid 8-digit account number.` |
| Submit pending | `Sending…` |
| Submit error | `Something went wrong. Your money hasn't left your account. Try again.` |
| Success | `Transfer sent` |
| Success caption | `The money should arrive within minutes.` |
| Discard prompt | `Discard this transfer?` / `Keep editing` / `Discard` |

Currency: `SGD`, two decimals, via
`Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', currencyDisplay: 'code' })`.
Dates: `18 Oct` (en-SG, day + short month).

---

## 5. Data and mock API

The full contract — endpoints, payloads, error codes, validation rules — is in
[`api-contract.md`](api-contract.md). Read it before you start.

- The starter runs **MSW in the browser**. It starts before the app renders, so
  `/api/...` works immediately with `npm run dev`.
- The handlers live in `mock-api/handlers.ts`; `src/mocks/handlers.ts`
  re-exports them, so the browser, the optional Node server, and tests share one
  contract and one seed file.
- A Node copy is available for `curl` debugging: `npm run mock`
  (`http://localhost:4010`). You do **not** need it for the app.
- Responses are delayed ~500 ms so loading states are visible.
- State is in memory and **resets on refresh / server restart**. That is
  expected.
- Error hooks: `?scenario=error`, `?scenario=empty`, a note containing
  `#fail`, and `?delay=1500`. These are for demoing states, not for normal use.
- **Use MSW for the deployed build.** Static hosts can't proxy to `localhost`;
  the included handlers make the demo work end-to-end. See
  [`DEPLOYMENT.md`](../DEPLOYMENT.md) for platform settings and MSW gotchas.
- Don't change the seed data or the contract to make your UI pass. Override
  responses inside tests instead.

### Starter responsibilities

The starter already includes and configures Vite, React, TypeScript, TanStack
Query, React Hook Form, Zod, MSW, Vitest, Testing Library, and the design tokens.
It also provides a typed `apiFetch` helper and API types. Node 22 is recommended
(`.nvmrc`). Run:

```bash
npm install
npm run dev
```

What is **not** done: the dashboard, transfer flow, theme/segment switching,
search, validation, tests for the required behaviour, and deployment. Those are
the assignment. You decide how to structure features and components on top of
the starter.

---

## 6. Technical expectations

| Area | Expectation |
| --- | --- |
| Framework | React 19 + Vite + TypeScript (`strict: true`), already scaffolded |
| Scaffolding | Extend the starter; keep the feature/component structure clear and explain it |
| Styling | Your choice: CSS Modules, Tailwind, or plain CSS. Must use the tokens. |
| Server state | TanStack Query (recommended) — query keys, loading/error, invalidation |
| UI state | Local state / context / Zustand for theme, segment, dialog. No API data here. |
| Forms | React Hook Form + Zod, or equivalent with a single source of truth |
| Tests | Vitest + Testing Library + MSW. Test behaviour, not implementation. |
| Components | A UI kit is fine for primitives (dialog, select). No complete dashboard templates. |
| Deployment | Netlify, Vercel, or Cloudflare Pages. HTTPS is required for MSW. See [`DEPLOYMENT.md`](../DEPLOYMENT.md). |
| Browser support | Latest Chrome, Safari, Firefox; responsive from 360 px |

**Avoid:** `useEffect`-based fetching with hand-rolled loading flags, storing
derived totals in state, hardcoded hex colours in components, and form rules
duplicated between the input and the submit handler.

---

## 7. Suggested 3-hour plan

| Time | Work |
| --- | --- |
| 0:00–0:15 | Review the starter + API contract, choose your feature structure, wire theme + segment switching |
| 0:15–0:50 | Dashboard: queries, skeletons, total, account cards, transaction list + search |
| 0:50–1:35 | Transfer: dialog/sheet, stepper, steps 1–2, validation |
| 1:35–2:05 | Review + submit, success, cache refresh, error handling |
| 2:05–2:25 | Responsive pass, states (empty/error), accessibility |
| 2:25–2:45 | Three tests, build, deploy, README |
| 2:45–3:00 | Buffer: bug fixes, notes on what's missing |

If you're behind at 1:35, prioritise: happy-path transfer → dashboard accuracy →
deployment → tests → polish. **A deployed happy path scores more than local
perfection.**

---

## 8. Deploy and submit

### Deploying

The deployed app must work **end-to-end without a local server**. Run the MSW
handlers in the browser for the deployed build — do not point production at
`localhost:4010`.

1. The starter already includes `public/mockServiceWorker.js` and starts the
   worker in `src/main.tsx`. If you rebuild the setup, run
   `npx msw init public/ --save` and start the worker before rendering.
2. Build with `npm run build`; deploy the `dist/` folder.
3. MSW needs HTTPS. Netlify, Vercel, and Cloudflare Pages all provide it.
4. Start the worker unconditionally for this assignment. If you gate it behind
   an env flag, set that variable in the platform's dashboard too.

See [`DEPLOYMENT.md`](../DEPLOYMENT.md) for a full checklist and the common MSW
failures (worker 404s, stale service workers, base paths, mobile testing).

| Platform | Build command | Output | Notes |
| --- | --- | --- | --- |
| **Netlify** | `npm run build` | `dist` | Import the repo; Vite is detected. Set `NODE_VERSION=22` if the build image is old. Add `public/_redirects` only if you add client-side routes. |
| **Vercel** | `npm run build` | `dist` | Framework preset: Vite. Usually no extra config. |
| **Cloudflare Pages** | `npm run build` | `dist` | Framework preset: Vite. Set `NODE_VERSION=22` if prompted. |

GitHub Pages also works, but needs a `base` path and a 404 fallback for the
service worker. The three platforms above are simpler.

Before submitting, verify the deployed URL:

- [ ] Opens on a phone-sized viewport.
- [ ] Dashboard data loads.
- [ ] A transfer completes and the balance updates.
- [ ] No console errors on the happy path.
- [ ] `npm run build` passes from a clean clone.
- [ ] No `.env` secrets or tokens are committed.

### Submit

Use a **private** GitHub repo in **your own account** so your work isn't
publicly indexed.

1. On the assignment repo, press **Use this template** → **Create a new
   repository**. Set visibility to **Private** and create it under your personal
   account. Do not push to the template or to the hiring company's organisation.
2. Push your work to that private repo.
3. Invite the reviewer to the **repo** (not your organisation):
   - Repo → **Settings → Collaborators** (or **Manage access**).
   - **Add people** → search for the reviewer handle in your invitation email.
   - Choose **Read** access and add the account.
4. Reply with:
   - The **private repo URL** (and confirmation the reviewer has access).
   - The **deployed URL**.
   - The README described below.
   - Your time log and AI disclosure (can live in the README).

GitHub collaborators are user accounts, not organisations. If your repo belongs
to an org, allow outside collaborators and add the individual reviewer account.
If you cannot use the template button, create an empty private repo under your
personal account and push the starter files there. A public repo is acceptable
if you prefer, but add the reviewer either way.

### README template

```md
# Meridian Banking — <Your Name>

- Deployed: <url>
- Repo: <private repo url>
- Run locally: `npm i && npm run dev` (MSW starts automatically)

## Stack and why
## Project structure (folders, modules, responsibilities)
## Architecture (server state, UI state, forms, theming)
## Key implementation decisions and trade-offs
## Deployment (platform, build command, output directory)
## How I handled loading / empty / error states
## Tests (what they cover, how to run)
## What I'd do with more time
## Time log (start, end, breaks, total)
## AI use (tools, what for, what I changed/verified)
## Known issues
```

---

## 9. How you'll be assessed

A 100-point rubric covers: dashboard and data (20), transfer flow (25),
validation and edge cases (10), architecture, state and data layer (10),
responsive and accessibility (10), theming (10), tests (5), scaffolding, project
structure and implementation decisions (5), and deployment + README (5). Bonus
work is noted separately and never compensates for a broken core.

We look at the deployed app first, then the repo: how you extended the starter,
how the folders and modules are organised, and whether the architecture is
deliberate. The README should explain the choices and trade-offs, not just list
features.

Then a 20-minute walkthrough where you'll explain decisions and make one small
live change. **AI-assisted work is welcome. The walkthrough is where we check
that you understand and can modify what you submitted.**

---

## 10. Rules and FAQ

**Can I use AI?**
Yes — for scaffolding, implementation, tests, CSS, or refactors. Disclose the
tools and what you used them for. You own the result: it must run, it must be
tested, and you must be able to explain and modify it live. We care more about
your judgment and understanding than whether AI was involved.

**Can I use a component library?**
Yes for primitives (dialog, select, toast). No complete dashboard/admin
templates or generated starter templates that already implement this flow.

**Do I need routing?**
No. One page, with the transfer flow as a dialog/sheet. A `#transfer` deep link
is bonus only.

**Can I change the mock data?**
Don't change the seed or contract. Add `server.use(...)` overrides in tests for
edge cases.

**What if I run out of time?**
Submit anyway. Mark unfinished items in the README. Partial, explained work is
fine.

**What about auth, real payments, multi-currency?**
Out of scope. The mock API is the source of truth.

**Browser/device support?**
Latest Chrome, Safari, Firefox. Responsive from 360 px to 1440 px+.

**What does a great submission look like?**
The scaffold is reproducible: `npm i`, `npm run dev`, `npm test`, and
`npm run build` work from a clean clone. The project is easy to navigate, with
clear module boundaries and a typed API layer. The README explains the structure
and the trade-offs. The deployed app works on a phone and a laptop. Balances
update after a transfer. Every failure path has a message and a way forward. The
theme switch changes the whole surface, not just the button. Tests fail when the
behaviour breaks.
