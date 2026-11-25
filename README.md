# ♠ Teen Patti Royale — Real-Money Style Gaming Platform (MVP)

A responsive, commercial-grade MVP web application for a real-stakes **Teen Patti Gaming Platform** built for client presentations and high-stakes social gaming demos.

Built using the foundational game engine, hand evaluator, and table UI principles from [`https://github.com/durjoyace/Social-Teen-Patti-Prototype`](https://github.com/durjoyace/Social-Teen-Patti-Prototype).

---

## 🚀 Live Demo Quick Credentials

On the **Login screen (`/login`)**, two **1-Click Instant Demo Access Cards** are prominently displayed:

| Role | Email / Identifier | Password | Starting Bankroll | Features & Access |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Super Admin** | `admin@teenpatti.com` | `admin123` | ₹100,000 | `/admin` Command Center, Investment KPIs, User Directory, Real-Time Balance Adjuster (`+ Add` / `- Deduct` / `Set`), Audit Trails |
| **🎮 Test Player** | `player@teenpatti.com` | `player123` | ₹15,450 | `/lobby`, 4 Real-Stakes Tables, Live Card Table (`/game/[tableId]`), Procedural Audio, Hand Evaluation, Profile & Wallet History (`/profile`) |

---

## 🌟 Key Platform Features

### 1. Strict Authentication & Role-Based Access Control
- **Zero Guest Play:** Unauthenticated visitors are automatically intercepted by Next.js middleware and redirected (`HTTP 307`) to `/login`. No player can view table action or place wagers without an active session token.
- **Role Enforcement:** Regular players attempting to access `/admin` are strictly blocked (`HTTP 403`). Only authenticated Super Admins can access administrative endpoints and views.

### 2. Live Bankroll & Strict Balance Enforcement
- **Prominent Balance Display:** The player's live account balance in **₹ INR** is permanently visible in the top navigation bar and on the game table.
- **Wager Validation:**
  - Table entry requires at least the table's minimum Boot amount.
  - Chaal (2x), Blind (1x), and Raise (2x–4x) actions are checked in real time against the player's wallet balance.
  - If funds are insufficient, betting buttons are locked and a deposit modal is triggered.
- **Simulated Real-Money Deposits:** Instant top-ups (₹500, ₹1,000, ₹2,500, ₹5,000, ₹10,000 or custom) via simulated UPI, Card, and NetBanking with instant wallet credits.

### 3. Authentic Teen Patti Game Table
- **Luxury Table Aesthetic:** Gold accents, emerald felt radial table, 3D ceramic chip stacks, dealer button, and active turn pulsing.
- **Authentic Hand Ranking Engine:**
  1. **Trail (Trio / Three of a Kind)** (e.g. A-A-A, K-K-K)
  2. **Pure Sequence (Straight Flush)** (e.g. A-K-Q, A-2-3 of same suit)
  3. **Sequence (Normal Run)** (e.g. 10-9-8 mixed suits)
  4. **Color (Flush)** (3 cards of same suit)
  5. **Pair** (2 cards of equal value)
  6. **High Card** (highest single card value)
- **AI Opponents with Personalities:**
  - **Sharma Ji:** Conservative player (plays tight, avoids reckless bluffs)
  - **Priya:** Balanced player (calculates pot odds, checks cards early)
  - **Bunty:** Aggressive player (frequent raises and high-stakes bluffs)
- **Procedural Casino Web Audio:** Custom Web Audio API procedural synthesizer for card deals, flips, chip clinks, win fanfares, and turn alerts with zero external audio assets required.
- **Victory Celebration:** Dynamic canvas confetti and instant pot credit upon showdown win.

### 4. Super Admin Command Center (`/admin`)
- **Executive KPI Cards:**
  - Total Registered Users
  - Total Platform Investment / Deposits (₹ INR)
  - Balance & Chips in Active Circulation (₹ INR)
  - Platform House Rake / Revenue (₹ INR)
  - Active Players Online
- **Investment Analytics Table:** Full breakdown of all depositors, their total lifetime capital additions, current balance, and activity ratio.
- **Direct Real-Time Balance Control:**
  - Super Admin can select any user in the directory and perform:
    - `+ Credit Funds` (Add to wallet)
    - `- Debit Funds` (Deduct from wallet)
    - `Set Balance` (Override absolute balance)
  - Requires an audit reason and atomically creates an `AuditLog` entry and `Transaction` record.
- **Audit Trails & Match Logs:** Complete chronological logs of every balance adjustment and live stream of hand results.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router) & TypeScript
- **Styling:** Tailwind CSS (Dark-mode casino luxury theme)
- **Database:** Prisma ORM with SQLite (`dev.db` for instant local persistence and zero-config deployment)
- **State & Audio:** React Hooks + Web Audio API Procedural Synthesizer
- **Security & Tokens:** `jose` JWT with HTTP-only session cookies & `bcryptjs` password hashing
- **Effects:** `canvas-confetti`, `lucide-react` icons

---

## 🏃 Running the Application

### 1. Start the Server
```bash
# In C:\Users\pranj\OneDrive\Desktop\testing\Game-jone
npm start
```
The application runs at **`http://localhost:3000`**.

### 2. Run Comprehensive Automated Verification Test
```bash
node verify_app.mjs
```
Runs 11 automated test suites validating authentication, table joining, deposits, game settlements, admin balance controls, and audit trails.

---

## 📂 Project Architecture

```
Game-jone/
├── prisma/
│   ├── schema.prisma       # User, Transaction, MatchHistory, AuditLog, GameTable
│   ├── seed.js             # Demo accounts (Super Admin, Rohit Sharma, Priya, etc.)
│   └── dev.db              # SQLite database file
├── src/
│   ├── app/
│   │   ├── admin/          # Super Admin Dashboard (/admin)
│   │   ├── api/            # API Route handlers (auth, wallet, match, admin)
│   │   ├── game/[tableId]/ # Teen Patti Poker Oval Table (/game/[tableId])
│   │   ├── lobby/          # Table Stakes Selector (/lobby)
│   │   ├── login/          # High-End Login / Register Screen (/login)
│   │   ├── profile/        # Profile, Stats, Wallet & Match History (/profile)
│   │   ├── globals.css     # Luxury felt radial gradients and styles
│   │   └── layout.tsx      # Root layout with Toast notification provider
│   ├── components/
│   │   ├── ChipStack.tsx   # 3D Casino Chip visualizer
│   │   ├── DepositModal.tsx# Real-money style simulated deposit & top-up
│   │   ├── Navbar.tsx      # Live balance pill, sound switch, quick navigation
│   │   ├── PlayingCard.tsx # Vector SVG suits and luxury card renderers
│   │   └── Toast.tsx       # Toast alert system
│   ├── lib/
│   │   ├── auth.ts         # JWT creation, verification, session handlers
│   │   ├── gameEngine.ts   # Deck, hand ranking, hand comparator, bot AI
│   │   ├── prisma.ts       # Singleton Prisma client instance
│   │   └── sounds.ts       # Procedural casino Web Audio synthesizer
│   └── middleware.ts       # Strict authentication & role-based route guard
├── verify_app.mjs          # End-to-end verification script
└── package.json            # Scripts & dependencies
```
# teen-patti
