# Medic Ticket — Project Overview

## What This App Does

Medic Ticket is a SaaS platform for Gambian hospitals and clinics to manage medical ticketing. Hospital administrators register their organization, create ticket types (services with prices in GMD), configure Gambian mobile payment methods, and track ticket purchase history through an analytics dashboard.

## Implemented Features

### Authentication
- Email/password registration and login via Better Auth
- Google OAuth sign-in and sign-up
- Route protection via Next.js middleware (checks `better-auth.session_token` cookie)
- Automatic redirect to `/onboarding` for Google OAuth users who have no organization yet

### Registration Flow
1. User signs up with hospital name, email, phone, and password
2. Better Auth creates the user account (and signs them in)
3. A POST to `/api/organizations` creates the organization and links it to the user
4. User is redirected to `/dashboard`

### Onboarding (Google OAuth)
- Google OAuth users without an organization land on `/onboarding`
- They fill in hospital name, email, phone, and optional address
- On submit: POST `/api/organizations` → redirect to `/dashboard`

### Dashboard
- Fetches real stats from `/api/stats` on mount
- Displays: Total Tickets Sold (with % trend vs last month), Monthly Revenue (with goal % progress bar), Pending Tickets count
- Shows last 5 recent purchases in an activity feed with real data
- Quick Operations links to Ticket Types, Payment Methods, Purchase History

### Ticket Types
- List all ticket types for the logged-in organization
- Create new ticket types (name, description, price in GMD)
- Edit existing ticket types inline (right panel form)
- Delete ticket types (with confirmation)
- All data scoped to the authenticated organization

### Layout
- Persistent sidebar with organization name/initials, navigation links, logout button
- Topbar with search, notifications bell, help button, and user name/initials
- All data fetched from DB via `DashboardProvider` context (no mock data)

## Tech Stack & Packages

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.4 | App framework (App Router) |
| `react` / `react-dom` | 19.2.4 | UI runtime |
| `@heroui/react` | ^3.0.3 | UI component library (built on react-aria-components) |
| `framer-motion` | ^12.38.0 | Animation (HeroUI peer dep) |
| `better-auth` | ^1.6.5 | Authentication (email+password, Google OAuth) |
| `@prisma/client` | ^7.7.0 | Database ORM client |
| `prisma` | ^7.7.0 | Prisma CLI (dev) |
| `tailwindcss` | ^4 | CSS framework (CSS-first, no config file) |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind v4 |
| `typescript` | ^5 | Type safety |

## Important HeroUI v3 Note

HeroUI v3 (`@heroui/react`) is built on `react-aria-components` and has a **completely different API from v2**:
- `Input` has NO `onValueChange`, `startContent`, or `classNames` props — use native `<input>` with Tailwind
- `Button` has NO `isLoading` or `variant="flat"` — use native `<button>` with a custom spinner SVG
- `Checkbox` has NO `onValueChange` — use native `<input type="checkbox">`

All form components in this project use native HTML elements styled with Tailwind instead of HeroUI Input/Button.

## Environment Variables

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Database Models

- `User` — Better Auth managed, extended with `organizationId`
- `Organization` — Hospital/clinic profile (name, email, phone, address, logo)
- `TicketType` — Billable service category (name, description, price in GMD)
- `PaymentMethod` — Gambian mobile money config (WAVE, QMONEY, APS, AFRIMONEY, YONNA) with optional logo URL
- `TicketPurchase` — Purchase record linking buyer, ticket type, payment method, and organization

## Key API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...all]` | ALL | Better Auth handler |
| `/api/me` | GET | Current user + organization data |
| `/api/organizations` | POST | Create organization |
| `/api/stats` | GET | Dashboard analytics |
| `/api/ticket-types` | GET, POST | List / create ticket types |
| `/api/ticket-types/[id]` | PUT, DELETE | Update / delete ticket type |
