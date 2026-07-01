# TASKS.md

Milestone checklist for building this frontend, per `CLAUDE_FRONTEND.md`'s
"implement milestone by milestone, stop after every milestone" rule. Each
milestone should compile/run and be reviewed before starting the next one.
Contracts referenced below are pinned down in `IMPLEMENTATION.md` and
`FRONTEND_INTEGRATION.md` — this file is the actionable checklist, not the
spec.

Status: all dependencies for the planned stack (`axios`, `react-router-dom`,
`framer-motion`, `react-markdown`, `react-icons`, Tailwind) are already in
`package.json` — no install step needed before M1.

---

## M1 — Project Setup
- [x] Vite + React 19 + TypeScript scaffold
- [x] Tailwind CSS wired in (`@tailwindcss/vite`)
- [x] Dependencies installed (axios, react-router-dom, framer-motion,
      react-markdown, react-icons)
- [x] `.env` → `VITE_API_BASE_URL` (fixed to `http://localhost:8080`, no
      `/api` suffix — backend has no context path)
- [x] Verified: `npm run build` (tsc + vite) and `npm run lint` both pass
      clean on the current scaffold
- [ ] Confirm backend is reachable locally before starting M6 (check actual
      port in use — may be `8080` or `8081`, see `IMPLEMENTATION.md` §2)

**M1 status: done.** `src/layouts/` (listed in `ARCHITECTURE.md`'s folder
structure) doesn't exist yet — deferred to M3, where `AppLayout` gives it
something real to contain; empty dirs aren't git-tracked anyway so creating
it now would add nothing.

## M2 — Routing
- [x] `src/router/AppRoutes.tsx` — route table: `/` (Home), `/chat` (Chat),
      `/recommendation` (Recommendation), `/car/:id` (CarDetails), `*` (NotFound)
- [x] Lazy-load page components (`React.lazy` + `Suspense`) per
      `CLAUDE_FRONTEND.md`'s Performance section — build output confirms
      each page is its own chunk
- [x] `App.tsx` wired to `BrowserRouter` + `AppRoutes`
- [x] Placeholder pages created (`src/pages/{Home,Chat,Recommendation,
      CarDetails,NotFound}.tsx`) — minimal content only, real UI is M4/M5/M7/M12
- [x] Verified in a real headless browser (Playwright, since no
      `chromium-cli`/project run-skill existed): all 5 routes screenshotted
      and confirmed rendering the correct page, including `/car/2` showing
      the dynamic `:id` and `/does-not-exist` hitting the `NotFound` page
      with a working "Back to Home" link

**M2 status: done.**

## M3 — Layout
- [x] `src/layouts/AppLayout` — flex-column shell (`Navbar` / `<Outlet/>` /
      `Footer`), nested into `AppRoutes` via a parent `<Route element={<AppLayout/>}>`
      so every page gets it automatically
- [x] `src/components/Common/Navbar` (brand mark + "Start Conversation" CTA
      linking to `/chat`), `Footer` (copyright line)
- [x] Base color palette / typography already set in `src/index.css`'s
      `@theme` block (`#2563EB` primary, `#EFF6FF` secondary, `#F8FAFC`
      background) — reused directly in Navbar/Footer, no new config needed
- [x] Adjusted M2's placeholder pages (`min-h-screen` → `min-h-[60vh]`) so
      they sit inside `AppLayout`'s own full-height flex column instead of
      each forcing their own 100vh and overflowing past the footer
- [x] Verified visually (Playwright screenshot): navbar/footer render
      consistently across a normal route (`/`) and the catch-all
      (`/does-not-exist`), no layout overflow or duplicate scroll

**M3 status: done.**

## M4 — Home Page
- [ ] `src/pages/Home` — hero heading, subheading, "Start Conversation" CTA
      routing to `/chat`
- [ ] No API call on this page (start happens in M6)

## M5 — Chat Screen (UI only, no live data yet)
- [ ] `src/components/Chat/ChatWindow`, `MessageBubble`, `TypingIndicator`,
      `ChatInput`, `QuickReplyChips`, `ThinkingAnimation`
