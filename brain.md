# BETADRiX — Master Architecture & Project Brain (`brain.md`)

> **Authoritative Technical Blueprint, System Architecture & Developer Knowledge Base**  
> *Last Updated: September 2026*  
> *Platform: BETADRiX Demo Gaming & Casino Platform*

---

## 1. Executive Overview & System Identity

**BETADRiX** is a modern, high-performance, dark-mode crypto-casino and tactical gaming demo web application. Built on top of **Next.js 16 (App Router)** and **React 19**, it delivers an ultra-smooth, responsive desktop and mobile gaming experience featuring interactive games, live real-time activity feeds, dynamic player wallets, VIP tier progression, promotional engines, and a comprehensive role-protected administrative backoffice.

### Core Architectural Pillars
- **Zero-Friction Dual-Mode Persistence**: Seamlessly switches between a production PostgreSQL database (`pg` connection pool) and an autonomous in-memory/JSON filesystem storage engine (`.data/`) whenever external databases are unconfigured.
- **Embedded & Standalone Game Launch Shell**: Modular iframe sandboxing system capable of embedding third-party provider titles (Turbo Games, Spribe) and standalone custom applications (e.g. authoritative physics-based Plinko on Render).
- **HMAC Cryptographic Security Layer**: Constant-time HMAC-SHA256 signed session tokens with server-side revocation versions for administrators, paired with bcrypt-hashed credentials and strict role segregation.
- **Live Real-Time Activity & Streaming Hub**: In-memory pub/sub event bus streaming live bets, payouts, user balance synchronizations, and system alerts via Server-Sent Events (SSE) and HTTP fallback channels.
- **Mobile-First Cyberpunk UI/UX**: Polished Tailwind CSS v4 design system with glassmorphism, dynamic marquee tickers, hero banner carousels, modal flows, and an intuitive 5-item mobile bottom navigation bar.

---

