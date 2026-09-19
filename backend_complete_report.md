# TRIP//OS — Complete Backend Architecture & System Master Report

## 1. Executive Summary & Architectural Overview

**TRIP//OS** is a specialized group travel decision, intelligence, and automatic replanning engine designed to solve the chaos of group trips. The core philosophy is:
> **“Plans change. Your itinerary shouldn't have to fall apart.”**

The backend is built with **Node.js, Express, PostgreSQL, and Supabase Auth**, engineered with a clean, decoupled **Layered MVC Architecture**:
- **`src/config/`**: Database pool connection, Supabase client initialization, and validated environment configuration.
- **`src/controllers/`**: HTTP request handlers managing responses, status codes, and input extraction.
- **`src/routes/`**: Express routers organized by domain boundaries.
- **`src/services/`**: Pure algorithmic engines for Group DNA calculation, explainable destination scoring, dynamic itinerary scheduling, route hazard risk assessment, and automatic disruption replanning.
- **`src/middleware/`**: Authentication, role-based authorization (Leader vs Member), rate limiting, and centralized error handling.
- **`src/data/`**: Curated datasets including 45+ top Indian tourist destinations across 20+ states.
- **`src/utils/`**: High-entropy invite code generators and structured logging.

---

## 2. 🏆 Pitch Deck Highlights: Flagship USPs & "Not-So-Common" Competitive Moats

When presenting TRIP//OS to judges, investors, or evaluation boards, highlight these **6 rare, production-grade USPs**. Most travel apps (like MakeMyTrip, TripAdvisor, or Google Trips) are static search directories or simple booking engines; **TRIP//OS is an autonomous operating system for group trips** that solves social friction, safety, and remote realities:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 TRIP//OS VALUE ENGINE                   │
                  ├────────────────────────────┬────────────────────────────┤
                  │ BEFORE THE TRIP            │ DURING TRANSIT & ON-SITE   │
                  ├────────────────────────────┼────────────────────────────┤
                  │ • 9D Group DNA Consensus   │ • Real-time Disaster Radar │
                  │ • Zero-Drama Deal-Breakers │ • Auto-Repair Replanning   │
                  │ • Optimal Departure Timers │ • Offline Emergency Pack   │
                  │ • Hybrid Offbeat Discovery │ • Multi-Modal Transit Comp │
                  └────────────────────────────┴────────────────────────────┘
