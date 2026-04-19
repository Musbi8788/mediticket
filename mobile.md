# Mediticket Mobile App — Onspace AI Prompt

## Project Brief

Build a cross-platform mobile application for **Mediticket**, a SaaS platform that helps Gambian hospitals and clinics manage medical ticketing. The app should serve hospital administrators and staff who need to manage ticket sales, track revenue, and configure payment methods on the go.

---

## App Name & Branding

- **App Name:** Mediticket
- **Tagline:** Hospital Ticketing Made Simple
- **Primary Color:** Blue (#2563EB or similar medical/professional blue)
- **Secondary Color:** White and light gray backgrounds
- **Target Market:** Gambia (West Africa) — currency is GMD (Gambian Dalasi)

---

## Target Platform

- **React Native** with **Expo** (for cross-platform iOS & Android)
- **TypeScript** throughout
- Minimum OS: iOS 14+, Android 8+

---

## Authentication Screens

### 1. Welcome / Splash Screen
- App logo and tagline
- "Sign In" and "Create Account" buttons
- "Continue with Google" button

### 2. Sign In Screen
- Email and password fields
- "Forgot Password?" link
- "Sign In" button
- Link to Sign Up
- Google OAuth button

### 3. Sign Up Screen
- Fields: Full Name, Hospital Name, Email, Phone Number, Password, Confirm Password
- "Create Account" button
- Link back to Sign In

### 4. Onboarding Screen (for Google OAuth users without an organization)
- Fields: Hospital Name, Hospital Email, Phone Number, Address (optional)
- "Complete Setup" button
- Skips if organization already exists

---

## Backend Integration

Connect to the existing **Next.js REST API** (deployed web app). All API calls require session authentication via cookies or Bearer token from Better Auth.

### API Base URL
Configurable via environment variable: `EXPO_PUBLIC_API_URL`

### Endpoints to Integrate

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/sign-in/email` | POST | Email/password login |
| `/api/auth/sign-up/email` | POST | Register new user |
| `/api/auth/sign-out` | POST | Logout |
| `/api/me` | GET | Fetch current user + organization |
| `/api/stats` | GET | Dashboard analytics |
| `/api/ticket-types` | GET | List ticket types |
| `/api/ticket-types` | POST | Create ticket type |
| `/api/ticket-types/:id` | PUT | Update ticket type |
| `/api/ticket-types/:id` | DELETE | Delete ticket type |
| `/api/payment-methods` | GET | List payment methods |
| `/api/payment-methods` | POST | Create payment method |
| `/api/payment-methods/:id` | PUT | Update payment method |
| `/api/payment-methods/:id` | DELETE | Delete payment method |
| `/api/organizations` | POST | Create organization |

### Auth Strategy
- Store session token securely using `expo-secure-store`
- Attach token to every request as a cookie or `Authorization: Bearer` header
- Auto-redirect to Sign In if 401 response received

---

## App Screens & Navigation

### Bottom Tab Navigator (authenticated users)
1. **Dashboard** (Home icon)
2. **Ticket Types** (Ticket icon)
3. **Payment Methods** (Card icon)
4. **History** (Clock icon)
5. **Settings** (Gear icon)

---

## Screen Specifications

### Dashboard Screen
Display key metrics fetched from `/api/stats`:

- **Total Tickets Sold** — number with percentage trend vs last month (green arrow up / red arrow down)
- **Monthly Revenue** — GMD amount with a progress bar showing % toward monthly goal
- **Pending Tickets** — count badge
- **Recent Activity Feed** — last 5 ticket purchases showing:
  - Buyer name
  - Ticket type name
  - Amount in GMD
  - Payment method used
  - Timestamp (relative: "2 hours ago")
- Pull-to-refresh support
- Organization name displayed in the header

### Ticket Types Screen
- List of all ticket types for the organization
- Each card shows: Name, Description, Price (GMD)
- Floating Action Button (+) to create a new ticket type
- Tap a card to edit it
- Long-press or swipe left on a card to delete (with confirmation dialog)

#### Create / Edit Ticket Type Bottom Sheet or Modal
- Fields: Name (required), Description (optional), Price in GMD (required, numeric)
- "Save" and "Cancel" buttons
- Validation: name and price are required; price must be a positive number

### Payment Methods Screen
Supported Gambian mobile money providers:
- **WAVE**
- **QMONEY**
- **APS**
- **AFRIMONEY**
- **YONNA**

Each payment method card shows:
- Provider logo/icon (color-coded per brand)
- Provider name
- Account/merchant number
- Active/Inactive toggle
- Edit and Delete actions

#### Create / Edit Payment Method Form
- Fields: Provider (dropdown/picker), Account Number, Display Name, Active toggle, Logo URL (optional)
- "Save" and "Cancel" buttons

### Purchase History Screen
- Paginated list of all ticket purchases for the organization
- Each item shows: buyer name, ticket type, payment method, amount (GMD), date
- Filter bar: filter by date range, ticket type, or payment method
- Search bar to find purchases by buyer name
- Pull-to-refresh

### Settings Screen
- **Organization Profile** section:
  - Organization name, email, phone, address
  - "Edit Profile" button
- **Account** section:
  - User name and email (read-only)
  - Change Password option
- **App** section:
  - Notifications toggle
  - App version display
- **Sign Out** button (red, with confirmation)

---

## UI/UX Requirements

- **Design Style:** Clean, minimal, professional — suited for a medical/healthcare context
- **Font:** System default (San Francisco on iOS, Roboto on Android) or Poppins via expo-font
- **Components to use:** React Native Paper or NativeWind (Tailwind for React Native) for styling
- **Loading States:** Show skeleton loaders or activity indicators on all data-fetch screens
- **Error States:** Show inline error messages on forms; show a retry button on failed data loads
- **Empty States:** Show a friendly illustration + message when lists are empty (e.g., "No ticket types yet. Tap + to create one.")
- **Currency Formatting:** Always display prices as `GMD X,XXX.XX`
- **Date/Time:** Use relative times in feeds ("2 hours ago") and absolute dates in history ("Apr 19, 2026")
- **Haptic Feedback:** Light haptic on button press (use `expo-haptics`)
- **Safe Area:** Handle notches and home indicators with `react-native-safe-area-context`

---

## State Management

- Use **Zustand** for global state (auth session, organization data)
- Use **React Query (TanStack Query)** for server state, caching, and background refetching
- Cache dashboard stats for 5 minutes; cache ticket types and payment methods for 2 minutes

---

## Project Structure

```
mediticket-mobile/
├── app/                    # Expo Router file-based navigation
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/
│   │   ├── index.tsx       # Dashboard
│   │   ├── ticket-types.tsx
│   │   ├── payment-methods.tsx
│   │   ├── history.tsx
│   │   └── settings.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                 # Reusable primitives (Button, Card, Input, Badge)
│   ├── dashboard/
│   ├── ticket-types/
│   └── payment-methods/
├── lib/
│   ├── api.ts              # Axios/fetch client with auth interceptor
│   ├── auth.ts             # Auth helpers
│   └── format.ts           # Currency and date formatters
├── store/
│   ├── auth.ts             # Zustand auth store
│   └── org.ts              # Zustand organization store
├── hooks/
│   ├── useStats.ts
│   ├── useTicketTypes.ts
│   └── usePaymentMethods.ts
├── constants/
│   └── colors.ts
└── app.json
```

---

## Packages to Install

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-haptics": "~14.0.0",
    "expo-font": "~13.0.0",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "axios": "^1.7.0",
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.21.0",
    "@react-native-google-signin/google-signin": "^13.0.0",
    "date-fns": "^3.0.0"
  }
}
```

---

## Key Implementation Notes

1. **Google OAuth on mobile:** Use `@react-native-google-signin/google-signin` and pass the ID token to the web API's Better Auth Google handler.
2. **Session persistence:** On app launch, read the stored token from `expo-secure-store` and validate it against `/api/me` before routing to the dashboard.
3. **Organization scope:** Every API call is scoped to the authenticated user's organization — no need to pass org ID explicitly; the server derives it from the session.
4. **Offline handling:** Show a banner when the device has no internet connection using `@react-native-community/netinfo`.
5. **Currency input:** Use a numeric keyboard for price fields and format as GMD on blur.
6. **Confirmation dialogs:** Use `Alert.alert` for destructive actions (delete ticket type, delete payment method, sign out).

---

## Deliverables

- Fully working Expo project with all screens implemented
- TypeScript types for all API responses
- README with setup instructions and environment variable configuration
- `.env.example` file with required variables:
  ```
  EXPO_PUBLIC_API_URL=https://your-mediticket-domain.com
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id
  ```