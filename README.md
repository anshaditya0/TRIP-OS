# 🗺️ TRIP//OS — Autonomous Group Travel Operating System

> **“Plans change. Your itinerary shouldn't have to fall apart.”**

**TRIP//OS** is a specialized full-stack group travel decision, intelligence, and automatic replanning engine designed to eliminate the chaos of group trips. Built with a high-performance **Node.js/Express layered backend**, **PostgreSQL on Supabase**, and a sleek **editorial dark-glassmorphic React TypeScript frontend**, TRIP//OS replaces messy group chats and static directories with an autonomous operating system for stress-free travel.

---

## ⚡ System Status & Health Audit

Both the backend and Supabase PostgreSQL database are **100% verified and operational**:

| Layer | Technology | Status | Details |
|---|---|:---:|---|
| **Database** | PostgreSQL (Supabase AWS ap-south-1) | `HEALTHY` | **14/14 relational tables verified** with zero connection errors |
| **Backend API** | Node.js + Express (Port `5000`) | `ONLINE` | Layered MVC, Auth middleware, Rate-limiting, XAI Scoring |
| **Frontend UI** | React 18 + TypeScript + Vite (Port `3000`) | `ONLINE` | Glassmorphic aesthetic, reverse-proxied to `:5000`, interactive modals |
| **Badge Engine** | Rule-based Indian Travel Allocator | `ACTIVE` | Geographic & itinerary verification, auto-claims to DB |

---

## 🏆 9 Flagship USPs & Competitive Moats

TRIP//OS is engineered with rare, production-grade moats that traditional travel apps (MakeMyTrip, TripAdvisor, Google Trips) do not offer:

### 💎 1. Step 5D Explainable Consensus & Mathematical "Group DNA"
- Every group member submits an independent 9-dimensional preference vector (`adventure`, `nature`, `nightlife`, `food`, `photography`, `relaxation`, `budget`, `walking`, `crowd`).
- The engine synthesizes a unified **Group DNA** with Explainable AI (**XAI**) breakdowns—not just giving recommendations, but exposing audited `componentScores`, `why` tags, and warning flags.

### 🚫 2. Absolute "Deal-Breaker" Hard Elimination
- Implements a 3-tier constraint hierarchy (`MUST_GO`, `DONT_WANT`, `DEAL_BREAKER`).
- Any venue or route violating a member’s hard constraints (e.g., severe asthma walking limits, dietary rules, altitude thresholds) is mathematically eliminated with transparent explanation.

### ⏰ 3. Smart Journey Timing & Transit Fatigue Recovery Engine (TFI)
- Operates on the thesis: *"The trip begins when you leave, not when you arrive."*
- Uses the Haversine Great-Circle formula + surface road speed vectors across 5 modes (`CAR`, `CAB`, `BUS`, `TRAIN`, `FLIGHT`).
- Evaluates city rush-hour windows (08:00–10:00 & 17:00–20:00), applies mountain buffers, and determines the **Optimal Departure Time**.
- **Transit Fatigue Index (TFI 0–100)**: Evaluates physical transit strain with mode friction multipliers and overnight red-eye penalties (+25 pts). Day 1 automatically schedules mandatory hotel rest and recovery buffers, deferring strenuous treks to Day 2 to prevent burnout.

### 🛡️ 4. Proactive Natural Hazard Radar & Landslide Shield
- Cross-references real-time satellite meteorology (Open-Meteo) with Indian topographical vulnerability maps (Uttarakhand, HP, J&K, Sikkim, Western Ghats, Kerala backwaters).
- Issues proactive alerts for **Ghat Landslide Risk**, **Flash Flood Advisories**, and **Severe Weather Suspensions** (ropeways, paragliding, rafting).

### 🔍 5. Hybrid Offbeat & "Hidden Gem" Discovery Engine
- Pairs contextual intelligence with OpenStreetMap/Nominatim geo-verification.
- Enforces strict low-crowd constraints ($\text{crowd\_level} \le 30\%$, $\text{rating} \ge 4.4$) to unearth uncommercialized waterfalls, secluded coves, and heritage artisan hamlets.