```

### 💎 USP 1: Step 5D Explainable Consensus & Mathematical "Group DNA"
* **The Traditional Flaw**: Travel apps ask one person what they like, or group chats degenerate into endless 50-message WhatsApp debates where the loudest person wins.
* **The TRIP//OS Moat**: 
  - Every member submits an independent 9-dimensional preference vector (`adventure`, `nature`, `nightlife`, `food`, `photography`, `relaxation`, `budget`, `walking`, `crowd`).
  - The engine mathematically synthesizes a unified **"Group DNA"** and runs Step 5D scoring.
  - Crucially, it provides **Explainable AI (XAI)** outputs: it doesn't just say *"Go to Manali"*; it outputs an audited breakdown of **`componentScores`**, **`why`** tags, and warning flags.

### 🚫 USP 2: Absolute "Deal-Breaker" Hard Elimination
* **The Traditional Flaw**: One person in the group has severe asthma or a leg injury, yet the app recommends high-altitude steep treks.
* **The TRIP//OS Moat**:
  - Implements a triple-tier constraint model (`MUST_GO`, `DONT_WANT`, `DEAL_BREAKER`).
  - Any destination or venue that violates a member's `DEAL_BREAKER` (e.g., severe walking requirement, excessive crowd density, dietary restrictions) is **hard-rejected** with clear transparency. No member is forced into an uncomfortable experience.

### ⏰ USP 3: "Time to Begin Journey" & The Transit Fatigue Recovery Engine (TFI)
* **The Traditional Flaw**: Every travel platform measures arrival time at the destination, ignoring the 6 to 14 hours of transit that can ruin Day 1 with exhaustion and traffic jams. Furthermore, travel apps assume users are robots who can endure a 12-hour overnight bus or car ride arriving at 5:30 AM and immediately hike or tour monuments at 9:00 AM.
* **The TRIP//OS Moat**:
  - Operates on the core thesis: **"The trip begins when you leave, not when you arrive."**
  - Uses the Haversine Great-Circle formula + surface road speed vectors across 5 modes (`CAR`, `CAB`, `BUS`, `TRAIN`, `FLIGHT`).
  - Analyzes city rush-hour patterns (08:00–10:00 & 17:00–20:00), applies dynamic mountain/weather terrain buffers, and computes the exact **Optimal Departure Date & Time** so groups evade peak traffic and start their vacation energized.
  - **Travel Fatigue Index (TFI 0–100) & Day 1 Recovery Engine**: Computes physical travel strain factoring in transit duration, mode friction multipliers (Bus: 1.45x, Car: 1.25x, Train: 0.70x, Flight: 0.40x), and overnight/red-eye penalties (+25 pts). Automatically adapts the Day 1 itinerary by reserving a mandatory morning nap/recovery buffer for exhausted arrivals, pushing high-intensity exploration to late afternoon or Day 2 to prevent group burnout.

### 🛡️ USP 4: Proactive Natural Hazard Radar & Landslide Shield
* **The Traditional Flaw**: Tourists get stranded in Himalayan ghats or coastal valleys because weather forecasts only predict "rain" without terrain context.
* **The TRIP//OS Moat**:
  - Cross-references real-time satellite meteorology (Open-Meteo) with specialized Indian topographical vulnerability maps (Uttarakhand, HP, J&K, Sikkim, Western Ghats, Kerala backwaters).
  - Automatically assesses **Ghat Landslide Risk**, **Flash Flood Advisories**, and **Severe Thunderstorm Suspensions** (ropeways, rafting, paragliding), issuing preemptive route warnings before departure.

### 🔍 USP 5: The Hybrid Offbeat & "Hidden Gem" Engine (Approaches B + C)
* **The Traditional Flaw**: Mainstream apps only push top-10 commercial tourist traps (Baga beach, Mall road) which are suffocated with crowds.
* **The TRIP//OS Moat**:
  - Combines **Generative AI Contextual Prompting (Gemini)** with **OpenStreetMap / Nominatim Geo-Verification**.
  - Enforces low-crowd constraints ($\text{crowd\_level} \le 30\%$, $\text{rating} \ge 4.4$) to discover secret waterfalls, uncommercialized coves, and heritage artisan quarters with verified coordinates and local context.

### 🏔️ USP 6: The "Zero-Connectivity" Offline Sync & Emergency Safety Pack
* **The Traditional Flaw**: Cloud-only travel apps freeze and become useless the moment travelers enter high-altitude passes or deep valleys where 4G/5G drops to zero.
* **The TRIP//OS Moat**:
  - Pre-departure 1-click generation of a standalone, offline-ready package (`GET /api/trips/:id/offline-pack`).
  - Bundles the full day-by-day itinerary, hospital and police GPS waypoints, regional disaster cells (1070, NDRF 1078, Manali/Spiti Mountain Rescue), group emergency roster, and a 5-point remote mountain survival SOS protocol for 100% offline access via IndexedDB/Localforage.

### ⚡ USP 7: Step 8 Auto-Repair Disruption Engine
* **The Traditional Flaw**: When it pours rain on Day 2, the schedule is ruined, leaving the group stranded in a hotel lobby arguing over what to do.
* **The TRIP//OS Moat**:
  - The autonomous replanning engine detects disruptions (`HEAVY_RAIN`, `ROAD_BLOCKED`, `VENUE_CLOSED`) via AI alert parsing or sensor inputs.
  - Automatically hot-swaps outdoor activities for verified high-rated indoor cultural centers, museums, or cafes without breaking the day's timeline, incrementing version control with an explainable changelog.

### 📸 USP 8: Collaborative Google Drive Albums, Member Private Dumps & Instant QR Code Sharing
* **The Traditional Flaw**: Group trip photos end up scattered across WhatsApp chats where image resolution is heavily compressed, unorganized, or permanently lost when members run out of phone storage. There is no distinction between group memories and personal raw photo dumps.
* **The TRIP//OS Moat**:
  - **Group Leader Shared Album**: The trip leader initializes or links a Google Drive album directly from TRIP//OS.
  - **Universal Member Accessibility**: Instantly rendered on every approved group member's interface with real-time photo counts, uploader attributions, and a direct Google Drive launch link.
  - **Auto-Generated High-Contrast QR Code**: Dynamically generates high-resolution Base64 QR codes so anyone can point their smartphone camera at the screen or printed itinerary to immediately open the album and tap "+" to upload photos from their phone gallery.
  - **Member Private Image Dumps**: Any approved member can create their own private photo dump saved as a separate Google Drive folder. Each private dump generates its own **dedicated, shareable QR code**, giving members full control to back up high-res personal shots or share privately with select friends.

---

## 3. Core Systems & Algorithmic Engines

### System 1: Authentication & User Profile Management
- **Supabase Auth Integration**: User registration and login generate industry-standard JWT access tokens.
- **Automated PostgreSQL Sync**: Supabase Auth user creation triggers an automated PostgreSQL function (`public.handle_new_user()`) that maintains the `public.users` table without extra application-layer latency.
- **Protected Endpoints**: Verified via `authMiddleware` inspecting the `Authorization: Bearer <token>` header.

### System 2: Trip & High-Entropy Invite Code Engine
- **Temporal State Modeling**: Trips are modeled with exact start dates, start times, start locations, end dates, end times, and transport modes (`CAR`, `CAB`, `BUS`, `TRAIN`, `FLIGHT`).
- **Readable Invite Codes**: Trips automatically generate readable codes like `TRIP-7X92K` using a collision-resistant character alphabet excluding ambiguous characters (`0/O`, `1/I`).
- **Creator Autonomy**: The user who creates the trip is automatically assigned the `LEADER` role with `APPROVED` status.

### System 3: Group Membership & Approval Workflow
- **Join Requests**: Friends join using the trip invite code; their status is set to `PENDING`.
- **Leader Approval**: Only the trip leader can view pending join requests and approve or reject prospective members.
- **RBAC Guards**: Access to sensitive trip operations is guarded by `requireTripLeader` and `requireTripMember` middlewares.

### System 4: 9-Dimensional Vibe Profiling & Group DNA Engine
- Each member submits a Vibe Profile scored from 0 to 100 across 9 dimensions:
  1. `adventure`
  2. `nature`
  3. `food`
  4. `photography`
  5. `nightlife`
  6. `relaxation`
  7. `budgetSensitivity`
  8. `walkingTolerance`
  9. `crowdTolerance`
- **Group DNA Aggregation**: The engine calculates mathematical group averages, providing both raw floating-point values for computation and rounded integer values for UI rendering.

### System 5: Constraints & Deal-Breakers Engine
- Members can submit personalized constraints under 3 strict classifications:
  - `MUST_GO`: Highlights activities or destinations that a member is passionate about.
  - `DONT_WANT`: Preferences the group prefers to avoid.
  - `DEAL_BREAKER`: Strict prohibitions (e.g., "High-altitude trekking", "Pork", "Extreme Walking").

### System 6: Step 5D — Explainable Destination Scoring Engine
- Evaluates candidate destinations against the Group DNA:
  - **Component Scores**: Detailed mathematical breakdown of each dimension (`nature`, `adventure`, `food`, etc.).
  - **Walking & Crowd Fit**: Evaluated using delta deviation:  
    $$\text{walkingFit} = \max(0, 100 - |\text{dna.walkingTolerance} - \text{dest.walking\_requirement}|)$$
  - **Explainable "Why"**: Generates transparent reasons (e.g. *"Strong match for your group's Nature preference"*).
  - **Warnings**: Flags potential friction points (e.g. *"Walking requirements may not suit everyone"*).
  - **Deal-Breaker Elimination**: Any destination matching a member's `DEAL_BREAKER` is marked `status: "REJECTED"` with explicit `rejectionReasons`.

### System 7: Live Weather & External Place Discovery
- **Open-Meteo Integration**: Fetches real-time temperature, condition codes, wind speed, and precipitation probability for any coordinates without requiring API keys.
- **External Search**: Integrates OpenStreetMap / Nominatim to search any global or Indian destination.

### System 8: 45+ Popular Indian Tourist Cities Dataset
- Comprehensive curated knowledge base of 45+ top Indian cities across 20+ states with full coordinates, dimensional scores, and tags.
- Includes filtering by vibe (`?vibe=adventure`), state (`?state=Uttarakhand`), tags, crowd limits, and budget scores.

### System 9: Natural Disaster & Environmental Route Alert Engine
- Continuously monitors destination risks:
  - **Landslide Warnings**: Triggered when heavy rainfall affects Himalayan/Western Ghats corridors.
  - **Flash Flood Advisories**: Triggered by high precipitation in coastal/river basin destinations.
  - **Severe Thunderstorms**: High winds and lightning alerts.
- Provides actionable safety recommendations and route hazard warnings.

### System 10: Smart Journey Timing & Transit Fatigue Engine ("Time to Begin Journey")
- Calculates distance between origin and destination using the Haversine formula.
- Calculates transit durations across `CAR`, `CAB`, `BUS`, `TRAIN`, and `FLIGHT`.
- Detects city rush hour windows (08:00 - 10:00, 17:00 - 20:00).
- Applies safety buffers (30 - 90 mins) based on terrain and weather.
- Recommends the exact **Optimal Departure Time** and departure date (accounting for overnight journeys).
- **Transit Fatigue Index (TFI)**: Evaluates transit strain based on mode multiplier (Bus 1.45x, Car 1.25x, Train 0.70x, Flight 0.40x), overnight red-eye penalties (+25 pts), and long-distance road factors. Categorizes arrival states into `EXTREME`, `MODERATE`, and `LOW` fatigue with recommended recovery windows (up to 4.5 hours).

### System 11: Dynamic Itinerary Compiler (Step 7)
- Compiles balanced multi-day itineraries matching Group DNA with Morning (09:00 - 12:00), Afternoon (13:30 - 16:30), and Evening (18:00 - 21:00) slots.
- **Adaptive Day 1 Recovery Pacing**: Dynamically reads the Transit Fatigue Index (TFI). For high-exhaustion arrivals (e.g. 12hr overnight bus/car arriving at 05:30 AM), Day 1 morning is designated as a mandatory **Hotel Rest, Nap & Recovery Window** (`walking_intensity: 0`), scheduling gentle rooftop brunch and sunset strolls in the afternoon, while deferring strenuous adventure and hiking activities to Day 2 when the group is refreshed.
- Flags each activity with `indoor_outdoor`, `weather_dependent`, `walking_intensity`, and `estimated_cost`.

### System 12: Disruption & Automatic Replanning Engine (Step 8)
- Intentionally simulates or receives real disruption signals (`HEAVY_RAIN`, `ROAD_BLOCKED`, `VENUE_CLOSED`).
- **Auto-Repair**:
  - Replaces outdoor activities with high-rated indoor cultural, museum, or cafe alternatives.
  - Reschedules delayed departures.
  - Increments itinerary `version` and outputs an explainable change diff.

### System 13: Group Consensus & Anonymous Voting
- Members can vote (`YES`, `NO`, `FAVORITE`) on proposed destinations or itinerary activities.
- Tallies total votes and displays consensus percentages.

### System 14: Security Hardening & Production Polish
- `helmet`: Sets HTTP security headers (CSP, HSTS, X-Frame-Options).
- `cors`: Handles cross-origin requests.
- `express-rate-limit`: Prevents brute-force on auth routes (30 requests/15m) and DDoS on API routes (300 requests/15m).
- Centralized error handler normalizing errors and preventing stack trace exposure.

### System 15: Collaborative Google Drive Albums, Member Private Dumps & QR Generator (Step 9)
- **Role-Gated Shared Folder**: The trip leader initializes or links the group Google Drive folder (`POST /api/trips/:id/drive-folder`).
- **Dynamic High-Contrast QR Code**: The backend generates base64 PNG Data URLs (`data:image/png;base64,...`) and SVG strings for the Google Drive folder link, allowing members or friends to scan the screen with their phone camera to jump directly into the folder in Google Drive.
- **Universal Member Accessibility**: All approved members can query folder stats, total photos uploaded, active Drive links, and recent thumbnails (`GET /api/trips/:id/drive-folder`).
- **Member Private Image Dumps**: Any approved member can create their own private photo dump saved as a separate Google Drive folder (`POST /api/trips/:id/drive-folder/private-dumps`). Each private dump generates its own **dedicated, shareable QR code** and Drive link, allowing individual members to selectively share personal raw photos or keep private memories isolated.
- **In-App Upload & Metadata Tracking**: Members can upload or register photos directly into the group album or their private dumps (`POST /api/trips/:id/drive-folder/upload` or `POST /api/trips/:id/drive-folder/private-dumps/:dumpId/upload`) with uploader attribution, captions, and file metadata.

---

## 4. Complete API Endpoint Catalog

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/auth/register` | Public | Register new user via Supabase Auth + Postgres |
| `POST` | `/api/auth/login` | Public | Login and obtain JWT access token |
| `GET` | `/api/auth/me` | Bearer | Get authenticated user info and profile |

