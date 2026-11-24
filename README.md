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
Configure `NEXT_PUBLIC_API_URL` (the API origin, without `/api/v1`) and
`NEXT_PUBLIC_APP_URL` in `.env.local` for local development or in your hosting
provider's environment settings for production. Production builds do not fall
back to a hardcoded localhost API URL.

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
- `/dashboard` role-aware workspace with clickable overview cards
- `/notifications` paginated notification centre with mark-read and mark-all-read actions
- `/requests` request list/create/respond
- `/agreements` create/accept agreements
- `/lessons` scheduling and delivery recording
- `/progress` progress report submission
- `/payments` Paystack checkout initiation and provider-side verification
- `/payment/callback` Paystack return page; payment success is shown only after backend verification returns `PAID`
- `/payment-status` secondary payment status view
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

## Launch configuration

- Set `NEXT_PUBLIC_API_URL` to the deployed FastAPI origin (for example,
  `https://api.example.com`) and `NEXT_PUBLIC_APP_URL` to the deployed frontend
  origin. These are public deployment URLs, not secrets.
- Configure the backend `PAYSTACK_CALLBACK_URL` to the deployed frontend's
  `/payment/callback` route and `FRONTEND_BASE_URL` to the same frontend origin.
  Paystack checkout redirects are supplied by the backend environment
  configuration; the frontend follows only the checkout URL returned by Paystack.
- Keep `.env.local` out of source control and do not expose backend secrets through
  `NEXT_PUBLIC_*` variables.
- The dashboard notification count and `/notifications` page use the backend's
  existing paginated notification endpoints. Booking and tutor-response email
  delivery also requires valid SMTP configuration on the backend.
- The lessons and payment-history pages use batched backend display fields rather
  than issuing one tutor-profile request for every row.

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