### 🏔️ 6. Zero-Connectivity Offline Sync & SOS Safety Pack
- One-click pre-departure download (`GET /api/trips/:id/offline-pack`).
- Bundles full day-by-day itineraries, offline hospital/police GPS waypoints, regional disaster cells (1070, NDRF 1078, Mountain Rescue), and a 5-step mountain survival protocol cached for offline survival.

### ⚡ 7. Auto-Repair Disruption Replanning Engine
- Detects or simulates real-time disruptions (`HEAVY_RAIN`, `ROAD_BLOCKED`, `VENUE_CLOSED`).
- Autonomously swaps outdoor plans for verified indoor cultural centers, museums, or cafes without breaking the group's timeline, saving a version-controlled diff.

### 📸 8. Collaborative Google Drive Albums, Private Dumps & QR Vault
- Trip leaders initialize shared Google Drive albums directly within TRIP//OS.
- Dynamic high-contrast QR codes render instantly so anyone can point their smartphone camera to jump directly into the Drive folder and upload uncompressed photos.
- Approved members can also create **Personal Private Dumps** with their own dedicated, shareable QR codes.

### 🏅 9. Indian Travel Badge & Collectible Allocation Engine
- Rule-based badge system evaluating destination geography and trip characteristics:
  - 🏔️ **Himalayan Summiteer**: Awarded for mountain expeditions (Himachal, Uttarakhand, Ladakh, Sikkim).
  - 🌊 **Ocean Conqueror**: Awarded for coastal and island voyages (Goa, Kerala, Andaman).
  - 👑 **Royal Heritage Rover**: Awarded for historical forts and palaces (Rajasthan, Madhya Pradesh).
  - 🌿 **Mist Valley Rover**: Awarded for tea plantations and hill stations (Coorg, Ooty, Munnar).
  - 🛣️ **Grand Expeditioner**: Awarded for multi-day road trips covering 500+ km.
  - 🛡️ **All-Weather Nomad**: Awarded for completing journeys through dynamic route disruptions.
- Fully synchronized with the PostgreSQL database table `public.user_badges` and displayed in the frontend profile and itinerary.

---

## 🏛️ Architecture & Folder Structure

```
TRIP OS/
├── backend/
│   ├── sql/                         # Database migrations (Badges, Drive, Core)
│   ├── src/
│   │   ├── config/                  # DB connection pool, Supabase client, env loader
│   │   ├── controllers/             # Express controllers (auth, trip, badge, drive, etc.)
│   │   ├── data/                    # 45+ Curated Indian destinations dataset
│   │   ├── middleware/              # Auth, RBAC, Rate-limiting, Central error handler
│   │   ├── routes/                  # Express domain routers
│   │   ├── services/                # Algorithmic engines (Group DNA, TFI, Badges, Disruptions)
│   │   ├── utils/                   # QR code generation, logging, verification scripts
│   │   ├── app.js                   # Main Express application definition
│   │   └── server.js                # Server entry point (Port 5000)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Interactive UI components (ProfilePage, SavesPage, Plans, etc.)
│   │   │   └── plans/               # Itinerary views, Modals (SOS, Auto-Repair, QR, Badges)
│   │   ├── services/                # Backend API client (api.ts) with offline normalization
│   │   ├── App.tsx                  # Main app navigation & state
│   │   └── main.tsx
│   ├── server.ts                    # SSR / Proxy server forwarding /api -> :5000
│   ├── vite.config.ts               # Vite bundler with reverse proxy
│   └── package.json
│
├── backend_complete_report.md       # Full architectural master report
└── README.md
```

---

## 📊 Database Schema (Supabase PostgreSQL)

The database schema is fully structured into 14 audited tables:

```
                          ┌──────────────────────────┐
                          │       auth.users         │
                          └─────────────┬────────────┘
                                        │
                                        ▼
                          ┌──────────────────────────┐
                          │       public.users       │
                          └───────┬──────────┬───────┘
                                  │          │
         ┌────────────────────────┘          └───────────────────────┐
         ▼                                                           ▼
┌──────────────────┐                                        ┌──────────────────┐
│   public.trips   │◀────[ trip_members ]───────────────────│ public.user_badges│
└────────┬─────────┘                                        └──────────────────┘
         │
         ├───▶ public.preferences (9D Vibe profiles)
         ├───▶ public.constraints (MUST_GO, DONT_WANT, DEAL_BREAKER)
         ├───▶ public.itineraries ───▶ public.itinerary_days ───▶ public.itinerary_activities
         ├───▶ public.trip_disruptions (Disruption audit trail)
         ├───▶ public.trip_votes (Consensus polling)
         └───▶ public.trip_drive_folders ───▶ public.trip_photos
```

