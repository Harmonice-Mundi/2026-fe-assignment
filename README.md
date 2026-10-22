# Meridian Banking — Frontend Take-Home

**Role:** Junior Frontend Developer
**Timebox:** 2–3 hours (hard cap: 3 hours)
**Stack:** React + TypeScript + Vite

Build a single-page banking dashboard with a three-step transfer flow.

You'll get a seeded mock API, design tokens, and a low-fidelity wireframe — so
you can spend your time on implementation, not on inventing requirements or
data.

## Read in this order

1. [`brief/candidate-brief.md`](brief/candidate-brief.md) — scope, acceptance
   criteria, time plan, submission rules.
2. [`brief/api-contract.md`](brief/api-contract.md) — endpoints, validation,
   error cases, and MSW setup.
3. [`wireframes/wireframe.md`](wireframes/wireframe.md) — layout only. This is
   intentionally low-fidelity; it is not a visual design.
4. [`brief/design-tokens.css`](brief/design-tokens.css) — copy these tokens.
5. [`mock-api/README.md`](mock-api/README.md) — run the mock API.

## Run the mock API

```bash
node mock-api/server.mjs
# http://localhost:4010
```

Then proxy `/api` from Vite (see the contract) or use the included MSW handlers.
For a deployed demo, use MSW so the static site works end-to-end.

## Deliverables

- Public repo URL.
- Deployed URL.
- README covering setup, decisions, states, tests, time log, AI disclosure, and
  known gaps.

The full brief includes the time plan and the exact acceptance criteria.