### Trips & Membership (`/api/trips`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/trips` | Bearer | Create a new trip with auto invite code |
| `GET` | `/api/trips` | Public | List all trips with member count |
| `GET` | `/api/trips/:id` | Public | Get trip by ID with member roster |
| `GET` | `/api/trips/:id/journey/timing` | Public | **Optimal Departure Engine**: Haversine road/air distances, transit comparisons, optimal departure time |
| `GET` | `/api/trips/:id/alerts` | Public | Real-time meteorological disaster & hazard assessment |
| `GET` | `/api/trips/:id/offline-pack` | Public | **Offline Sync & Emergency Safety Pack**: Standalone compressed bundle with emergency numbers (112, mountain rescue, state cells), SOS action guides, offline waypoints, and IndexedDB sync keys |
| `PATCH` | `/api/trips/:id` | Bearer Token | Update trip details (Leader only) |
| `DELETE` | `/api/trips/:id` | Bearer | Delete trip (Leader only) |
| `POST` | `/api/trips/join` | Bearer | Join trip using `inviteCode` |
| `GET` | `/api/trips/:id/members` | Bearer | View trip members (Leader sees pending) |
| `PATCH` | `/api/trips/:id/members/:memberId/approve` | Bearer | Leader approves pending join request |

### Vibe Profile & Group DNA (`/api/trips/:id`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/trips/:id/preferences` | Bearer | Upsert 9-dimension Vibe Profile |
| `GET` | `/api/trips/:id/preferences` | Bearer | Get all approved members' Vibe Profiles |
| `GET` | `/api/trips/:id/group-dna` | Bearer | Calculate averaged Group DNA |
| `POST` | `/api/trips/:id/constraints` | Bearer | Add member constraint (`MUST_GO`, `DONT_WANT`, `DEAL_BREAKER`) |
| `GET` | `/api/trips/:id/constraints` | Bearer | Retrieve all trip constraints |

