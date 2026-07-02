# IMPLEMENTATION.md

How the backend (`../carDekho-AI-Backend`) actually works today, and how
that maps onto this frontend's build plan. Verified directly against
backend source, not just docs.

For exact request/response JSON, field tables, curl examples, and the
error-code reference, see **`FRONTEND_INTEGRATION.md`** (the authoritative
low-level contract, written from the backend side) and the backend repo's
`API_TESTING.md`. This file stays one level up: architecture, current status,
and what it means for building `src/`. For the milestone-by-milestone build
checklist, see **`TASKS.md`**.

---

# 1. What Exists vs. What's Planned

`ARCHITECTURE.md`/`PROJECT_SCOPE.md`/`CLAUDE_FRONTEND.md` in this repo
describe the *target* design. The backend repo tracks its own build against
milestones M1–M11 in its own `IMPLEMENTATION.md`. As of the backend's last
commit (`M10`):

- **Done**: conversation flow (start/message), preference extraction, SQL
  generation + AST-based validation, database execution, recommendation
  generation, car catalog (list/get), CORS, global structured error handling,
  extra test coverage.
- **Not yet done**: M11 (Docker/Railway deployment). Doesn't block local
  frontend integration.

This repo (`carDekho-AI-frontend`) has completed all 12 milestones in
`TASKS.md` — real UI, live-backend-verified API integration, animations,
responsive design, and a refactoring/production-readiness pass. What's below
documents the contract it was built against; treat it as historical/pointer
context, not a "what's left to build" list — see `TASKS.md` for that.

---

# 2. Setup / Base URL

- Backend has **no `/api` context path** — endpoints are `/chat/start`,
  `/chat/message`, `/cars`, `/cars/{id}` directly off the base URL.
- **This repo's [.env](.env) has been fixed** to drop the stale `/api` suffix
  (was `http://localhost:8080/api`) — it no longer matches the backend's
  real routing otherwise.
- **Local port is `8081`** (confirmed the working choice on this machine —
  port `8080`, the `application.yml` default, is permanently occupied by an
  unrelated Windows service, `AgentService.exe`). `.env`'s
  `VITE_API_BASE_URL` is set to `http://localhost:8081` and the backend is
  run with `PORT=8081` (matches `carDekho-AI-Backend/.vscode/launch.json`'s
  `local` profile config). If requests start failing, check the backend
  process is actually alive on that port before assuming `.env` is stale.
- CORS is enforced server-side (`CorsConfig`, `@CrossOrigin`-equivalent via
  `WebMvcConfigurer`) and only allows the origin in the backend's
  `FRONTEND_ORIGIN` env var (default `http://localhost:5173`, Vite's
  default). Methods allowed: `GET, POST, OPTIONS`. If the frontend dev server
  runs on a different port, that's a backend-side config change, not
  something fixable from this repo.
- Errors are now structured JSON (`ErrorResponse`: `timestamp`, `status`,
  `error`, `message`, `path`) via a `@RestControllerAdvice` — see
  `FRONTEND_INTEGRATION.md` section 5 for the full status/error-label table
  and what each one means for UI handling.

---

# 3. Conversation Flow (as implemented)

Stateful, multi-turn, fully backend-orchestrated — the frontend just relays
free text and renders whatever comes back. No streaming, no websocket, no
typing-indicator event from the server (build the typing/thinking animation
purely as client-side UI while a request is in flight).

```
POST /chat/start (no body)
  → { conversationId, assistantMessage }
    assistantMessage now lists ALL 7 required fields up front in one
    message, not one question per turn — a thorough first reply can
    complete the gathering phase in a single /chat/message call.

POST /chat/message { conversationId, message }
  → PreferenceAgent re-extracts ALL preferences from the whole transcript
    every turn (frontend never tracks which fields are answered)
  → completed: false while any of the 7 required preferences (budget,
    fuelType, bodyType, transmission, drivingPattern, familySize, priority)
    is still missing → { assistantMessage, completed: false }
    (recommendations/comparison keys absent — non-null Jackson serialization)
    assistantMessage here is now DETERMINISTIC plain text listing exactly
    the still-missing fields ("I still need: transmission, driving
    pattern...") — not an LLM-phrased question, and correspondingly cheaper
    (1 LLM call per turn instead of 2, since only PreferenceAgent runs).
  → completed: true once all 7 are captured — three possible shapes, all
    structurally identical (completed: true, recommendations, comparison,
    markdown assistantMessage), distinguished only by the message content:
      - exact matches found → normal recommendation markdown
      - no exact match, but a closest-match fallback found candidates →
        recommendations/comparison ARE populated (ranked by proximity),
        assistantMessage explains up front these are near-matches and
        which criterion each one misses — render identically to an exact
        match, there's no separate field for this
      - even the closest-match fallback found nothing → deterministic
        "couldn't find any cars" message, recommendations: [],
        comparison: [] — still HTTP 200, not an error
    recommendations and comparison are the SAME array today — there is
    no distinct comparison-selection concept in the backend yet.
```

