# 🌌 AmongU — Full Stack Project Architecture & Folder Structure

Yeh document describe karta hai ki **Backend** aur **Frontend** ko **100% decouple (alag-alag)** kaise rakha gaya hai taaki dono independent rahein, unke dependencies clash na karein, aur frontend ko aapke provide kiye gaye **Among Us theme / ImposterHacks HTML** ke mutabiq beautifully implement kiya ja sake.

---

## 🏗️ High-Level Decoupled Architecture

```
AmongU/
├── backend/            # [Standalone Node.js/Express API Service]
│   ├── src/
│   │   ├── config/     # Strict Env validation (Zod), DB, Firebase, Razorpay
│   │   ├── constants/  # Allowed branches, years, sections, @kiet.edu
│   │   ├── controllers/# Auth, Registration, Admin logic
│   │   ├── middlewares/# Auth (Bearer token), Admin guard, Zod schemas, ErrorHandler
│   │   ├── models/     # Mongoose models: User, Registration
│   │   ├── routes/     # /api/auth, /api/registrations, /api/admin
│   │   ├── utils/      # CSV Exporter utility
│   │   ├── app.ts      # Express App configuration
│   │   └── server.ts   # Entrypoint & DB connector
│   ├── .env.example    # Zero fallback environment template
│   ├── package.json    # Backend specific dependencies
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/           # [Standalone Next.js 14/15 App Router + Tailwind]
│   ├── public/         # Static assets, SVG sprites, among us crewmates
│   ├── src/
│   │   ├── app/        # Next.js App Router Pages
│   │   │   ├── layout.tsx              # Root Layout (Fredoka One + Nunito fonts, Starry BG)
│   │   │   ├── page.tsx                # Main Landing Page (Hero, Tasks, Timeline, Prizes, FAQ)
│   │   │   └── admin/                  # Admin Dashboard Pages (Protected)
│   │   │       ├── layout.tsx          # Admin Navigation / Topbar
│   │   │       ├── page.tsx            # Dashboard Metrics, Revenue & Charts
│   │   │       ├── participants/       # Registrations Table with Search, Filter & CSV Export
│   │   │       │   └── page.tsx
│   │   │       └── manual-entry/       # On-Spot Desk Cash Entry Form
│   │   │           └── page.tsx
│   │   │
│   │   ├── components/                 # Modular UI Components
│   │   │   ├── common/                 # Reusable Among Us themed elements
│   │   │   │   ├── AuButton.tsx        # Comic button with 4px border & hard shadow
│   │   │   │   ├── AuCard.tsx          # Comic card with 4px border & hover translation
│   │   │   │   └── Modal.tsx           # Generic Modal Wrapper
│   │   │   ├── landing/                # Sections inspired by provided HTML
│   │   │   │   ├── Navbar.tsx          # Fixed nav with Among Us logo & section links
│   │   │   │   ├── Hero.tsx            # Floating Red Crewmate + "THERE IS 1 HACKER AMONG US"
│   │   │   │   ├── AboutSection.tsx    # "SYSTEM OVERVIEW" Tablet-style card
│   │   │   │   ├── TracksSection.tsx   # Available Tasks (Electrical, Navigation, Security, Comms)
│   │   │   │   ├── TimelineSection.tsx # Mission Timeline with Glowing Lime Progress Bar
│   │   │   │   ├── PrizesSection.tsx   # Bounty Rewards Podium (1st, 2nd, 3rd + Best Sabotage)
│   │   │   │   ├── FaqSection.tsx      # Accordion FAQs
│   │   │   │   └── Footer.tsx          # Footer with social links & copyright
│   │   │   ├── registration/           # Registration & Payment components
│   │   │   │   ├── EmergencyMeetingModal.tsx # 🚨 Emergency Meeting Modal (From provided HTML)
│   │   │   │   ├── RegistrationForm.tsx      # 15-digit ID, Branch, Section, Phone, KIET Email
│   │   │   │   └── PaymentReceiptCard.tsx    # ₹55 Paid Confirmation Ticket
│   │   │   ├── admin/                  # Admin Portal UI
│   │   │   │   ├── StatsOverview.tsx   # Total Paid, Revenue, Branch distribution
│   │   │   │   ├── RegistrationsTable.tsx # Searchable, filterable table
│   │   │   │   ├── StatusBadge.tsx     # Color-coded badges for Success/Pending/Failed
│   │   │   │   └── ExportCsvButton.tsx # Triggers /api/admin/export/csv
│   │   │   └── animations/             # Pure CSS / SVG Animations
│   │   │       ├── FloatingCrewmate.tsx# Drifting & floating crewmates
│   │   │       └── StarryBackground.tsx# Moving starry & twinkling canvas
│   │   │
│   │   ├── config/                     # Zero-Fallback Client Config
│   │   │   ├── env.ts                  # Validates NEXT_PUBLIC_API_URL & Firebase vars
│   │   │   └── firebase.ts             # Firebase Web Client (Google Auth Provider)
│   │   │
│   │   ├── hooks/                      # Custom React Hooks
│   │   │   ├── useAuth.ts              # Firebase Google Auth state & token manager
│   │   │   └── useRazorpay.ts          # Razorpay checkout modal loader
│   │   │
│   │   ├── services/                   # Backend API Communication Layer
│   │   │   ├── api.ts                  # Axios/Fetch client attaching Bearer token
│   │   │   ├── auth.service.ts         # User signin, Admin signin, Me profile
│   │   │   ├── registration.service.ts # Order creation, payment verification, status
│   │   │   └── admin.service.ts        # Stats, participants fetch, CSV download
│   │   │
│   │   ├── types/                      # Shared Frontend Type Definitions
│   │   │   ├── user.ts
│   │   │   ├── registration.ts
│   │   │   └── admin.ts
│   │   │
│   │   └── styles/
│   │       └── globals.css             # Custom styles, @keyframes, au-border, au-btn
│   │
│   ├── .env.example                    # Frontend environment variables template
│   ├── .gitignore
│   ├── tailwind.config.ts              # Custom Among Us color palette (crew-red, crew-cyan...)
│   ├── tsconfig.json
│   └── package.json
│
├── part_1_backend.md                   # Backend documentation
└── part_2_frontend_structure.md        # This file (Frontend architecture & folder layout)
```