### Destinations & Discovery (`/api/destinations` & `/api/trips/:id`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/trips/:id/destinations/recommend` | Bearer | **Step 5D Explainable Ranked Recommendations** |
| `GET` | `/api/destinations` | Public | List all destinations stored in database |
| `GET` | `/api/destinations/cities` | Public | **List 45+ Indian tourist cities with vibe, state, crowd, budget filters** |
| `GET` | `/api/destinations/search?q=...` | Public | Search places across Indian cities and external maps |
| `GET` | `/api/destinations/:id/weather` | Public | Real-time weather via Open-Meteo |
| `GET` | `/api/destinations/:id/disaster-risk` | Public | Real-time meteorological disaster & hazard assessment (landslides, ghats, floods). |
| `GET` | `/api/destinations/:id/hidden-gems` | Public | **Hybrid Engine (B + C)**: Discovers less popular, secluded, and authentic offbeat spots verified via OpenStreetMap / Nominatim with AI-curated context and low-crowd filter (`maxCrowd`). |
| `POST` | `/api/destinations/sync-all-cities` | Public | Seeds all 43+ top Indian tourist cities directly into PostgreSQL database. |

### Dynamic Itinerary & Replanning (`/api/trips/:id`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/trips/:id/itinerary/generate` | Bearer | **Compile dynamic multi-day itinerary matching Group DNA** |
| `GET` | `/api/trips/:id/itinerary` | Bearer | Get full itinerary with days and activities |
| `POST` | `/api/trips/:id/itinerary/activities` | Bearer | Add custom activity to day |
| `PATCH` | `/api/trips/:id/itinerary/activities/:activityId` | Bearer | Update activity time or cost |
| `DELETE` | `/api/trips/:id/itinerary/activities/:activityId` | Bearer | Remove activity from itinerary |
| `POST` | `/api/trips/:id/disruptions/report` | Bearer | Report disruption & automatically trigger replan |
| `POST` | `/api/trips/:id/disruptions/simulate` | Bearer | **One-click disruption demo simulation** |
| `GET` | `/api/trips/:id/disruptions` | Bearer | Disruption and resolution audit history |