Practical implications for `useChat`:
- Route Chat → Recommendation screen on `completed === true`, not on
  `recommendations.length > 0` (empty-but-completed is valid, and now so is
  populated-but-not-exact-match — both render the same way, off the same
  fields).
- Don't assume a fixed number of turns before `completed` — a thorough
  first reply can jump straight to it; a piecemeal one takes several turns.
  Just keep looping on `completed: false` either way.
- Once `completed`, don't allow further messages on that `conversationId` —
  offer "start a new search" (fresh `POST /chat/start`).
- A `conversationId` becomes invalid if the backend restarts (in-memory
  store only) — a `404`/`Not Found` mid-conversation means "start over," not
  a frontend bug.
- Build the comparison view directly off `recommendations`/`comparison` from
  the same `ChatResponse` — no separate fetch needed.

---

# 4. Data Shapes — pointer, not copy

Don't hand-duplicate the field tables here; `FRONTEND_INTEGRATION.md`
section 3 has them verified against the actual Java DTOs (`ChatRequest`,
`ChatResponse`, `ConversationResponse`, `CarResponse`, `Page<CarResponse>`,
`ErrorResponse`). When writing `src/types/*.ts`, transcribe those tables
directly rather than re-deriving them.

One thing worth restating because it affects every model: **null fields are
omitted from JSON entirely** (`non_null` Jackson inclusion), not sent as
`null`. Every optional field in the TypeScript interfaces needs `?`, and
code must not assume a key is always present (e.g. `response.recommendations`
is `undefined`, not `[]`, before `completed: true` — default with `?? []`).

### Enum values (for chips, badges, filters)
```
BodyType:     HATCHBACK | SEDAN | SUV | MUV | COUPE
FuelType:     PETROL | DIESEL | CNG | ELECTRIC | HYBRID
Transmission: MANUAL | AUTOMATIC
```
These constrain `CarResponse` fields only — **not** what a user can type in
`/chat/message`'s `message` field, which is unrestricted free text parsed by
the LLM. Don't validate chat input against this enum list.

`CLAUDE_FRONTEND.md`'s planned `QuickReplyChips` need updating before
implementation — its fuel chip list says `EV` (real enum: `ELECTRIC`, plus
`CNG` which has no planned chip) and its body type chips omit `COUPE`.
Whatever a chip displays, it should send natural language as the chat
`message` (e.g. clicking "Electric" sends "I want an electric car"), not the
raw enum value — `PreferenceAgent` parses free text, it doesn't match enums.

---

# 5. Error Handling (current, structured)

Every non-2xx response is now a JSON `ErrorResponse` — see
`FRONTEND_INTEGRATION.md` section 5 for the full status/label/cause table.
Summary for `src/services/api.ts` design:
- Branch UI behavior on `error.error` (the short label), not `error.message`
  (verbose, and generic/non-specific on `500`s by design).
- `404 Not Found` on `/chat/message` → old `conversationId` is gone, prompt
  "start a new conversation."
- `503 LLM Failure` / `503 Database Failure` → transient, safe to offer a
  retry button that resends the same call.
- `500 Invalid SQL` / `500 Internal Server Error` → not fixable by retrying
  the same request; show a generic failure message.
- **Known current-environment caveat**: the backend runs on Groq's
  **free tier**, rate-limited on this account — not Anthropic Claude as earlier notes here assumed
  (confirmed by inspecting `pom.xml` directly; the backend's own docs were
  stale on this point too). A burst of `/chat/message` calls can trip this
  and surface as `503 LLM Failure`; it's transient and typically clears
  within ~30-60 seconds, so a retry button (or short auto-retry delay) is
  reasonable UX specifically for this case. If **every** `/chat/message`
  call fails identically regardless of payload and pacing, that's more
  likely a real config issue (e.g. missing API key) than the rate limit —
  check backend logs before assuming a frontend bug. `/cars`/`/cars/{id}`
  don't call the LLM and are unaffected either way.

---

# 6. What This Means for `src/`

- `src/services/api.ts`: implement `startConversation()`, `sendMessage()`,
  `getCars()`, `getCar()` per `FRONTEND_INTEGRATION.md` section 6's client
  sketch — base URL from `VITE_API_BASE_URL`, throw the parsed
  `ErrorResponse` body on non-2xx.
- `src/types/`: `ChatMessage`, `Conversation`, `ChatRequest`, `ChatResponse`,
  `ConversationResponse`, `Car`/`CarResponse`, `Page<T>`, `ErrorResponse` —
  transcribed from the backend DTOs, not guessed.
- `src/hooks/useConversation` / `useChat`: own `conversationId` + message
  history in state/context (not the URL), gate the Chat→Recommendation
  transition on `completed`, treat `completed && recommendations.length === 0`
  as a normal empty-state message.
- `src/components/Chat/QuickReplyChips`: update the fuel/body-type option
  sets per section 4 above before wiring them to real chips.
- `src/components/Recommendation/ComparisonTable`: source directly from the
  chat response's `comparison` array — no separate endpoint call.
