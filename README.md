# AmongU — A Hackathon of Code, Creativity & Sabotage
> **Venue:** KIET Deemed to be University • **Event Date:** November 2, 2026 • **Prize Pool:** ₹10,000

---

## 🚀 Overview
**AmongU** is an immersive social deduction hackathon platform where participants form randomly assigned 4-person crewmate squads, choose a problem domain, and build a solution while one covert member acts as the Impostor attempting subtle sabotage.

The platform consists of two decoupled services:
1. **`backend/`**: Node.js, Express, TypeScript, MongoDB, Firebase Admin SDK, and Razorpay.
2. **`frontend/`**: Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, and Lucide icons.

---

## ⚡ Zero-Fallback Rule
This repository strictly enforces **zero fallback values (`||`)** across both backend and frontend configuration and runtime parameters. All required configuration (ports, URLs, secrets, fees) must be explicitly supplied via `.env` / `.env.local` and are strictly validated using **Zod**.

---

## 📁 Repository Structure

```text
AmongU/
├── .gitignore                      # Monorepo root ignore rules
├── README.md                       # Comprehensive platform documentation
├── backend/                        # Node.js + Express + TypeScript API
│   ├── .env.example                # Template for strictly required backend envs
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts                  # Express server instance & middleware pipeline
│       ├── server.ts               # HTTP bootstrap with strict env validation
│       ├── config/                 # DB, Firebase Admin, Razorpay, Zod env schemas
│       ├── constants/              # Branch, year, and academic constraints
│       ├── controllers/            # Admin, Auth, Registration business logic
│       ├── middlewares/            # Auth guard, Admin role check, Zod validator
│       ├── models/                 # Mongoose schemas (User, Registration)
│       ├── routes/                 # Express REST endpoints (/auth, /admin, /registrations)
│       └── utils/                  # CSV streaming export & signature helpers
└── frontend/                       # Next.js 14 App Router Client
    ├── .env.example                # Template for strictly required client envs
    ├── package.json
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── page.tsx            # Event landing page & dual-step OTP registration modal
        │   ├── layout.tsx          # Root HTML layout with Google typography
        │   ├── dashboard/          # Participant Dashboard, Wardrobe customizer & Ticket
        │   └── admin/              # Command Center
        │       ├── layout.tsx      # Admin nav header & organizer access gate
        │       ├── page.tsx        # Section 1: Candidate Monitoring & Round Orchestration
        │       └── evaluation/     # Section 2: Code Evaluation & Sabotage telemetry (Phase 2)
        ├── components/             # Modular UI components (Hero, Tracks, FAQ, etc.)
        ├── config/                 # Client Zod environment validator & Firebase config
        ├── constants/              # Academic branch lists
        ├── hooks/                  # useAuth, useRazorpay
        ├── services/               # Axios API clients for Admin & Registration
        └── types/                  # TypeScript interfaces for Admin, Users, and Tickets
```

---

## 🛠️ Quickstart Guide

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, Firebase Service Account, and Razorpay Keys
npm run dev          # Runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your backend API URL and Firebase Web credentials
npm run dev          # Runs on http://localhost:3000
```

---

## 📋 Features Checklist

### Public Landing & Registration (`/`)
- [x] Full event lore, mission timeline, prizes, and FAQs.
- [x] 3 Tracks: Web Development, AI/ML Autonomous Agents, Cybersecurity & System Defense.
- [x] ₹55 Registration modal with strict field validation (Name, 15-digit ID, Year, Branch, Section, Contact, KIET email).
- [x] 6-digit OTP verification screen with automated ticket generation.

### Participant Dashboard (`/dashboard`)
- [x] Digital Participant Ticket with verification status.
- [x] Interactive Crewmate Wardrobe Customizer (12 suit colors, 8 hats, 7 mufflers/neckwear).
- [x] Live Event Round 1 countdown timer.
- [x] Candidate withdrawal request workflow with organizer advisory.

### Admin Command Center (`/admin`)
- [x] **Section 1: Monitoring Console**
  - Real-time candidate database & master roster table.
  - Financial KPIs: Total registered, ₹55 fee confirmed, revenue collected, pending/withdrawals.
  - Round Orchestration: Active round selection (Round 1, 2, 3) & Emergency Broadcast dispatcher.
  - Multi-filtering by track, status, branch, and academic year.
  - Candidate Security Dossier modal & seat decommission controls.
  - Master CSV export (`.csv`) for student roster.
- [x] **Section 2: Evaluation Console (`/admin/evaluation`)**
  - Submissions, code evaluation, jury scoring rubrics, and Impostor sabotage detection.
