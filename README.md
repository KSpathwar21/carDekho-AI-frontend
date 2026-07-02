# CarDekho AI — Frontend

Conversational AI car-buying assistant frontend (React 19 + TypeScript +
Vite + Tailwind). See [PROJECT_SCOPE.md](PROJECT_SCOPE.md) for the product
brief, [ARCHITECTURE.md](ARCHITECTURE.md) for the overall system design,
[IMPLEMENTATION.md](IMPLEMENTATION.md) for how the backend contract actually
works, and [TASKS.md](TASKS.md) for the milestone-by-milestone build log.

---

## Reflection

### What did you build and why?

A full conversational car-buying flow: a landing page, a chat screen that
gathers preferences through free-text conversation (with quick-reply chips
as a shortcut) against a live LLM-backed backend, AI-generated recommendation
cards, a side-by-side comparison table, and a car detail page — built
milestone by milestone (M1–M12, see `TASKS.md`) against `CLAUDE_FRONTEND.md`'s
plan, and wired to the real `carDekho-AI-Backend` rather than mocked data.
The brief called for a ChatGPT/Perplexity-style experience instead of a
traditional filter-driven search form, so the whole flow is built around
natural conversation, not a form with dropdowns.

### What did you deliberately cut?

- The "Compare" button on recommendation cards, out of its own milestone
  (M7) — there was nowhere for it to link to until the comparison table
  existed a milestone later (M8).
- Separate `useChat`/`useRecommendations`/`useTyping` hooks from the
  original plan — a single `useConversation` context already covers
  everything the Chat and Recommendation pages need; splitting it further
  would have either forked state or just re-exported the same thing.
- A fabricated "AI Summary" field on the car details page — the real API
  has no such field, so real Pros/Cons content is shown instead of
  inventing text the backend doesn't actually return.
- A generic `Button`/`Badge` design-system component — at the point this
  was considered, only one real usage site existed for each, so extracting
  an abstraction would have been premature.
- Re-running the full "kill the backend mid-conversation, confirm recovery"
  error path in the final production-readiness pass — it was already
  proven live, in depth, earlier in the build.
- **The biggest practical cut**: this machine can't reliably run the
  frontend dev server and the Spring Boot backend at the same time for
  long. The backend repeatedly crashed mid-session (port conflicts, a
  transient DNS failure resolving the Railway-hosted MySQL host, and
  general instability under sustained parallel use with the frontend dev
  server), and the Groq free tier backing the chat flow is also
  rate-limited, which further capped how much live,
  real end-to-end chat testing was practical in any one sitting. That
  constraint is exactly why the build didn't start with UI code — it
  started with `IMPLEMENTATION.md`, a document capturing the *actual*
  backend contract (endpoints, request/response shapes, error codes, real
  quirks — not just what the planning docs assumed) verified up front.
  With that groundwork in place, the fragile two-server setup could be
  used deliberately, milestone by milestone, instead of needing constant
  improvisation or context-rebuilding every time it went down.

### What's your tech stack and why did you pick it?

React 19 + TypeScript + Vite + Tailwind CSS, plus `react-router-dom`,
`axios`, `framer-motion`, `react-markdown`, and `react-icons` — this is the
stack `CLAUDE_FRONTEND.md` specified up front, and it held up well:

- **Vite** for fast local iteration across 12 milestones of rebuild/reload.
- **TypeScript** so the backend's real API contract (types transcribed
  from the actual Java DTOs, not guessed) is enforced at compile time.
- **Tailwind** for consistent styling velocity without hand-rolling a
  design system for a project this size.
- **react-markdown** because the backend's recommendation explanations are
  real markdown (headings, bold, lists) — needs real rendering, not a
  plain-text dump.
- **framer-motion** for the message/card/page-transition animations.
- **axios** for a clean, interceptable HTTP client with typed error
  handling on non-2xx responses.

### What did you delegate to AI tools vs. do manually? Where did the tools help most? Where did they get in the way?

This build was driven by Claude Code implementing milestone by milestone,
with me directing scope, reviewing the backend's real API documentation as
it evolved, providing the deployed backend URL, and making the calls on
things like Railway vs. Vercel for hosting and when to stop and verify vs.
keep going.

**Delegated to the tool**: reading and reconciling the planning docs into an
accurate `IMPLEMENTATION.md`, building each milestone's components, and —
critically — verifying claims against the real running system instead of
trusting docs at face value. It ran the actual backend locally, drove a
real headless browser through the actual chat flow, and caught real bugs
that would've been easy to miss otherwise: a mobile CTA button that didn't
fully fit above the fold, a CORS failure that turned out to be a test-setup
mismatch rather than a real bug, a `react-hooks` lint rule violation, and —
diagnosed correctly from a raw Railway build log rather than guesswork — a
Node version mismatch that broke the first production deploy attempt.

