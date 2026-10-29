# Meridian Banking — Frontend Take-Home

**Role:** Frontend Developer
**Timebox:** 2–3 hours (hard cap: 3 hours)
**Stack:** React + TypeScript + Vite (Node 22 recommended)

Build a single-page banking dashboard with a three-step transfer flow.

## Start here

1. Press **Use this template** at the top of this repo, then choose
   **Create a new repository**.
2. Create your copy as a **private** repository **in your own GitHub account** —
   not in the hiring company's organisation. Do not work in this template repo
   directly.
3. Open [`brief/candidate-brief.md`](brief/candidate-brief.md) and read it end
   to end **before writing code**.
4. Clone your private copy, then run `npm install && npm run dev`.
5. Before submitting, invite the reviewer to your repo as a **Read**
   collaborator (steps below).

Submit the URL of your **private** repo (with the reviewer added as a read-only
collaborator) and your deployed URL. The full submission checklist is in
[§8 of the brief](brief/candidate-brief.md#8-deploy-and-submit).

You'll get a seeded mock API, design tokens, and a low-fidelity wireframe — so
you can spend your time on implementation, not on inventing requirements or
data.

**AI tools are allowed.** We're interested in how you structure and extend the
starter, the architecture and decisions behind it, and whether you can explain
and modify the result.

## What we're looking for

- A clean extension of the starter and a clear project structure.
- Deliberate architecture: server vs UI state, a typed API layer, form
  validation, and theming.
- A transfer flow that works end-to-end, including honest loading/error states.
- Tests that assert behaviour, and a deployed demo that works.
- A README that explains the decisions and trade-offs.

## Starter

This repo is a runnable Vite + React + TypeScript app. MSW is already wired, so
the dashboard can fetch `/api/...` from the first render without a local server.
Node 22 is recommended (see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest + Testing Library + MSW
npm run build      # type-check + production build
npm run mock       # optional: Node mock server on :4010
```

Included: TanStack Query, React Hook Form, Zod, MSW, Vitest, Testing Library,
the design tokens, and a shared API client/types. **You own the feature
structure** — add your own components, features, and tests.

## Read in this order (after creating your private copy)

1. [`brief/candidate-brief.md`](brief/candidate-brief.md) — scope, acceptance
   criteria, time plan, submission rules.
2. [`brief/api-contract.md`](brief/api-contract.md) — endpoints, validation,
   error cases, and MSW setup.
3. [`wireframes/wireframe.md`](wireframes/wireframe.md) — layout only. This is
   intentionally low-fidelity; it is not a visual design.
4. [`brief/design-tokens.css`](brief/design-tokens.css) — tokens (already
   imported in `src/index.css`).
5. [`mock-api/README.md`](mock-api/README.md) — the mock API and error hooks.
6. [`DEPLOYMENT.md`](DEPLOYMENT.md) — Netlify/Vercel/Cloudflare settings and
   MSW deployment gotchas.

## Mock API

MSW starts automatically in `src/main.tsx` and reuses the handlers in
`mock-api/handlers.ts` through `src/mocks/handlers.ts`.

The Node server is optional and useful for `curl` debugging:

```bash
npm run mock
# http://localhost:4010
```

Then proxy `/api` from Vite if you prefer the server over MSW. For the deployed
demo, use MSW so the static site works end-to-end.

## Deploy

Build with `npm run build` and deploy the `dist/` folder. The deployed demo must
run the MSW handlers in the browser — it must not depend on `localhost:4010`.

| Platform | Settings |
| --- | --- |
| **Netlify** | Build: `npm run build` · Publish: `dist` |
| **Vercel** | Framework: Vite · Build: `npm run build` · Output: `dist` |
| **Cloudflare Pages** | Framework: Vite · Build: `npm run build` · Output: `dist` |

MSW needs HTTPS, which all three provide. Start the worker unconditionally for
this assignment, and make sure `public/mockServiceWorker.js` is included in the
build. Full checklist and troubleshooting: [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Submit

Create the repo in **your own GitHub account** (not the hiring company's
organisation), and keep it **private**.

1. On the assignment repo, press **Use this template** → **Create a new
   repository**. Choose **Private**, and create it under your personal account.
2. Push your work there.
3. Invite the reviewer:
   - Repo → **Settings → Collaborators** (on some repos: **Manage access**).
   - **Add people** → search for the reviewer handle in your invitation email.
   - Select the account, choose **Read**, and add it.
   - Tell us the repo URL so we can accept the invite.
4. Send the repo URL, confirmation of access, and the deployed URL.

**Can I invite an organisation?** No. GitHub collaborators are **user accounts**
(or teams, for org-owned repos) — an organisation itself cannot be a
collaborator. If your repo belongs to an org, the org must allow outside
collaborators, and you add the individual reviewer account. The simplest path is
a private repo under your personal account.

You don't need to add the reviewer to any organisation; add them to the repo
only.

## Deliverables

- Private repo URL **in your own account** with the reviewer added as a read-only
  collaborator.
- Deployed URL.
- README covering setup, project structure, architecture decisions, deployment,
  states, tests, time log, AI disclosure, and known gaps.

The full brief includes the time plan and the exact acceptance criteria.
