# CarDekho AI — Frontend

Conversational AI car-buying assistant frontend (React 19 + TypeScript +
Vite + Tailwind). See [PROJECT_SCOPE.md](PROJECT_SCOPE.md) for the product
brief, [ARCHITECTURE.md](ARCHITECTURE.md) for the overall system design,
[IMPLEMENTATION.md](IMPLEMENTATION.md) for how the backend contract actually
works, and [TASKS.md](TASKS.md) for the milestone-by-milestone build log.

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

Verified locally before writing this: `npm run build && npm run start`,
then confirmed `/`, `/chat`, `/recommendation`, and `/car/:id` all return
`200` with the app shell (not a bare-server 404) — the SPA fallback works
as expected.

### Note on the original deployment plan

`PROJECT_SCOPE.md` documents Vercel for the frontend and Railway for the
backend. This setup targets Railway for the frontend instead, per explicit
direction — if that's not the final intent, `PROJECT_SCOPE.md` should be
updated to match, or the deployment target reconsidered.
