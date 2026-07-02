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
- [x] `src/pages/Home` — hero heading ("Find Your Perfect Car"), subheading,
      "Start Conversation" CTA routing to `/chat`, illustration (reused the
      existing `src/assets/hero.png`, already in the repo)
      side-by-side desktop layout, stacked/image-first on mobile
- [x] No API call on this page (start happens in M6) — confirmed, page is
      static
- [x] Verified in a real browser: desktop + mobile viewport screenshots, and
      a scripted click on "Start Conversation" confirmed it actually
      navigates to `/chat` with zero console errors (not just that the link
      `href` looks right)

**M4 status: done.**

## M5 — Chat Screen (UI only, no live data yet)
- [x] `src/components/Chat/ChatWindow`, `MessageBubble`, `TypingIndicator`,
      `ChatInput`, `QuickReplyChips`, `ThinkingAnimation`
- [x] `src/components/Common/ProgressIndicator`
- [x] `src/types/chat.ts` (`ChatMessage`/`ChatRole`) — minimal local shape,
      just enough for these components; M6 reuses it rather than redefining
- [x] `src/constants/quickReplies.ts` — `FUEL_TYPE_OPTIONS`,
      `TRANSMISSION_OPTIONS`, `BODY_TYPE_OPTIONS`, corrected against the
      backend's real enums (fuel: Petrol/Diesel/CNG/Electric/Hybrid/Not Sure
      — not `EV`; body type includes Coupe). Chip `onSelect` sends the
      option's natural-language `message`, not the raw enum label.
- [x] Static/mock message list in `src/pages/Chat.tsx` (scripted 5-turn
      conversation with a fake 1.2s "thinking" delay) to validate the full
      layout/interaction before M6 replaces it with the real `useChat` hook
      — components themselves are pure/presentational (props only), so M6
      only touches the page's data-wiring, not `components/Chat/*`
- [x] `AppLayout` changed from `min-h-screen` (whole-page scroll) to
      `h-screen` + `overflow-y-auto` on `<main>` — needed so the chat input
      stays pinned at the bottom of the viewport and only the message list
      scrolls, chat-app style; navbar/footer now always stay visible.
      Verified this didn't regress Home/NotFound (content is short enough
      that it's visually identical either way).
- [x] Verified in a real browser via a scripted interaction (typed message →
      send → thinking animation → next assistant question with chips →
      clicked a chip → conversation advanced): all four screenshots show
      correct rendering, progress bar animates, zero console errors

**M5 status: done.**

## M6 — API Integration
- [x] `src/types/`: `car.ts` (`CarResponse` + `BodyType`/`FuelType`/
      `Transmission` unions), `page.ts` (`Page<T>`), `error.ts`
      (`ErrorResponse`), `chat.ts` extended with `ConversationResponse`/
      `ChatRequest`/`ChatResponse` — transcribed field-for-field from
      `FRONTEND_INTEGRATION.md` §3 and confirmed against live responses (see
      verification below)
- [x] `src/services/api.ts`: `startConversation()`, `sendMessage()`,
      `getCars()`, `getCar()` — axios instance with `baseURL` from
      `VITE_API_BASE_URL`, catches and rethrows the parsed `ErrorResponse`
      body on non-2xx (synthesizes a `Network Error`/status-0 shape for
      connection failures, since those never reach the backend at all)
- [x] `src/context/conversation-context.ts` + `ConversationContext.tsx`
      (`ConversationProvider`) + `src/hooks/useConversation.ts` — single
      hook/context (not separate `useChat`), since a second hook would
      either fork state (breaking the Chat→Recommendation share) or just
      re-export this one. Owns `conversationId`, `messages`, `completed`,
      `recommendations`, `comparison`, `loading`, `error`, and
      `start`/`send`/`retry`/`reset`. Provider wraps the router in `App.tsx`
      so state survives the Chat→Recommendation navigation.
- [x] `src/components/Common/ErrorBanner` — shows `error.message`, retry
      button only when the caller passes `onRetry`. Policy for *when* retry
      makes sense (`canRetry`) lives in the context, not hardcoded in the
      component: no conversation yet, or a `Not Found` (dead conversation)
      → retry starts a new one; `LLM Failure`/`Database Failure`/network
      error with a pending message → retry resends the same text;
      `Validation Failed`/`Invalid SQL`/`Internal Server Error` → no retry
      offered, matches `FRONTEND_INTEGRATION.md` §5's table.
