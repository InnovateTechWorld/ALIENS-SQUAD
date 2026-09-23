# RecyclePay 🌍♻️

RecyclePay is a recycling rewards platform built to make responsible waste disposal simple, visible, and financially worthwhile. A user scans a QR code on a smart recycling bin, starts a short recycling session, deposits an item, and receives a reward after the bin verifies it.

The project brings together a web experience, a Supabase-backed operational layer, Raspberry Pi hardware, AI-assisted item verification, and Nigerian payment infrastructure. The goal is straightforward: turn everyday recycling into a reliable, trackable product experience instead of treating it as an invisible backend process.

> **Project status:** This is currently a working demo and foundation for a production smart-recycling network. The end-to-end flow can be tested locally with the Raspberry Pi simulator, while the hardware integration is documented for a real Raspberry Pi, camera, servo, and Gemini-based verification service.

## What the product does

- Lets users register with a phone number and create a recycling wallet.
- Connects a user to a specific physical bin through a bin ID and QR flow.
- Creates a time-limited session so one bin is not shared by multiple users at once.
- Allows a Raspberry Pi or simulator to detect an active session and report a verification result.
- Credits the user and records a transaction when an item is accepted.
- Updates the bin and user dashboard in near real time through Supabase Realtime.
- Integrates with Squad for optional virtual account creation and future bank payouts.
- Gives users a dashboard for balance, transaction history, recycling totals, and environmental impact.

## Why the architecture works

I kept the architecture intentionally practical: the web application owns the user experience and business workflow, Supabase provides the shared state between the cloud and the physical bin, and the Raspberry Pi stays focused on the hardware and vision work.

```text
┌──────────────────┐       QR / browser       ┌─────────────────────┐
│ User's phone     │ ───────────────────────▶ │ Next.js application │
│                  │                          │ UI + API routes     │
└──────────────────┘                          └──────────┬──────────┘
                                                         │
                              shared state + realtime    │
                                                         ▼
                                                ┌───────────────────┐
                                                │ Supabase           │
                                                │ PostgreSQL +       │
                                                │ Realtime           │
                                                └─────────┬─────────┘
                                                          │
                                      session polling /    │ status updates
                                      future subscriptions │
                                                          ▼
                                                ┌───────────────────┐
                                                │ Raspberry Pi       │
                                                │ camera + servo     │
                                                │ edge controller    │
                                                └───���─────┬─────────┘
                                                          │
                                        image verification │
                                                          ▼
                                                ┌───────────────────┐
                                                │ Gemini vision AI   │
                                                │ accept / reject    │
                                                └───────────────────┘

                         optional account and payout integration
                                      ┌───────────────────┐
                                      │ Squad API          │
                                      │ virtual accounts  │
                                      │ and transfers     │
                                      └───────────────────┘
```

### The main runtime flow

1. The user opens a bin route such as `/bin/001` or scans a QR code from the dashboard.
2. The application registers the user if needed, validates the bin, and creates an `active_sessions` record with a five-minute expiry.
3. The physical bin or `scripts/simulate-pi.js` watches Supabase for a waiting session.
4. The edge device opens the bin, captures an image, and sends it to the configured AI verification layer. The simulator reproduces this step deterministically or with a configurable success rate.
5. The device calls `POST /api/recycle-success` with the bin ID and verification result.
6. The API marks the session, updates the user balance, creates a transaction, and records the bin's last activity.
7. The bin page and dashboard receive database changes through Supabase Realtime and update without requiring a full page refresh.

This separation gives the project a useful boundary: the browser does not need to understand servo control or image recognition, while the hardware does not need to own wallet balances or payment logic.

## Engineering decisions

### A focused Next.js application

The project uses the Next.js App Router so the customer-facing pages and backend route handlers live together in one deployable application. The `app/` directory contains the product routes, while `app/api/` contains the server-side workflow endpoints.

This keeps the demo easy to run and keeps the most important business transitions close to the data they change:

- `app/api/users/register` handles user creation and optional Squad account creation.
- `app/api/sessions/start` validates users and bins, prevents double-booking, and creates an expiring session.
- `app/api/recycle-success` turns a verification result into a balance update and transaction record.
- `app/api/users/[phone]` provides the dashboard data in one request.

### Supabase as the operational backbone

Supabase is more than a database in this project. It is the shared coordination layer between the browser, API routes, and physical bin.

The schema is deliberately small and maps directly to the product domain:

- `users` stores the phone-based identity, balance, and optional virtual account number.
- `bins` stores physical bin identity, location, availability, and last activity.
- `active_sessions` represents the short-lived relationship between a user and a bin.
- `transactions` provides an auditable history of recycling rewards and future withdrawals.

The schema also includes useful operational details such as foreign keys, uniqueness constraints, indexes for common lookups, an `updated_at` trigger, session expiry cleanup, and explicit status checks.

### Real-time user experience

The dashboard subscribes to user balance updates and new transactions. The bin experience listens for the session outcome so a successful verification can immediately show the reward. This makes the product feel connected to the physical bin instead of forcing the user to refresh or guess what happened.