**Where it helped most**: turning ambiguous or aspirational planning docs
plus a backend whose own documentation had drifted from its real behavior
into something concretely verified against the actual running code — and
doing that verification honestly, including flagging when something
*couldn't* be tested live (e.g. Groq quota exhaustion) instead of
silently skipping the check.

**Where it got in the way**: the two-server instability above meant a real
chunk of session time went into restarting crashed backend processes and
re-establishing state rather than pure feature work. And because
verification leaned on real live LLM calls rather than mocks, the shared
Groq free-tier quota became an actual constraint on how much could be
proven end-to-end in one sitting — requiring workarounds like temporary,
non-shipping preview routes to verify UI against real data without
spending scarce LLM calls on repeat chat runs.

### If you had another 4 hours, what would you add?

- Real car images instead of the icon placeholder on the recommendation
  cards and car details page (the API has no image field today).
- A small design-system pass (`Button`/`Badge` components) — there's
  enough real usage across the app now to justify it, which wasn't true
  when that call was made in M11.
- A "browse all cars" page using the already-built `GET /cars` pagination,
  independent of the chat flow.
- An automated test suite (component + integration) — everything here was
  verified live via Playwright scripts run ad hoc, not committed as a
  repeatable test suite.
- An accessibility pass (keyboard navigation, ARIA labels) —
  `CLAUDE_FRONTEND.md` calls for this but it wasn't explicitly audited.
- Resolve the Vercel-vs-Railway frontend hosting discrepancy formally in
  `PROJECT_SCOPE.md` rather than leaving a note about it.
- More resilient retry/backoff specifically for the LLM rate-limit case,
  instead of a manual retry button.

---

## Local development

```bash
npm install
npm run dev
```

Requires the backend (`carDekho-AI-Backend`) running locally and
`VITE_API_BASE_URL` in `.env` pointed at it — see `IMPLEMENTATION.md`
section 2 for the current local port.

## Production build

```bash
npm run build    # tsc -b && vite build -> dist/
npm run start    # serves dist/ with SPA fallback, honors $PORT
```

`npm run start` uses [`serve`](https://github.com/vercel/serve) in
single-page-app mode (`-s`), which rewrites unknown paths to `index.html` —
required for React Router's `BrowserRouter` routes (`/chat`,
`/recommendation`, `/car/:id`) to resolve correctly on direct navigation or
page refresh, not just client-side link clicks.

## Deploying to Railway

This repo includes [railway.json](railway.json), so Railway's Nixpacks
builder auto-detects the build (`npm run build`) and start
(`npm run start`) commands — no Dockerfile needed.

1. **Create the Railway project** (one-time, via your Railway account):
   - `railway login` (opens a browser to authenticate), then
     `railway init` in this directory, **or** connect this GitHub repo
     directly from the Railway dashboard ("New Project" → "Deploy from
     GitHub repo").
2. **Environment variable already handled**: [.env.production](.env.production)
   is committed with `VITE_API_BASE_URL=https://cardekho-ai-backend-production.up.railway.app`
   (the deployed backend's real URL, confirmed live). Vite automatically
   loads `.env.production` for `vite build` (which runs in production mode
   by default) — no manual Railway dashboard variable needed for this to
   work, though setting `VITE_API_BASE_URL` there too is harmless (a
   dashboard value would just take precedence with the same result). Vite
   bakes `VITE_*` vars in at **build time**, not runtime — if the backend
   URL ever changes, update `.env.production` and redeploy, a dashboard
   variable set after the fact won't retroactively apply either.
3. **Deploy**: `railway up` (CLI) or push to the connected branch
   (GitHub integration auto-deploys on push).
4. Railway injects `PORT` automatically at runtime — `npm run start`
   already reads it (`serve -s dist -l $PORT`), no manual configuration
   needed there.
5. **Backend CORS**: the backend's `FRONTEND_ORIGIN` env var must include
   this Railway deployment's public URL, or every API call will fail CORS
   preflight in the browser (see `IMPLEMENTATION.md` section 2). This is a
   backend-side config change — coordinate with whoever deploys
   `carDekho-AI-Backend`.

**Node version**: `package.json` pins `engines.node` to `>=20.19.0` —
Nixpacks reads this to pick the build's Node version. Without it, Nixpacks
defaulted to Node 18, which fails outright (`ReferenceError: CustomEvent is
not defined`) since Vite 8 requires Node 20.19+/22.12+. If a build fails
with that exact error, this field either got removed or Nixpacks ignored it
for some reason — check the build log's Node version line first.

Verified locally before writing this: `npm run build && npm run start`,
then confirmed `/`, `/chat`, `/recommendation`, and `/car/:id` all return
`200` with the app shell (not a bare-server 404) — the SPA fallback works
as expected.

### Note on the original deployment plan

`PROJECT_SCOPE.md` documents Vercel for the frontend and Railway for the
backend. This setup targets Railway for the frontend instead, per explicit
direction — if that's not the final intent, `PROJECT_SCOPE.md` should be
updated to match, or the deployment target reconsidered.