- [x] `src/utils/detectQuickReplyOptions.ts` — best-effort keyword match on
      the real assistant question text (backend doesn't tag which
      preference field it's asking about) to decide which M5 chip set to
      show; falls back to free-text input if no match, never blocks typing
- [x] `Chat.tsx` rewired off the M5 mock state onto `useConversation`;
      navigates to `/recommendation` via `useNavigate` when `completed`
      becomes `true` (not on `recommendations.length`)
- [x] **Verified against the real local backend, not mocks**: ran the
      actual `carDekho-AI-Backend` (`local` profile, port 8081 — port 8080
      is permanently occupied by a Windows service, `AgentService.exe`, on
      this machine; `.env` updated accordingly) and drove it with a real
      headless browser:
      - Confirmed CORS actually works end-to-end (caught and fixed a real
        mismatch first: the backend's `FRONTEND_ORIGIN` only allows
        `:5173`, so testing against a scratch `:5183` dev server failed
        CORS — not a code bug, a test-setup one)
      - Ran a full live conversation through real Anthropic Claude calls
        (`/chat/start` → five real `/chat/message` turns) to
        `completed: true`, confirmed navigation to `/recommendation` fired
        correctly, zero console errors
      - Forced and verified the real error/retry paths: killed the backend
        mid-conversation → real network error + Retry shown → restarted the
        backend (fresh in-memory store) → clicked Retry → got a genuine
        `404 Conversation not found` from the live backend + Retry shown →
        clicked Retry again → correctly detected `Not Found` and started a
        brand-new conversation rather than resending
      - One real backend crash hit along the way (transient DNS failure
        resolving the Railway MySQL host, unrelated to this repo) — noted
        for awareness, not something fixed here

**M6 status: done.** `useChat`/`useRecommendations`/`useTyping` from
`CLAUDE_FRONTEND.md`'s planned hook list were **not** created as separate
files — `useConversation` already covers Chat's needs, and a `useTyping`
hook has nothing to own now that `ThinkingAnimation`/`TypingIndicator` are
self-contained. Revisit `useRecommendations` in M7 if the Recommendation
page's needs turn out to be more than reading straight from
`useConversation`.

## M7 — Recommendation Cards
- [x] `src/components/Common/CarCard` — the reusable structured-data card
      (brand/model/variant, body-type badge, `Intl`-formatted INR price,
      fuel/transmission/mileage/safety, View Details link to `/car/:id`); a
      `large` prop scales it up and widens the specs grid to one row of 4
      instead of 2×2, used for the featured slot
- [x] `src/components/Recommendation/RecommendationCard` — thin wrapper
      adding the "Top Recommendation" ribbon badge around `CarCard` when
      `featured`; not a separate visual design, since the backend has no
      per-car AI blurb to justify one (`ChatResponse` has exactly one
      `assistantMessage` covering *all* recommended cars together, not a
      summary per car — confirmed against the real DTO in M6)
- [x] `src/components/Common/EmptyState` — generic title/description/action,
      used for both empty states below
- [x] `src/pages/Recommendation` — top pick as a full-width featured card,
      rest in a responsive grid (1/2/3 cols), per `PROJECT_SCOPE.md`. Reads
      `messages`/`completed`/`recommendations` straight from
      `useConversation` — no separate `useRecommendations` hook needed (see
      M6's note on skipped hooks)
- [x] Three distinct page states, each with its own `EmptyState` or content:
      not-completed (direct nav without chatting) → "start a conversation"
      prompt; completed with zero matches → renders the real markdown
      summary + "no matching cars" `EmptyState`; completed with matches →
      markdown summary + featured card + grid
- [x] Markdown summary rendered via `react-markdown` with custom
      `h2`/`h3`/`p`/`ul`/`li`/`strong` component overrides (no typography
      plugin installed, so bare `ReactMarkdown` would under-style headings —
      same reasoning as `MessageBubble`'s override in M5)
- [x] "Compare" button from `CLAUDE_FRONTEND.md`'s planned card buttons
      **deliberately not added yet** — there's nowhere for it to go until
      M8 builds the comparison view it should link to; adding a dead button
      now would just get thrown away
- [x] Verified with a mix of real backend calls and real (non-LLM) data:
      - Direct nav to `/recommendation` with no conversation → confirmed the
        not-completed `EmptyState` for real, screenshotted
      - Card layout/pricing/badges/responsive grid verified against **real
        `CarResponse` objects fetched live from `GET /cars`** (desktop +
        mobile screenshots) via a temporary preview route added, screenshotted,
        and fully deleted afterward (confirmed zero diff left behind:
        `git status` showed only the real M7 files) — chosen specifically to
        avoid burning more LLM quota (see note below)
      - Attempted a full live chat→recommendation run reusing M6's proven
        approach, but **hit a real backend problem along the way**: the
        backend's `pom.xml` actually depends on
        `spring-ai-starter-model-google-genai` (Gemini), not
        `spring-ai-starter-model-anthropic` as the backend's own
        `IMPLEMENTATION.md`/`CLAUDE_BACKEND.md` claim — the migration
        described in those docs doesn't match what's actually deployed on
        this machine. Gemini's free tier caps at 20 requests/day, and it was
        exhausted by M6 + M7's testing today (confirmed via backend logs:
        `429 ... generate_content_free_tier_requests, limit: 20`). This is a
        backend-repo issue, not fixable from here — flagging it since it
        explains the intermittent 503s seen since M6 and blocks further live
        verification until the backend's provider/quota situation is
        resolved or the quota resets.

**M7 status: done.**

## M8 — Comparison Table
- [x] `src/components/Recommendation/ComparisonTable` — cars as columns,
      the 11 documented attributes as rows, horizontally scrollable on
      narrow viewports (`overflow-x-auto` + `min-w`) rather than squeezing
- [x] Sourced directly from `comparison` (via `useConversation`), not
      re-derived from `recommendations` — even though the two are currently
      identical in the backend, reading the field the API actually
      documents for this purpose means no code change needed if that ever
      diverges
- [x] Columns/rows: price, mileage, safety, fuel, transmission, seats, boot
      space, ground clearance, review score, engine, power — all 11, per
      `CLAUDE_FRONTEND.md`
- [x] Wired up the "Compare" button deferred from M7: `CarCard` gained an
      opt-in `showCompareLink` prop (default off, so the component stays
      generic/reusable) rendering an anchor to `#comparison`;
      `RecommendationCard` always turns it on since it's only ever used on
      the page that has that section. `Recommendation.tsx` renders the
      table under `id="comparison"` with `scroll-mt-6` so the sticky navbar
      doesn't cover the anchor target on click.
- [x] Verified with real `/cars` data via the same temporary/non-shipping
      preview-route technique as M7 (LLM quota still exhausted, see M7's
      note) — screenshotted the full table (all 11 rows populated
      correctly) and confirmed clicking "Compare" on a grid card actually
      scrolls the page down to the table. Preview route fully deleted
      afterward, confirmed via `git status` before finishing.

**M8 status: done.**

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
