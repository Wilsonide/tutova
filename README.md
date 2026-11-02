# Tutova frontend

A brand-aligned Next.js App Router frontend for the supplied Tutova FastAPI backend. It uses TypeScript, Tailwind CSS v4, shadcn/ui-compatible setup (`components.json`) and reusable shadcn-style components. **There is no `src/` directory.**

## Requirements
- Node.js 20.9+ (recommended)
- The Tutova FastAPI backend running, commonly at `http://localhost:8000`

## Setup
```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```
Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`, then open `http://localhost:3000`.

## Brand
- Deep navy: `#102A56`
- Teal green: `#00AFA0`
- Vibrant blue: `#0077E6`
- Background: `#F4F8FB`
- Tagline: **The right tutor. A brighter future.**

## Main routes
- `/` landing page
- `/login`, `/register` authentication
- `/discover` public tutor discovery
- `/dashboard` role-aware workspace
- `/requests` request list/create/respond
- `/agreements` create/accept agreements
- `/lessons` scheduling and delivery recording
- `/progress` progress report submission
- `/payments` Paystack checkout initiation and provider-side verification
- `/payment-status` payment return/status view (verification requires obligation and attempt IDs in query params)
- `/earnings` tutor earnings and payout request
- `/tutor/onboarding` application, profile, verification reference, NDA and intro-video submission
- `/tutor/manage` offerings, pricing proposals and availability
- `/admin` review actions for applications, verification, videos, pricing, publication and payout approvals
- `/settings` profile settings
- `/safeguarding` complaint and safeguarding reports

## Authentication strategy
The backend issues a short-lived bearer access token and rotates a refresh token in an HTTP-only cookie at `/api/v1/auth/refresh`. The frontend keeps the access token in memory only (not localStorage), sends credentials on API requests, attempts one refresh on a 401 and retries once, and calls the backend logout endpoint to revoke the refresh session. Deploy frontend and API over HTTPS in production, set the backend's `COOKIE_SECURE=true`, configure exact CORS origins with credentials, rotate secrets, and consider same-site deployment. If frontend and API are on different sites, the cookie's SameSite/Secure settings and CSRF posture need deliberate configuration.

## Payments
The frontend never calls Paystack directly with a secret key. It asks the backend to initialize a payment, follows the returned checkout URL, and can call the backend's verification endpoint. The backend remains responsible for webhook signature checks, server-to-server provider verification, idempotency, payment state and ledger/earning reconciliation. Configure `PAYMENT_PROVIDER=PAYSTACK`, `PAYSTACK_SECRET_KEY`, and a valid callback URL on the backend.

## Known backend API gaps (important)
This frontend deliberately does not fake data where the supplied API has no read endpoint. The uploaded backend has write actions for agreements, lessons and progress reports, but no list/detail endpoints for those records; similarly it lacks payment obligation history, payout history/settlement state, and list queues for verification records, videos, pricing proposals and payout requests. Some pages therefore ask for a known record UUID and submit supported actions. For a seamless production UX, add authenticated GET endpoints for these resources (with role-scoped filtering) and then connect the screens to them. The backend also accepts storage keys for verification documents and videos rather than receiving file uploads; configure a private storage adapter and signed upload URLs before exposing sensitive file uploads to users.

## shadcn/ui
`components.json` is configured for shadcn CLI with root aliases. The project includes local button, card, input, textarea, label, badge and field components using shadcn's component pattern. Add more components with e.g. `npx shadcn@latest add dialog dropdown-menu table form`.

## Validate
```powershell
npm run typecheck
npm run build
```

The project source is scaffolded against the uploaded backend route and schema definitions. A full production build still needs to be run in an environment where npm dependencies can be installed and then smoke-tested against a running API/database with Paystack sandbox credentials.

## UI direction

The interface has been simplified around the primary tutoring journey: discover a tutor, send a request, arrange lessons, and follow progress. Tutor and administrator workspaces now have role-specific navigation rather than exposing every feature to every account. The visual direction uses generous spacing, restrained borders and shadows, fewer competing accent treatments, and a clearer hierarchy inspired by TutorChum's learner-first marketplace experience while retaining Tutova branding and workflows.

## Verify locally

Dependency installation and production build still need to be run in an environment with npm registry access:

```powershell
npm install
Copy-Item .env.example .env.local
npm run typecheck
npm run build
npm run dev
```
