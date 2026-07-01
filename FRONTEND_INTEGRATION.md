# FRONTEND_INTEGRATION.md

Everything a frontend needs to implement the AI Car Buying Assistant chat
UI and car catalog views against this backend: full request/response
contracts, the exact call sequence, enum values, and error handling.

Companion doc: `API_TESTING.md` (curl/Postman walkthrough — useful for
manually verifying a call before wiring it into code).

---

## 1. Setup

**Base URL**: `http://localhost:8080` locally by default (this machine
currently runs the backend on `8081` under VS Code's `local` debug
profile — confirm the actual port with whoever's running the backend, or
check `.vscode/launch.json`). No API prefix — call `/chat/start`,
`/cars`, etc. directly off the base URL.

**Auth**: none. No headers required beyond `Content-Type: application/json`
on POST requests.

**CORS**: the backend only allows the origin configured in
`FRONTEND_ORIGIN` (defaults to `http://localhost:5173`, a Vite default).
If your dev server runs on a different port, that env var needs updating
on the backend — CORS is enforced server-side and cannot be worked around
from the frontend. Allowed methods are restricted to `GET, POST, OPTIONS`.

**Content type**: all POST bodies are JSON (`Content-Type: application/json`).
All responses are JSON.

**Null fields are omitted, not `null`**: the backend serializes with
`non_null` inclusion — if a field has no value (e.g. `recommendations`
before the conversation completes), it's **absent from the JSON entirely**,
not present as `"recommendations": null`. Use optional-chaining /
`?? []` fallbacks rather than assuming every field key always exists.

---

## 2. The chat flow — how to implement it

This is a **stateful, multi-turn, backend-orchestrated** conversation. The
frontend's job is thin: display the assistant's message, collect the
user's free-text reply, POST it, repeat. All the "have we asked enough
questions yet" logic lives server-side — the frontend does not need to
track which preference fields are filled.

```
┌─────────────┐
│ POST /chat/  │  (no body)
│    start     │──────► { conversationId, assistantMessage }
└─────────────┘         Render assistantMessage as the first chat bubble.
                         Store conversationId (state/context, not the URL).
       │
       ▼
┌──────────────────────────────┐
│ User types a free-text reply │
└──────────────────────────────┘
       │
       ▼
┌─────────────┐
│ POST /chat/  │  { conversationId, message }
│   message    │──────► { assistantMessage, completed: false }
└─────────────┘         Render assistantMessage as the next chat bubble.
       │                Loop back to "user types a reply" — completed
       │                stays false until 7 required preferences are
       │                all captured from the conversation.
       ▼
   (eventually)
┌─────────────┐
│ POST /chat/  │  { conversationId, message }
│   message    │──────► { assistantMessage, recommendations: [...],
└─────────────┘            comparison: [...], completed: true }
                         Render assistantMessage as markdown (it contains
                         headings/bold/lists). Render `recommendations`
                         as car cards using the CarResponse fields below.
                         Conversation is now terminal — offer "start over"
                         (a fresh POST /chat/start), not another message
                         on this conversationId.
```

There is no "typing indicator" event, no streaming, no websocket — each
`/chat/message` call is a single synchronous request/response. Expect
multi-second latency per call (LLM round-trip), so the UI should show a
loading/typing state while awaiting the response.

**Zero-result completion is not an error.** If no cars match, you still
get `completed: true`, HTTP `200`, with `recommendations: []` and an
assistantMessage explaining no matches were found — render it like any
other assistant message, don't treat it as a failure state.

---

## 3. Endpoint contracts

### `POST /chat/start`

Starts a new conversation.

**Request**: no body.

```bash
curl -X POST http://localhost:8080/chat/start
```

**Response** `200`:
```json
{
  "conversationId": "3f7a1c2e-9b4d-4e11-8a2f-1d6c9e0b7a55",
  "assistantMessage": "Hi! I'm your AI Car Buying Assistant. I'll ask a few questions to recommend the perfect car."
}
```

| Field | Type | Notes |
|---|---|---|
| `conversationId` | `string` (UUID) | Opaque — treat as a string, store it, send it back on every `/chat/message` call. |
| `assistantMessage` | `string` | Plain text greeting — always the same fixed string. |

---

### `POST /chat/message`

Advances an existing conversation by one turn.

