# TPRM Pro — SaaS Application

Third-Party Cybersecurity Risk Management platform. Built with Next.js 14, Supabase, Stripe, and Resend.

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | Next.js 14 (App Router) + Tailwind CSS |
| UI          | shadcn/ui + Radix UI              |
| Database    | Supabase (PostgreSQL)             |
| Auth        | Supabase Auth                     |
| Payments    | Stripe Subscriptions              |
| Email       | Resend                            |
| Charts      | Recharts                          |
| PDF Export  | @react-pdf/renderer               |
| Deployment  | Vercel                            |

---

## Quick Start (Lovable AI / Cursor)

### Option A — Lovable AI
1. Go to [lovable.dev](https://lovable.dev) → New Project
2. Connect to GitHub and push this codebase
3. Lovable will detect Next.js automatically
4. Add environment variables in Lovable settings

### Option B — Cursor AI
1. Open this folder in Cursor
2. Cursor understands the full codebase context
3. Use Cmd+K to ask Cursor to add features, fix bugs, etc.
4. Deploy to Vercel directly from Cursor

---

## Setup Steps

### 1. Supabase Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Create new project at supabase.com
# Then run the migration:
# Go to Supabase Dashboard → SQL Editor → paste contents of:
# supabase/migrations/001_initial_schema.sql
# Click Run

# After running, seed default criteria for your org:
# SELECT seed_default_criteria('your-org-uuid-here');
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment variables
```bash
cp .env.example .env.local
# Fill in all values (see .env.example for descriptions)
```

### 4. Run locally
```bash
npm run dev
# Visit http://localhost:3000
```

### 5. Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
# Add environment variables in Vercel dashboard
```

---

## Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Dashboard → Products → Create these products:
   - **TPRM Pro Starter** — $99/month and $79/month (annual)
   - **TPRM Pro Professional** — $299/month and $249/month (annual)
   - **TPRM Pro Enterprise** — $799/month and $699/month (annual)
3. Copy each price ID into `.env.local`
4. Webhooks → Add endpoint:
   - URL: `https://your-domain.com/api/billing/webhook`
   - Events: `customer.subscription.*`, `invoice.payment_failed`
5. Copy webhook secret into `STRIPE_WEBHOOK_SECRET`

---

## Resend Setup (Email)

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain (e.g. `tprmpro.com`)
3. Create API key → copy to `RESEND_API_KEY`
4. Update the `FROM` address in `lib/email/resend.ts`

---

## Project Structure

```
tprm-saas/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Login, signup, forgot password
│   ├── dashboard/                # Executive dashboard
│   ├── suppliers/                # Supplier management
│   ├── assessments/              # Assessment engine
│   ├── questions/                # Custom question builder
│   ├── reports/                  # PDF report export
│   ├── billing/                  # Stripe billing
│   ├── settings/                 # Org settings & branding
│   └── api/                      # API routes
│       ├── billing/              # Stripe checkout & webhook
│       ├── assessments/          # Assessment CRUD
│       ├── suppliers/            # Supplier CRUD
│       └── email/                # Email sending
│
├── components/
│   ├── layout/AppLayout.tsx      # Sidebar navigation
│   ├── dashboard/DashboardPage.tsx
│   ├── assessments/AssessmentEngine.tsx
│   ├── suppliers/SuppliersPage.tsx
│   └── billing/BillingPage.tsx
│
├── lib/
│   ├── supabase/client.ts        # Browser Supabase client
│   ├── supabase/server.ts        # Server Supabase client
│   └── email/resend.ts           # Email templates
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full DB schema + RLS
│
├── types/index.ts                # TypeScript type definitions
└── .env.example                  # Environment variable template
```

---

## Key Features Built

- [x] Multi-tenant architecture (one Supabase DB, org-level RLS isolation)
- [x] Auth with Supabase (email/password, OAuth ready)
- [x] Supplier management (add, tier, track, filter)
- [x] Assessment engine (7 domains, 25 criteria, live scoring)
- [x] Configurable risk thresholds per organisation
- [x] Executive dashboard with charts (Recharts)
- [x] Supplier register with portfolio view
- [x] Stripe subscriptions (Starter/Professional/Enterprise)
- [x] Email notifications (Resend) — vendor invites, results, overdue reminders
- [x] Auto score recalculation (DB trigger)
- [x] Auto reference number generation
- [x] Row-level security (data isolation between organisations)
- [x] Audit log

## Next to Build (Phase 2)

- [ ] Custom question builder UI (CRUD for criteria)
- [ ] PDF report generator (react-pdf)
- [ ] Vendor self-assessment portal (public token-gated page)
- [ ] SSO/SAML (enterprise tier)
- [ ] API for external integrations
- [ ] White-label custom domain support
- [ ] Power BI / data export connector

---

## Pricing

| Plan         | Monthly | Annual | Suppliers | Users |
|--------------|---------|--------|-----------|-------|
| Starter      | $99     | $79    | 25        | 3     |
| Professional | $299    | $249   | 100       | 10    |
| Enterprise   | $799    | $699   | Unlimited | ∞     |

Target markets: Banks, telcos, government entities (SADC region initially).

---

## Contributing / Editing with AI

**Cursor AI:** Open the project, use Cmd+K and describe what you want to change.
Examples:
- "Add a PDF export button that generates a report for the selected supplier"
- "Build the custom question builder page where users can add new criteria"
- "Add a vendor self-assessment page that loads via token from the URL"

**Lovable AI:** Push to GitHub, open in Lovable, describe changes in plain English.

The codebase is intentionally structured for AI editing — components are self-contained,
types are centrally defined, and mock data is clearly separated from real Supabase queries.