---

## 🔌 API Reference Catalog

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user via Supabase Auth + Postgres
- `POST /api/auth/login` — Login and obtain JWT access token
- `GET /api/auth/me` — Get authenticated user info and profile

### Trips & Membership (`/api/trips`)
- `POST /api/trips` — Create new trip with auto-generated invite code
- `GET /api/trips` — List all trips with member counts
- `GET /api/trips/:id` — Get trip details and member roster
- `GET /api/trips/:id/journey/timing` — **Optimal Departure Engine & TFI**
- `GET /api/trips/:id/alerts` — Real-time meteorological hazard assessment
- `GET /api/trips/:id/offline-pack` — **Zero-Connectivity Emergency SOS Bundle**
- `POST /api/trips/join` — Join trip via invite code
- `PATCH /api/trips/:id/members/:memberId/approve` — Leader approves pending join request

### Badges & Travel Achievements (`/api/badges`)
- `GET /api/badges/rules` — List all unlockable travel badges and eligibility criteria
- `GET /api/badges/my-badges` — Fetch all earned badges for the current user
- `POST /api/badges/claim` — Claim an eligible travel badge with auto-sync to Supabase
- `POST /api/badges/evaluate-trip` — Evaluate a completed trip to award matching badges

### Destinations & Discovery (`/api/destinations`)
- `GET /api/destinations/cities` — 45+ top Indian tourist cities with vibe, state, and crowd filters
- `GET /api/destinations/:id/weather` — Real-time weather data (Open-Meteo)
- `GET /api/destinations/:id/disaster-risk` — Proactive Landslide and Hazard Radar
- `GET /api/destinations/:id/hidden-gems` — Hybrid Offbeat Discovery Engine

### Dynamic Itinerary & Auto-Repair (`/api/trips/:id`)
- `POST /api/trips/:id/itinerary/generate` — Compile dynamic itinerary from Group DNA
- `GET /api/trips/:id/itinerary` — Get full itinerary with days and activities
- `POST /api/trips/:id/disruptions/simulate` — **One-click disruption simulation & auto-repair**
- `POST /api/trips/:id/disruptions/report` — Report disruption and trigger automated replanning

### Drive Albums & QR Vault (`/api/trips/:id/drive-folder`)
- `POST /api/trips/:id/drive-folder` — Initialize shared Google Drive album & generate QR code
- `GET /api/trips/:id/drive-folder` — View group album, live QR code, and photo counts
- `POST /api/trips/:id/drive-folder/private-dumps` — Create personal private dump with dedicated QR
- `POST /api/trips/:id/drive-folder/upload` — Upload/register photo to shared album

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **npm**: v9+
- **Supabase Account**: With PostgreSQL connection string and anon/service keys

### 2. Environment Configuration
Create a `.env` file in the root or `backend/` directory:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your-jwt-secret-key
```

### 3. Start Backend Server
```bash
cd backend
npm install
node src/server.js
```
*Backend runs on `http://localhost:5000` with automated database schema synchronization.*

### 4. Start Frontend Application
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
*Frontend runs on `http://localhost:3000` with reverse proxy forwarding `/api` to port `5000`.*

---

## 📦 Pushing to GitHub Manually

To push this repository to GitHub under the name **TRIP OS**:

1. **Initialize Git**:
   ```bash
   git init
   git branch -M main
   ```

2. **Stage files and commit**:
   ```bash
   git add .
   git commit -m "feat: complete TRIP//OS fullstack group travel OS with database, backend, and frontend"
   ```

3. **Link to your GitHub repository**:
   ```bash
   # Replace <username> with your GitHub username:
   git remote add origin https://github.com/<username>/TRIP-OS.git
   ```

4. **Push**:
   ```bash
   git push -u origin main
   ```

*(Sensitive credentials in `.env` and `node_modules` are protected by `.gitignore`.)*

---

## 📄 License
TRIP//OS is built for intelligent, safe, and collaborative group travel. All rights reserved.