**Request**:
```json
{
  "conversationId": "3f7a1c2e-9b4d-4e11-8a2f-1d6c9e0b7a55",
  "message": "My budget is around 15 lakh rupees, and I need a petrol SUV."
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `conversationId` | `string` | yes, non-blank | From `/chat/start`. |
| `message` | `string` | yes, non-blank | The user's free-text reply — no structured format, just natural language. |

```bash
curl -X POST http://localhost:8080/chat/message \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "3f7a1c2e-9b4d-4e11-8a2f-1d6c9e0b7a55", "message": "My budget is around 15 lakh rupees, and I need a petrol SUV."}'
```

**Response** `200` — mid-conversation (fields not yet complete):
```json
{
  "assistantMessage": "Got it — a petrol SUV around ₹15 lakh. Do you prefer an automatic or manual transmission?",
  "completed": false
}
```
Note `recommendations`/`comparison` keys are **absent** here (non-null
serialization — see section 1).

**Response** `200` — final turn (preferences complete, cars found):
```json
{
  "assistantMessage": "## Summary\nBased on your ₹15 lakh budget and focus on safety...\n\n### 1. Tata Nexon Fearless\n- **Why it fits**: 5-star safety rating...",
  "recommendations": [
    {
      "id": 2,
      "brand": "Tata",
      "model": "Nexon",
      "variant": "Fearless",
      "bodyType": "SUV",
      "fuelType": "PETROL",
      "transmission": "AUTOMATIC",
      "price": 1450000,
      "engine": "1199cc Turbo",
      "power": "118 bhp",
      "torque": "170 Nm",
      "mileage": 17.4,
      "safetyRating": 5,
      "bootSpace": 382,
      "groundClearance": 209,
      "seatCapacity": 5,
      "reviewScore": 4.5,
      "pros": ["5-star Global NCAP safety", "Strong build quality"],
      "cons": ["Firm ride quality"]
    }
  ],
  "comparison": [ /* identical array to recommendations — same cars, same order */ ],
  "completed": true
}
```

**Response** `200` — final turn, zero matches:
```json
{
  "assistantMessage": "I couldn't find any cars matching all of your criteria. Try relaxing your budget or one of your other preferences and I'll take another look.",
  "recommendations": [],
  "comparison": [],
  "completed": true
}
```

| Field | Type | Always present? | Notes |
|---|---|---|---|
| `assistantMessage` | `string` | yes | Plain text mid-conversation; **markdown** on the final turn (render accordingly — headings, bold, bullet lists). |
| `completed` | `boolean` | yes | `false` until all 7 required preferences are captured; `true` on the terminal turn. |
| `recommendations` | `CarResponse[]` | only when `completed: true` | Ranked, most-recommended first. Empty array if no matches — not an error. |
| `comparison` | `CarResponse[]` | only when `completed: true` | Currently always identical to `recommendations` — the backend has no distinct comparison-selection concept yet, it's the same list reused. Safe to just use `recommendations` for both a recommendation view and a comparison view. |

**What the frontend does *not* need to do**: track which of the 7
preference fields (budget, fuel type, body type, transmission, driving
pattern, family size, priority) have been answered, or construct any kind
of structured form — this is a free-text conversation, and the backend's
`PreferenceAgent` extracts structured data from natural language on every
turn. Just relay `message` verbatim from whatever the user typed.

---

### `GET /cars`

Paginated car catalog browse — independent of the chat flow (no
`conversationId` needed). Useful for a general "browse all cars" page.

**Query params** (all optional):

| Param | Default | Example |
|---|---|---|
| `page` | `0` | `page=1` (0-indexed) |
| `size` | `20` | `size=10` |
| `sort` | unsorted | `sort=price,asc` or `sort=safetyRating,desc` |

```bash
curl "http://localhost:8080/cars?page=0&size=10&sort=price,asc"
```

**Response** `200`:
```json
{
  "content": [
    {
      "id": 1,
      "brand": "Maruti Suzuki",
      "model": "Baleno",
      "variant": "Alpha",
      "bodyType": "HATCHBACK",
      "fuelType": "PETROL",
      "transmission": "AUTOMATIC",
      "price": 800000,
      "engine": "1197cc",
      "power": "88 bhp",
      "torque": "113 Nm",
      "mileage": 22.9,
      "safetyRating": 3,
      "bootSpace": 339,
      "groundClearance": 170,
      "seatCapacity": 5,
      "reviewScore": 4.2,
      "pros": ["Great mileage", "Low maintenance cost"],
      "cons": ["Small boot", "Average safety rating"]
    }
  ],
  "totalElements": 51,
  "totalPages": 6,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false
}
```
Standard Spring Data `Page` envelope — `content` is the array of cars for
this page; use `totalPages`/`number` to drive pagination controls.

---

### `GET /cars/{id}`

Single car lookup.

```bash
curl http://localhost:8080/cars/2
```

**Response** `200`: a single `CarResponse` object (same shape as one
`content[]` entry above).

**Response** `404` if `id` doesn't exist — see error handling (section 5).

---

### `CarResponse` field reference (used in `/cars`, `/cars/{id}`, and chat's `recommendations`/`comparison`)

| Field | Type | Notes |
|---|---|---|
| `id` | `number` | |
| `brand` | `string` | e.g. `"Maruti Suzuki"` |
| `model` | `string` | e.g. `"Baleno"` |
| `variant` | `string` | e.g. `"Alpha"` |
| `bodyType` | `enum string` | see section 4 |
| `fuelType` | `enum string` | see section 4 |
| `transmission` | `enum string` | see section 4 |
| `price` | `number` | INR, whole rupees (not paise) |
| `engine` | `string` | free text, e.g. `"1197cc"` |
| `power` | `string` | free text, e.g. `"88 bhp"` |
| `torque` | `string` | free text, e.g. `"113 Nm"` |
| `mileage` | `number` | km/l |
| `safetyRating` | `number` | integer, typically 1–5 |
| `bootSpace` | `number` | litres |
| `groundClearance` | `number` | mm |
| `seatCapacity` | `number` | |
| `reviewScore` | `number` | e.g. `4.2` |
| `pros` | `string[]` | may be empty array |
| `cons` | `string[]` | may be empty array |

---

## 4. Enum values

These are the **only** valid values for `bodyType`, `fuelType`, and
`transmission` wherever they appear in a `CarResponse` (catalog browsing
and chat recommendations alike). Use them for filter dropdowns, badges, or
icon mapping.

```
BodyType:     HATCHBACK | SEDAN | SUV | MUV | COUPE
FuelType:     PETROL | DIESEL | CNG | ELECTRIC | HYBRID
Transmission: MANUAL | AUTOMATIC
```

**Important distinction**: these enums apply to `CarResponse` (structured
DB data). They do **not** constrain what the user can type in the chat —
`/chat/message`'s `message` field is unrestricted free text (e.g. a user
can say "I want something electric or hybrid" and the LLM will parse that
into its own internal preference representation). Don't validate or
restrict chat input against this enum list client-side.

---

## 5. Error handling

Every non-2xx response has this shape:

```json
{
  "timestamp": "2026-07-01T22:10:04.512",
  "status": 404,
  "error": "Not Found",
  "message": "Car not found with id: 9999",
  "path": "/cars/9999"
}
```

| Field | Type | Notes |
|---|---|---|
| `timestamp` | `string` (ISO local date-time) | Server-side timestamp of the error. |
| `status` | `number` | HTTP status code, duplicated from the response status for convenience. |
| `error` | `string` | Short category label — see table below. Use this to branch UI behavior, not `message` (which is more specific/verbose). |
| `message` | `string` | Human-readable detail. Safe to show to users for `404`/`400`; generic/non-specific for `500`. |
| `path` | `string` | The request path that failed. |

| `status` | `error` | When it happens | Suggested frontend handling |
|---|---|---|---|
| `400` | `Validation Failed` | `conversationId` or `message` blank/missing in the request body | Client-side bug — validate before sending; if it happens, show a generic "something went wrong, please retry" and check the payload. |
| `404` | `Not Found` | Unknown `conversationId` (e.g. backend restarted and lost in-memory state) or unknown car `id` | For chat: prompt the user to start a new conversation (`POST /chat/start` again) — the old `conversationId` is gone. For cars: show a "car not found" state. |
| `500` | `Invalid SQL` | Backend's own SQL generation failed after 3 retries (not the user's fault) | Show a generic retry-later message; this indicates a backend/LLM prompt issue, not something the frontend can fix by retrying the same request. |
| `503` | `LLM Failure` | Anthropic API call failed (rate limit, billing, network, or malformed LLM output) | Transient — safe to offer a "retry" button that resends the same `/chat/message` call. |
| `503` | `Database Failure` | MySQL query execution failed | Transient — safe to offer a "retry" button. |
| `500` | `Internal Server Error` | Anything unhandled | Generic fallback error UI; message is intentionally non-specific (`"An unexpected error occurred. Please try again later."`) — never surfaces internal details. |

**Practical note on `503`s during current development**: the backend's
Anthropic account has, as of the last backend milestone note, had
billing/credit issues that make *every* LLM-backed call (all of
`/chat/message`, since every branch calls the LLM at least once) return
`503 LLM Failure`. If you're integrating against a local backend and every
single `/chat/message` call fails the same way regardless of payload,
that's very likely this — not a frontend bug. `/cars` and `/cars/{id}`
don't call the LLM and are unaffected.

---

## 6. Minimal client sketch (framework-agnostic)

```js
const baseUrl = "http://localhost:8080"; // confirm actual port with backend owner