The simulator provides a repeatable way to exercise the same workflow without requiring hardware. It can accept every item, reject every item, or use a probability such as `0.7` to test mixed outcomes.

### Typed boundaries

TypeScript is used across the web application, API routes, shared database model, and integration clients. `types/database.ts` describes the Supabase tables and their allowed status values, while the Squad wrapper keeps payment-specific request formatting out of route handlers.

The codebase also keeps reusable UI behavior in components such as `StatsCard`, `TransactionList`, `QRScanner`, `PayoutToast`, and the shared components under `components/ui/`. That makes the product pages easier to read and keeps the visual language consistent.

## AI and edge computing

The AI layer belongs at the edge of the system, where the camera and physical bin are located. The Raspberry Pi integration guide describes a device that:

1. Watches Supabase for an active session.
2. Opens the bin through a servo motor.
3. Captures an image with a Pi camera or USB webcam.
4. Sends the image to Gemini Flash with a strict recyclable-item prompt.
5. Reports the result back to the Next.js API.

That approach keeps the vision workload close to the camera while leaving rewards, user balances, and transaction history under the control of the backend.

For local development, `scripts/simulate-pi.js` stands in for the hardware and AI call. It polls for a waiting session, simulates verification, and calls the same backend endpoint that the real device uses. This is useful because the product workflow can be developed and tested before the physical hardware is connected.

## Tech stack

- **Framework:** Next.js App Router
- **Language:** TypeScript, with JavaScript simulator scripts and PL/pgSQL database functions
- **Runtime:** Node.js
- **UI:** React, Tailwind CSS, custom components, Lucide icons
- **Data:** Supabase PostgreSQL and Supabase Realtime
- **Payments:** Squad API for optional virtual accounts and payout integration
- **QR workflow:** `qrcode.react` and the in-app QR scanner
- **AI / hardware path:** Raspberry Pi camera, servo control, and Gemini vision integration
- **Deployment target:** Vercel for the web application and a separate Raspberry Pi process for each physical bin

## Project structure

```text
ALIENS-SQUAD/
├── app/
│   ├── api/
│   │   ├── recycle-success/       # Process accepted or rejected verification results
│   │   ├── sessions/start/        # Validate a bin and create a five-minute session
│   │   └── users/                 # Registration and dashboard data endpoints
│   ├── auth/                      # Phone-based entry and registration experience
│   ├── bin/[id]/                  # User-facing bin session and reward flow
│   ├── dashboard/[phone]/         # Balance, transactions, QR scanner, and impact view
│   ├── layout.tsx                 # Global metadata, font, and application shell
│   ├── page.tsx                   # Product landing page
│   └── globals.css                # Global styles and animation utilities
├── components/
│   ├── ui/                       # Button, card, input, modal, and QR primitives
│   ├── QRScanner.tsx              # QR scanning interaction
│   ├── StatsCard.tsx              # Dashboard metric card
│   ├── TransactionList.tsx        # Reward and transaction history
│   └── PayoutToast.tsx            # Payment feedback UI
├── lib/
│   ├── supabase.ts                # Typed Supabase client and configuration guard
│   ├── squad.ts                   # Squad API client for account and transfer operations
│   ├── squad.ts                   # Squad API client for account and transfer operations
│   └── utils.ts                    # Shared utility functions
├── types/
│   └── database.ts                # Shared TypeScript database model
├── supabase/
│   ├── schema.sql                 # Tables, constraints, indexes, RLS, and seed bins
│   └── migration-add-status.sql   # Session status migration
├── scripts/
│   ├── simulate-pi.js             # Hardware and AI workflow simulator
│   └── test-production.js         # Production endpoint smoke-test helper
├── docs/
│   ├── API.md                     # Endpoint and realtime event reference
│   ├── RASPBERRY_PI_SETUP.md      # Hardware, Gemini, GPIO, and deployment guide
│   ├── TESTING_GUIDE.md           # Success, failure, and simulator scenarios
│   └── PROJECT_SUMMARY.md          # Product and implementation notes
├── public/                        # Static application assets
├── Assets/                        # Project media assets
├── QUICKSTART.md                  # Short local setup guide
├── SETUP.md                       # Detailed environment and deployment setup
└── README.md                      # This overview
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- A Supabase project
- Git
- A Squad account only if you want to test virtual-account creation or real payout integration

### 1. Install the project

```bash
git clone https://github.com/InnovateTechWorld/ALIENS-SQUAD.git
cd ALIENS-SQUAD
npm install
```

### 2. Create the Supabase database

Open the Supabase SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql). The schema creates the application tables, indexes, triggers, demo bins, and development RLS policies.

For the current session-status flow, also run [`supabase/migration-add-status.sql`](supabase/migration-add-status.sql) if your database was created from an earlier version of the schema.

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional for Squad integration
SQUAD_SECRET_KEY=your-squad-secret-key
SQUAD_API_URL=https://sandbox-api-d.squadco.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The application can run in demo mode without Squad credentials. Supabase credentials are required for the database-backed flow.

### 4. Start the web application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful local routes:

- `/` — landing page
- `/auth` — register or sign in with a phone number
- `/bin/001` — start a recycling session for demo bin `001`
- `/dashboard/%2B2348012345678` — view a user's dashboard after registration

## Test the complete flow without hardware

The fastest demo path is:

1. Open `/auth` and register with a phone number such as `+2348012345678`.
2. Open `/bin/001` and start a recycling session with the same number.
3. In another terminal, run the simulator:

```bash
node scripts/simulate-pi.js 001
```

The simulator supports different outcomes:

```bash
# Always accept
node scripts/simulate-pi.js 001 1