---

## 🎨 Theme & Styling Integration (From Provided Mockup)

Aapke provided HTML design ke saare elements **1-to-1 Next.js components** mein map honge:

1. **Color Palette (`tailwind.config.ts`):**
   * `space`: `#0a0b10`
   * `crew.red`: `#c51111`
   * `crew.blue`: `#132ed1`
   * `crew.green`: `#117f2d`
   * `crew.pink`: `#ed54ba`
   * `crew.orange`: `#f07d0d`
   * `crew.yellow`: `#f5f557`
   * `crew.cyan`: `#38fedc`
   * `crew.lime`: `#50ef39`
   * `crew.purple`: `#6b2fbb`
   * `crew.white`: `#d6e0f0`

2. **Typography:**
   * Display Font: `'Fredoka One', cursive`
   * Body Font: `'Nunito', sans-serif`

3. **Signature Among Us UI Classes:**
   * `.au-border`: `border: 4px solid #000;`
   * `.au-card`: `box-shadow: 6px 6px 0px rgba(0,0,0,1);` with smooth hover lift.
   * `.au-btn`: `box-shadow: 4px 4px 0px rgba(0,0,0,1);` with active push-down effect.
   * Starry animated canvas & drifting crewmate SVGs.

4. **Emergency Meeting Modal (Registration Flow):**
   * Navbar / Hero se **"JOIN THE LOBBY" / "REGISTER NOW"** click karne par exact 🚨 **Emergency Meeting Modal** open hoga.
   * Student Google Sign-In karega $\rightarrow$ Form fields fill karega (15-digit ID, Branch, Year, WhatsApp, KIET Email) $\rightarrow$ ₹55 Razorpay checkout open hoga $\rightarrow$ Instant confirmation ticket generate hogi!

---

## 🚫 Separation of Concerns (Dono Mix Nahi Honge)
* **Backend:** Ek independent port (e.g. `5000`) par chalega aur sirf REST JSON return karega.
* **Frontend:** Next.js dev server (port `3000`) par chalega aur Backend API ko `NEXT_PUBLIC_API_URL` environment variable ke through call karega.
* Dono ke apne alag `.env`, `package.json`, aur `node_modules` hain. Zero mixing.