### Consensus Voting (`/api/trips/:id/votes`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/trips/:id/votes` | Bearer | Cast vote (`YES`, `NO`, `FAVORITE`) on destination or activity |
| `GET` | `/api/trips/:id/votes/results` | Bearer | Tally votes and consensus percentage |

### Collaborative Google Drive Album & Member Private Dumps (`/api/trips/:id/drive-folder`)
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/trips/:id/drive-folder` | Leader (Bearer) | **Create or link Group Google Drive album & generate group QR code** |
| `GET` | `/api/trips/:id/drive-folder` | Member (Bearer) | **View group album, Drive URL, scannable QR code, and photo stats** |
| `DELETE` | `/api/trips/:id/drive-folder` | Leader (Bearer) | Unlink or remove group Google Drive album |
| `POST` | `/api/trips/:id/drive-folder/upload` | Member (Bearer) | **Upload/register photo to group shared album** with uploader metadata |
| `GET` | `/api/trips/:id/drive-folder/photos` | Member (Bearer) | List all shared photos uploaded to the group album |
| `POST` | `/api/trips/:id/drive-folder/private-dumps` | Member (Bearer) | **Create personal Private Image Dump with dedicated shareable QR code** |
| `GET` | `/api/trips/:id/drive-folder/private-dumps` | Member (Bearer) | List member's own private image dumps with photo counts |
| `GET` | `/api/trips/:id/drive-folder/private-dumps/:dumpId` | Member (Bearer) | Retrieve specific private dump details, photos, and dedicated QR code |
| `POST` | `/api/trips/:id/drive-folder/private-dumps/:dumpId/upload` | Member (Bearer) | Upload photo directly to member's private image dump |
| `DELETE` | `/api/trips/:id/drive-folder/private-dumps/:dumpId` | Member (Bearer) | Delete personal private image dump |

### System Health
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/health` | Public | Health status, timestamp, and version |
| `GET` | `/api/db-test` | Public | Live PostgreSQL connectivity check |