## 2. Technology Stack & Core Dependencies

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.5 (App Router) | High-performance React server/client framework with hybrid SSR & Route Handlers |
| **Runtime & UI** | React 19.2.8 & React DOM | Latest concurrent UI rendering library |
| **Language** | TypeScript 5+ | End-to-end static typing across models, route handlers, and UI props |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`) | Modern CSS-first utility framework with custom tokens and dark aesthetic |
| **Database** | PostgreSQL (`pg` 8.23.0) + Local Mock Engine | Persistent relational data store with seamless fallback to `.data/*.json` |
| **Cryptography** | `bcryptjs` (3.0.3) + Native `node:crypto` | Secure password hashing and HMAC-SHA256 administrative token verification |
| **Icons & Design** | `lucide-react` (1.45.0) | Consistent iconography across navigation, admin controls, and game actions |
| **Class Utilities** | `clsx` & `tailwind-merge` | Conditional class composition and utility collision resolution |
| **Deployment** | Render (`render.yaml`) | Automated Infrastructure-as-Code web service + managed PostgreSQL database |

---

## 3. Repository Directory Structure

```plaintext
├── .data/                      # Local JSON storage fallback (when DATABASE_URL is not set)
│   ├── users.json              # Mock users & balances
│   ├── game_configs.json       # Dynamic game enablement and URLs
│   ├── site_config.json        # Site metadata, support links
│   └── audit_logs.json         # Administrative and balance change logs
├── public/                     # Static assets, hero banners, game thumbnails, badges
│   └── assets/
│       ├── games/              # Game cover cards (mines, plinko, dice, roulette)
│       └── ui/                 # Game UI previews and visual overlays
├── scripts/                    # Automated testing and validation utilities
│   ├── test-admin-security.js  # Security test harness for admin auth & endpoint gating
│   └── test-realtime-admin.js  # Integration test for SSE streams and realtime event triggers
├── src/
│   ├── app/                    # Next.js App Router root
│   │   ├── admin/              # Complete Backoffice suite
│   │   │   ├── activity/       # Real-time dummy activity & live bets management
│   │   │   ├── audit/          # Security & administrative action logs
│   │   │   ├── bonus/          # Bonus configurations & deposit match rules
│   │   │   ├── dashboard/      # Primary admin KPI overview & quick controls
│   │   │   ├── games/          # Provider & game launch URL management
│   │   │   ├── general/        # System configuration & site maintenance toggles
│   │   │   ├── promotions/     # Promotional campaign banners & promo codes
│   │   │   ├── support/        # Support ticket review & contact links
│   │   │   ├── system/         # Server environment, health & logs
│   │   │   ├── users/          # Player account management & balance adjustments
│   │   │   ├── vip/            # VIP loyalty tiers & rewards manager
│   │   │   └── wallet/         # Global transaction auditing
│   │   ├── api/                # REST & SSE API Route Handlers
│   │   │   ├── activity/       # Live bets public stream
│   │   │   ├── admin/          # Admin backoffice endpoints (protected by HMAC token)
│   │   │   ├── auth/           # Player registration, login, logout, and session check
│   │   │   ├── bonus/          # Bonus claims and status endpoints
│   │   │   ├── config/         # Public configuration endpoint (site info, links)
│   │   │   ├── games/          # Game catalog and resolved launch URLs
│   │   │   ├── promotions/     # Public active promotions
│   │   │   ├── realtime/       # SSE streaming endpoint (`/api/realtime/events`)
│   │   │   └── vip/            # Public VIP tier progression
│   │   ├── bonus/              # User-facing Bonus & Rewards screen
│   │   ├── casino/             # Casino lobby & categorized game grid
│   │   ├── fair/               # Provably Fair explanation & verification guide
│   │   ├── games/[id]/         # Dynamic game launcher page with launch shell
│   │   ├── promotions/         # User promotions showcase page
│   │   ├── sign-in/            # Standalone sign-in page (also accessible via modal)
│   │   ├── sign-up/            # Standalone sign-up page (also accessible via modal)
│   │   ├── support/            # Customer support & social community portal
│   │   ├── vip/                # VIP Club loyalty tiers progression page
│   │   ├── globals.css         # Global Tailwind v4 styles, theme colors, animations
│   │   ├── layout.tsx          # Root platform shell, header, sidebar, footer & providers
│   │   ├── middleware.ts       # Global routing middleware
│   │   └── page.tsx            # Main landing page (hero slider, game carousel, live feed)
│   ├── components/             # Reusable UI component architecture
│   │   ├── admin/              # Backoffice UI (AdminNav, StatsCards, UserModal, etc.)
│   │   ├── auth/               # AuthModal (Sign In / Sign Up popup modal)
│   │   ├── casino/             # CategoryFilters, GameCard, SearchBar
│   │   ├── games/              # GameLaunchShell (fullscreen, iframe sandbox, status bar)
│   │   ├── landing/            # HeroBannerCarousel, LiveActivityTable, ProviderMarquee
│   │   ├── layout/             # Header, Sidebar, MobileNav, Footer
│   │   ├── ui/                 # Core atoms: Modal, Button, Toast, Input, Badge
│   │   └── wallet/             # DepositModal, WithdrawModal, BalanceDisplay
│   ├── config/                 # Static & baseline game/platform configurations
│   │   └── games.ts            # Master game registry, provider defaults, demo URLs
│   ├── context/                # Client state management contexts
│   │   ├── AuthContext.tsx     # Player session, credentials, modal controller
│   │   ├── FavoritesContext.tsx# Player favorite games synced to localStorage
│   │   ├── RealtimeContext.tsx # Live SSE stream subscriber & notification dispatcher
│   │   ├── UIContext.tsx       # Sidebar collapse, active modals, theme states
│   │   └── WalletContext.tsx   # Player balance, simulated deposit/withdraw actions
│   ├── data/                   # Mock seeds & fallback static data
│   │   └── mockActivity.ts     # Initial seed data for live activity
│   └── lib/                    # Core server & shared utilities
│       ├── adminSession.ts     # HMAC token generator, validator & cookie extractor
│       ├── captcha.ts          # Turnstile/hCaptcha verification helper (bypassable in demo)
│       ├── db.ts               # Master database adapter (PostgreSQL + Mock JSON fallback)
│       └── realtime.ts         # In-memory pub/sub EventEmitter for real-time broadcasts
├── .env.example                # Sample environment configuration template
├── AGENTS.md                   # Strict instructions for AI agents regarding Next.js 16 conventions
├── CLAUDE.md                   # Agent reference link to AGENTS.md
├── next.config.ts              # Next.js configuration (images, headers, security policies)
├── package.json                # Project dependencies, scripts, and build targets
└── render.yaml                 # Deployment specification for Render platform
```

---

## 4. Database Schema & Data Persistence

The data access layer is centralized in `src/lib/db.ts`. When `DATABASE_URL` is configured, it executes standard SQL queries against PostgreSQL using connection pooling (`pg.Pool`). If unconfigured (such as during local sandbox execution or offline development), it defaults automatically to an in-memory/JSON store under `.data/`.

### Core Database Entities

```mermaid
erDiagram
    USERS ||--o{ BALANCE_AUDIT_LOGS : "generates"
    ADMIN_USERS ||--o{ ADMIN_AUDIT_LOGS : "executes"
    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        numeric balance
        boolean is_active
        timestamp created_at
        timestamp last_activity
    }
    ADMIN_USERS {
        int id PK
        string admin_id UK
        string password_hash
        string role
        int session_version
        timestamp created_at
    }
    BALANCE_AUDIT_LOGS {
        int id PK
        int user_id FK
        numeric previous_balance
        numeric new_balance
        numeric change_amount
        string reason
        string admin_id
        timestamp created_at
    }
    ADMIN_AUDIT_LOGS {
        int id PK
        string admin_id
        string action
        string target_type
        string target_id
        json details
        timestamp created_at
    }
    GAME_CONFIGS {
        string id PK
        string name
        string provider
        string demo_url
        boolean is_enabled
        boolean is_active
        string maintenance_message
        timestamp updated_at
    }
    SITE_CONFIG {
        int id PK
        string site_name
        string telegram_url
        string whatsapp_url
        boolean maintenance_mode
        timestamp updated_at
    }
    DUMMY_ACTIVITY {
        int id PK
        string username
        string game
        numeric payout_amount
        numeric multiplier
        timestamp created_at
    }
    VIP_TIERS {
        int id PK
        string tier_name
        numeric wager_requirement
        numeric cashback_percent
        numeric level_up_bonus
    }
    PROMOTIONS {
        int id PK
        string title
        string promo_code
        numeric bonus_percentage
        boolean is_active
        timestamp start_date
        timestamp end_date
    }
```

---

## 5. Security & Authentication Architecture

### 1. User Authentication
- **Mechanism**: Email/password credentials hashed with `bcryptjs` (salt rounds: 10).
- **Session Handling**: Session cookie `betadrix_session` stored as an HTTP-accessible cookie containing user profile data, validated against the database on critical mutations.
- **Client Access**: Centralized through `AuthContext.tsx`. Unauthenticated users attempting to play real-money modes or deposit are greeted by `AuthModal` without leaving their current page.

### 2. Administrator Authentication
- **Mechanism**: Strict HMAC-SHA256 signature verification.
- **Session Token**: `betadrix_admin_session` cookie formatted as:
  $$\text{token} = \text{base64url}(\text{payload}) \,.\, \text{HMAC-SHA256}_{\text{SESSION\_SECRET}}(\text{base64url}(\text{payload}))$$
  Where the payload includes:
  - `adminId`: Admin username identifier
  - `v`: Session version counter (for instant server-side revocation on logout)
  - `iat`: Issued-at timestamp
  - `exp`: Expiration timestamp (8 hours validity)
- **Validation**: Constant-time cryptographic comparison (`crypto.timingSafeEqual`) prevents timing attack vulnerabilities.
- **Route Guarding**: Helper `requireAdminAuth(request)` in `src/lib/adminSession.ts` validates every `/api/admin/*` endpoint. Unauthorized attempts immediately yield `401 Unauthorized` or `403 Forbidden`.

---

## 6. Game Integration & Launch Shell

The game catalog is defined in `src/config/games.ts` and managed dynamically via `/admin/games`.

### Active Game Titles
1. **Mines** (`mines`): Tactical risk-reward grid game provided by Turbo Games (`https://mines.turbogames.io/`).
2. **Plinko** (`plinko`): Authoritative physics-based game hosted on Render (`https://plinko-1-b1u5.onrender.com/embed`), with customizable row depths and risk coefficients.
3. **Dice** (`dice`): High-speed probability slider game provided by Turbo Games (`https://dice.turbogames.io/`).
4. **Roulette** (`roulette`): Mini European Roulette provided by Spribe (`https://demo.spribe.io/launch/mini-roulette?currency=EUR&lang=EN`).

### URL Resolution Hierarchy
When launching a game via `/games/[id]`, the launch URL is resolved using the following order of precedence:
```
1. Admin Dynamic Database Override (`game_configs.demo_url`)
   └── 2. Browser LocalStorage Override (`spyke_url_<gameId>`)
       └── 3. Environment Variable (`NEXT_PUBLIC_SPYKE_<GAME>_URL`)
           └── 4. Static Default Hardcoded URL (`games.ts`)
```

### Game Launch Shell Features (`GameLaunchShell.tsx`)
- **Sandboxed Iframe**: Enforces secure iframe sandbox attributes (`allow-scripts`, `allow-same-origin`, `allow-forms`, `allow-popups`, `allow-modals`).
- **Responsive Aspect Ratios & Fullscreen**: Custom fullscreen toggle using HTML5 Fullscreen API with automatic aspect ratio fitting.
- **Balance HUD Overlay**: Floating or integrated wallet widget displaying real-time balance changes without obstructing game controls.
- **Maintenance Shield**: Instantly renders a maintenance overlay if an admin disables the game from the backoffice.
- **Robust Loading Lifecycle & Multi-Signal Readiness**:
  - *Primary Readiness*: Native DOM `load` event listener and React synthetic `onLoad` remove the loading overlay immediately.
  - *Secondary Readiness*: Optional `PLINKO_READY` postMessage from the standalone client with strict origin validation (`https://plinko-1-b1u5.onrender.com`).
  - *Safety Fallback*: 9-second timeout gracefully catches network failures or cold starts, presenting a dedicated "Unable to load Plinko" screen with a direct "Open in Separate Tab" launcher.
  - *PostMessage Protocol*: Safely listens for `PLINKO_READY`, `PLINKO_STARTED`, and `PLINKO_RESULT` events exclusively from trusted origins.

---

## 7. Real-Time Event Hub & Live Activity

### Pub/Sub Event System (`src/lib/realtime.ts`)
- Utilizes an in-memory `EventEmitter` singleton on the server to distribute real-time events.
- Clients connect via **Server-Sent Events (SSE)** at `/api/realtime/events`.
- **Supported Event Types**:
  - `activity`: New live bet placed (username, game, multiplier, payout).
  - `balance`: Real-time user balance synchronization.
  - `game_config`: Instant notification when a game is enabled, disabled, or URL-updated.
  - `system_alert`: Global broadcast alerts (maintenance notices, jackpot drops).

### Realistic Live Activity Simulator
- To keep the platform dynamic, `src/lib/db.ts` houses a pool of **100 realistic player identities** (`DUMMY_USERS`).
- Background ticks generate simulated live bets across active games (Mines, Dice, Roulette, Plinko) with authentic multipliers ($0.00\times$ to $500\times$).
- The live ticker on the landing page updates smoothly with green highlights for winning bets and neutral badges for losses.

---

## 8. Admin Backoffice Suite (`/admin`)

The admin suite provides operational control over all casino systems:

| Admin Module | Route | Capabilities |
| :--- | :--- | :--- |
| **Dashboard** | `/admin/dashboard` | High-level metrics: total users, active balances, live bets count, quick actions |
| **User Manager** | `/admin/users` | Search, view player details, adjust balances, freeze/unfreeze accounts |
| **Game Manager** | `/admin/games` | Toggle game visibility, update iframe URLs, set maintenance notices |
| **Live Activity** | `/admin/activity` | Monitor, prune, or simulate live bets ticker entries |
| **Promotions** | `/admin/promotions` | Create promo codes, banner announcements, percentage match bonuses |
| **VIP Loyalty** | `/admin/vip` | Configure VIP levels (Bronze, Silver, Gold, Platinum, Diamond) and perks |
| **Bonus Engine** | `/admin/bonus` | Manage welcome bonuses, reload multipliers, and wagering requirements |
| **Audit Logs** | `/admin/audit` | Tamper-evident log of all admin operations and manual balance modifications |
| **General Settings**| `/admin/general` | Site title, customer support Telegram/WhatsApp handles, maintenance mode |

---

## 9. Environment Variables Reference

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | No | `postgresql://user:pass@localhost:5432/betadrix` | PostgreSQL connection string. Defaults to mock JSON store if omitted |
| `ADMIN_ID` | No | `admin` | Initial admin username |
| `ADMIN_PASSWORD` | Recommended | Random hex string | Initial admin password (check server console on boot if not set) |
| `ADMIN_SESSION_SECRET` | Recommended | Internal fallback string | 32+ character HMAC key for signing admin session tokens |
| `NEXT_PUBLIC_PLINKO_URL` | No | `https://plinko-1-b1u5.onrender.com/embed` | Standalone Plinko iframe embed URL |
| `NEXT_PUBLIC_SPYKE_MINES_URL` | No | `https://mines.turbogames.io/` | Mines provider launch URL |
| `NEXT_PUBLIC_SPYKE_DICE_URL` | No | `https://dice.turbogames.io/` | Dice provider launch URL |
| `NEXT_PUBLIC_SPYKE_ROULETTE_URL`| No | `https://demo.spribe.io/launch/...` | Roulette provider launch URL |

---

## 10. Developer Commands & Workflows

### Standard Lifecycle
```bash
# Start local development server (Turbo/Next.js)
npm run dev

# Run ESLint validation
npm run lint

# Compile and build production bundle
npm run build

# Start production server
npm start
```

### Security & Real-Time Test Harnesses
```bash
# Execute security test suite (verifies admin auth gating, HMAC verification, 401s)
npm run test:security

# Execute real-time test suite (verifies SSE stream connection and event dispatch)
npm run test:realtime
```

---

## 11. Important Conventions & Rules for AI Agents

1. **Next.js 16 Rules (`AGENTS.md`)**:
   - Always verify route conventions and server-side APIs before introducing breaking changes.
   - Do not remove or alter the Next.js agent block in `AGENTS.md`.
2. **Secrets & Security**:
   - **NEVER** expose `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, or `DATABASE_URL` under `NEXT_PUBLIC_*` prefixes.
   - All admin endpoints under `/api/admin/*` must call `requireAdminAuth(request)` at the very beginning of the handler.
3. **Database Parity**:
   - When modifying or adding tables in `src/lib/db.ts`, always implement matching handlers for both the **PostgreSQL Pool** and the **Mock Filesystem fallback**. Never break offline/mock operation.
4. **Styling & Aesthetics**:
   - Maintain the premium cyberpunk aesthetic: dark slate/zinc backgrounds (`#0B0E14`, `#121721`), vibrant neon accents (emerald `#10B981`, cyan, amber), crisp typography, and glassmorphic card borders (`border-white/5` to `border-white/10`).