# 70% chance of accepting each item
node scripts/simulate-pi.js 001 0.7

# Always reject
node scripts/simulate-pi.js 001 0
```

You can also call the backend directly:

```bash
curl -X POST http://localhost:3000/api/recycle-success \
  -H "Content-Type: application/json" \
  -d '{"bin_id":"001","success":true}'
```

The expected successful flow is a credited reward, a new completed transaction, a changed user balance, and a dashboard update.

> **Simulator note:** the current simulator loads environment variables from `.ENV`. If you are running it from a file, make sure the variables used by the simulator are available under that filename or in the process environment. The Next.js application itself uses `.env.local`.

## API surface

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/users/register` | Create or return a user and optionally create a Squad virtual account |
| `GET` | `/api/users/[phone]` | Return a user profile and recent transactions |
| `POST` | `/api/sessions/start` | Validate a bin and start a five-minute active session |
| `POST` | `/api/recycle-success` | Process a verification result, reward the user, and record a transaction |

The full request and response examples are in [`docs/API.md`](docs/API.md).

## Current reward and payment behavior

The current demo reward is **₦10 per accepted item**. The recycle-success route updates the Supabase balance directly and records the transaction so the complete experience works without a live payment provider.

Squad integration is isolated in [`lib/squad.ts`](lib/squad.ts). It can create a virtual account during registration when `SQUAD_SECRET_KEY` is configured, and it includes a transfer method for the next stage of the payout flow.

This split is deliberate: the demo remains easy to run, while the provider-specific payment code has a clear place to mature before production money movement is enabled.

## Security and production readiness

This repository is designed for a demo environment, not as a finished financial-production system. Before deploying with real users and real money, I would prioritize:

- Add authentication and authorization to all user and device API routes.
- Protect the Raspberry Pi webhook with signed requests, API keys, or service-to-service authentication.
- Replace the open development RLS policies with user-, bin-, and service-scoped policies.
- Move balance updates and transaction creation into an atomic database function or transaction so a partial failure cannot create an incorrect balance.
- Add idempotency keys to device callbacks so retries cannot pay the same recycling event twice.
- Validate and normalize phone numbers consistently at every boundary.
- Add rate limiting, structured logging, monitoring, and alerting around payment and device endpoints.
- Keep all provider credentials, Gemini credentials, and production keys outside the repository.
- Replace demo values in the Squad integration with verified user and beneficiary data.
- Add an admin workflow for bin status, maintenance, fraud review, and transaction reconciliation.

These are not hidden assumptions; they are the natural next engineering steps for moving from a compelling prototype to a dependable recycling network.

## Documentation

- [`QUICKSTART.md`](QUICKSTART.md) — get the demo running quickly
- [`SETUP.md`](SETUP.md) — detailed local and production setup
- [`docs/API.md`](docs/API.md) — API routes, payloads, realtime events, and cURL examples
- [`docs/RASPBERRY_PI_SETUP.md`](docs/RASPBERRY_PI_SETUP.md) — Raspberry Pi, camera, servo, and Gemini integration
- [`docs/TESTING_GUIDE.md`](docs/TESTING_GUIDE.md) — simulator and success/failure testing
- [`docs/PROJECT_SUMMARY.md`](docs/PROJECT_SUMMARY.md) — additional product context

## Development commands

```bash
npm run dev      # Start the local development server
npm run build    # Create a production build
npm run start    # Start the production server locally
npm run lint     # Run ESLint
```

## Roadmap

The foundation is in place. The next improvements are focused on making the system more secure, reliable, and deployable at scale:

- Complete production-grade user authentication.
- Connect the real Raspberry Pi camera and servo control loop.
- Replace simulated vision with monitored Gemini verification and clear confidence rules.
- Add authenticated and idempotent device callbacks.
- Implement real withdrawal and bank-transfer flows through Squad.
- Add bin discovery, geolocation, and availability indicators.
- Build an operations/admin dashboard for bins and transactions.
- Add automated API, database, and end-to-end tests.
- Improve observability for hardware connectivity, verification failures, and payout reconciliation.
- Introduce stronger privacy controls for phone numbers, transaction data, and image handling.

## Contributing

I welcome improvements that make the product easier to use, safer to operate, or more reliable in the field.

1. Create a feature branch.
2. Keep changes focused and explain the product or engineering reason behind them.
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Update the relevant documentation when changing an API, database table, hardware flow, or environment variable.

## License

This project is released under the MIT License. See the repository license file for details.

---

Built with TypeScript, Supabase, Next.js, AI, and a belief that recycling should be rewarded. ♻️