async function startChat() {
  const res = await fetch(`${baseUrl}/chat/start`, { method: "POST" });
  if (!res.ok) throw await res.json();
  return res.json(); // { conversationId, assistantMessage }
}

async function sendMessage(conversationId, message) {
  const res = await fetch(`${baseUrl}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, message }),
  });
  if (!res.ok) throw await res.json(); // ErrorResponse shape
  return res.json(); // ChatResponse — check `completed` to decide next UI state
}

async function getCars(page = 0, size = 20, sort) {
  const params = new URLSearchParams({ page, size, ...(sort && { sort }) });
  const res = await fetch(`${baseUrl}/cars?${params}`);
  if (!res.ok) throw await res.json();
  return res.json(); // Page<CarResponse>
}
```

UI loop:
1. On mount, call `startChat()`, render `assistantMessage`, store
   `conversationId` in component state.
2. On user submit, call `sendMessage(conversationId, userInput)`, append
   both the user's message and the response's `assistantMessage` to the
   chat log.
3. If `completed === true`, render `recommendations` as car cards (markdown
   `assistantMessage` alongside them) and stop accepting further messages
   on this `conversationId` — offer a "new search" button that calls
   `startChat()` again.
4. Wrap every call in try/catch and branch on the caught `ErrorResponse.error`
   per the table in section 5.