- [ ] `src/components/Common/ProgressIndicator`
- [ ] Static/mock message list to validate layout before wiring the API
- [ ] Update `QuickReplyChips` option sets now, per `IMPLEMENTATION.md` §4:
      fuel = Petrol/Diesel/CNG/Electric/Hybrid/Not Sure (not `EV`), body type
      adds Coupe. Chip click sends **natural language**, not the raw enum
      value (e.g. clicking "Electric" sends the message "I want an electric
      car" — the backend's `PreferenceAgent` parses free text)

## M6 — API Integration
- [ ] `src/types/`: `ChatMessage`, `Conversation`, `ChatRequest`,
      `ChatResponse`, `ConversationResponse`, `Car`/`CarResponse`, `Page<T>`,
      `ErrorResponse` — transcribe field-for-field from
      `FRONTEND_INTEGRATION.md` §3, don't re-derive
- [ ] `src/services/api.ts`: `startConversation()`, `sendMessage()`,
      `getCars()`, `getCar()` (axios, base URL from `VITE_API_BASE_URL`,
      throw parsed `ErrorResponse` body on non-2xx — see
      `FRONTEND_INTEGRATION.md` §6 for the client shape)
- [ ] `src/hooks/useConversation` / `useChat`: own `conversationId` +
      message history in context/state (not the URL); gate the
      Chat→Recommendation transition on `completed === true`, **not**
      `recommendations.length > 0` (empty array + `completed: true` is a
      valid "no matches" response, not an error)
- [ ] `src/context/` — conversation/chat context provider if state needs to
      cross Chat → Recommendation route boundary
- [ ] `src/components/Common/ErrorBanner`: branch on `ErrorResponse.error`
      label (`Not Found` / `Validation Failed` / `LLM Failure` /
      `Database Failure` / `Invalid SQL` / `Internal Server Error`) per the
      table in `IMPLEMENTATION.md` §5 — retry button only for the two `503`s
- [ ] Verify a real `/chat/start` → `/chat/message` round trip against the
      local backend before moving on (watch for the known "every LLM call
      fails 503" caveat if the backend's Anthropic billing is still unresolved)

## M7 — Recommendation Cards
- [ ] `src/components/Recommendation/RecommendationCard`,
      `src/components/Common/CarCard`
- [ ] `src/pages/Recommendation` — top pick as large featured card, rest in
      grid, per `PROJECT_SCOPE.md`
- [ ] Render `assistantMessage` as markdown (`react-markdown`) on the
      completed turn — mid-conversation messages are plain text, only the
      final turn is markdown
- [ ] Empty-recommendations state (zero matches) uses `EmptyState`, not
      `ErrorBanner` — it's `completed: true` with `recommendations: []`, a
      normal response, not a failure

## M8 — Comparison Table
- [ ] `src/components/Recommendation/ComparisonTable`
- [ ] Source rows directly from the chat response's `comparison` array — do
      **not** build a separate fetch/selection flow; `comparison` is
      currently always identical to `recommendations` in the backend
- [ ] Columns: price, mileage, safety, fuel, transmission, seats, boot
      space, ground clearance, review score, engine, power (per
      `CLAUDE_FRONTEND.md`)

## M9 — Animations
- [ ] Framer Motion: fade-in/slide-up on message arrival, card hover, page
      transitions, animated typing dots (client-side only — no server
      "typing" event exists, see `IMPLEMENTATION.md` §3)

## M10 — Responsive Design
- [ ] Verify mobile (bottom input, full width, scrollable chat), tablet
      (responsive card grid), desktop (centered chat, optional sidebar) per
      `CLAUDE_FRONTEND.md`'s Responsive Design section

## M11 — Refactoring
- [ ] Extract shared card/badge/enum-label components once real UI exists
      (don't do this pass before M7/M8 are built — nothing to refactor yet)
- [ ] Confirm no `/api`-prefixed or hardcoded backend URLs slipped in
      anywhere outside `src/services/api.ts`

## M12 — Production Ready
- [ ] Confirm `VITE_API_BASE_URL` is read from env everywhere, nothing
      hardcoded
- [ ] `CarDetailsModal` (`/car/:id`, `getCar()`) — specs, pros, cons, AI
      summary, close button
- [ ] `LoadingSpinner`, `NotFound` page wired into router
- [ ] Full manual pass: Home → Chat → (multi-turn) → Recommendation →
      Compare → Car Details → error paths (kill backend mid-conversation to
      confirm the "conversation not found, start over" path actually works)

---

## Cross-cutting, not tied to one milestone
- [ ] Re-check `IMPLEMENTATION.md`/`FRONTEND_INTEGRATION.md` against the
      backend's actual current source before trusting exact field
      names/enum values if significant time has passed — the backend is
      under active milestone development and these are snapshots.
- [ ] `docs/CLAUDE_FRONTEND.md`'s enum-based `QuickReplyChips` spec is stale
      vs. the real backend enums (see M5) — fixed here, but don't reintroduce
      the old `EV`/missing-`COUPE` set from copy-pasting the planning doc.
