# AmongU — Backend Service

Backend REST API service for the **AmongU** college club event platform.
Built with **Node.js**, **Express**, **TypeScript**, **MongoDB**, **Firebase Admin**, and **Razorpay**.

---

## ⚡ Zero-Fallback Architecture
This codebase strictly contains **zero fallback or default values (`||`)**.
All parameters (ports, URLs, secrets, fees) must be defined in `.env`. At boot time, **Zod** validates all required environment variables and halts server execution if any variable is missing.

---

## 📦 Setup & Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file by copying the template:
   ```bash
   cp .env.example .env
   ```

4. Populate all required keys in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/amongu?retryWrites=true&w=majority
   REGISTRATION_FEE_INR=55
   REGISTRATION_OPEN=true
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   RAZORPAY_KEY_ID=rzp_test_xxxxxx
   RAZORPAY_KEY_SECRET=xxxxxx
   RAZORPAY_WEBHOOK_SECRET=xxxxxx
   ADMIN_EMAILS=admin@kiet.edu,organizer@kiet.edu
   ```

5. Run in development mode (hot reloading via `tsx`):
   ```bash
   npm run dev
   ```

6. Build and start manually:
   ```bash
   npm run build
   npm start
   ```

---

## 🐳 Docker Deployment

The backend is packaged into a production-grade multi-stage Docker image using `node:22-alpine` with least-privilege non-root execution and automated health monitoring.

### Using Docker Compose (Recommended)

1. Ensure your `.env` file is present in `AmongU/backend/`.
2. Start the container in detached mode:
   ```bash
   npm run docker:up
   # or: docker compose up -d --build
   ```
3. Check container logs:
   ```bash
   npm run docker:logs
   # or: docker compose logs -f
   ```
4. Stop the container:
   ```bash
   npm run docker:down
   # or: docker compose down
   ```

### Using Standalone Docker Commands

1. Build the production image:
   ```bash
   npm run docker:build
   # or: docker build -t amongu-backend .
   ```
2. Run the container:
   ```bash
   npm run docker:run
   # or: docker run -d --name amongu-backend -p 5000:5000 --env-file .env amongu-backend
   ```
3. Check health status:
   ```bash
   docker inspect --format='{{json .State.Health}}' amongu-backend
   ```

---

## 🛡️ Field Validations
* **Name:** First name and last name string ($\ge 2$ words).
* **College ID:** Strictly 15 digits (`^\d{15}$`).
* **Year:** `1` or `2` (1st and 2nd year students only).
* **Branch:** Case-insensitive match against allowed branches:
  `CSE ai`, `cse aiml`, `cse`, `cs`, `csit`, `it`, `CYber security`, `Data science`, `EEE`, `ECE`, `AMIA`, `OTHER`.
* **Section:** `A`, `B`, `C`, `D`, or `E`.
* **Mobile / WhatsApp:** Valid 10-digit Indian mobile number (`^[6-9]\d{9}$`).
* **Email:** Must strictly end with `@kiet.edu`.

---

## 🚀 API Endpoints Overview

### 1. System Health
* `GET /api/health` — Returns service health, registration fee, and registration status.

### 2. Authentication (`/api/auth`)
* `POST /api/auth/user/signin` — Authenticates student via Firebase token and registers profile.
* `POST /api/auth/admin/signin` — Authenticates admin; strictly checks against `ADMIN_EMAILS` from `.env`.
* `GET /api/auth/me` — Retrieves current user profile and registration status.

### 3. Student Registrations (`/api/registrations`)
* `GET /api/registrations/my-status` — Fetches current user's registration status.
* `POST /api/registrations/create-order` — Validates form fields, checks uniqueness, creates ₹55 Razorpay order, saves pending registration.
* `POST /api/registrations/verify-payment` — Cryptographically verifies Razorpay HMAC SHA256 signature and confirms registration.
* `POST /api/registrations/webhook` — Razorpay webhook listener for asynchronous event capture.

### 4. Admin Portal (`/api/admin`) *(Requires Admin Role)*
* `GET /api/admin/stats` — Overall event statistics (counts, revenue, branch/year breakdown).
* `GET /api/admin/registrations` — Paginated list of registrations with search (`name`, `collegeId`, `email`, `phone`) and filters (`paymentStatus`, `branch`, `year`).
* `GET /api/admin/registrations/:id` — View single registration details.
* `PATCH /api/admin/registrations/:id/status` — Manual status update.
* `POST /api/admin/registrations/manual` — Manual cash/desk registration by admin.
* `GET /api/admin/export/csv` — Direct CSV download of all participant records.
