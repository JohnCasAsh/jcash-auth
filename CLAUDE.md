# JCASH Shadcn Preview

## Setup
Created via: `npx shadcn@latest init --preset b2BVBXALw --template next`
Preset: Nova style, Neutral base, Blue primary, Emerald charts, Inter font
Dev server: `npm run dev` → http://localhost:3000 (Next.js 16 + Turbopack)

## Deployment Architecture
- **Firebase** (`jcash-wallet.web.app` / `jcash-wallet-000.web.app`) — PRIMARY, serves static files directly from `public/`
- **Vercel** (`jcash-shadcn-preview.vercel.app`) — secondary, Next.js app with rewrite serving `public/jcash-main.html`
- Firebase NO LONGER redirects to Vercel — it serves independently
- Firebase deploy command: `firebase deploy --only hosting`
- Vercel auto-deploys on every `git push` to `master` branch on GitHub (`JohnCasAsh/jcash-auth`)

## Firebase Hosting Config (`firebase.json`)
- Both `jcash-wallet` and `jcash-wallet-000` sites serve from `public/` folder
- Rewrite `**` → `/jcash-main.html` (catch-all, static files take priority)
- `Cache-Control: no-cache, no-store, must-revalidate` on all files
- Static files in `public/` are served directly before rewrite kicks in

## Key Files — Static Site (`public/`)
- `public/jcash-main.html` — entire landing site (single HTML file, no build step)
- `public/sign-in.html` — Sign In page with Firebase Auth (email, Google, GitHub, Phone)
- `public/sign-up.html` — Sign Up page with Firebase Auth (email, Google, GitHub)
- `public/forgot-password.html` — Password reset page via Firebase Auth
- `public/JCashw.png` — white JCASH logo
- `public/Crypto.gif` — animated BTC dither coin
- `public/jcash-portrait.png` — app mockup image
- `public/image1-5.jpeg` — payment platform logos (GCash, Maya, PayPal, GoTyme, MariBank)

## Auth Pages (Firebase static HTML)
- Auth pages load Firebase config via `/__/firebase/init.json` (NO hardcoded API keys)
- Sign In links: email/password, Google OAuth, GitHub OAuth, Phone OTP
- Sign Up: email/password + display name, Google, GitHub
- Forgot Password: sends reset email via `sendPasswordResetEmail`
- After auth → redirects to `/dashboard.html` (placeholder)
- Internal links use `.html` extension (e.g. `/sign-in.html`, `/sign-up.html`)

## Firebase Security
- API keys must NEVER be hardcoded in HTML files committed to git
- Use `/__/firebase/init.json` endpoint instead — Firebase Hosting injects config automatically
- `.env.local` holds `NEXT_PUBLIC_FIREBASE_API_KEY` for Next.js/Vercel only
- Firebase API key was rotated on 2026-03-31 after accidental leak in commit `db7c4de`
- Authorized domains in Firebase Auth: localhost, jcash-wallet.firebaseapp.com, jcash-wallet.web.app, jcash.online, jcash-shadcn-preview.vercel.app

## jcash-main.html Structure
- Nav: floating island, `Features | About | Contacts` links + Sign In button → `/sign-in.html`
- Nav height: mobile `min-height:44px`, tablet `48px`, desktop `52px` (logo `32–40px`)
- Hero: dither BTC coin (canvas), JCASH brand text (Orbitron 900), CTA buttons
- Features: live crypto ticker (CoinGecko API), feature cards
- About: app showcase with slide navigation, payment platform icons
- Contacts: `#contacts` section with info cards + form with animated custom dropdown
- Footer: copyright, privacy policy, social links (X, GitHub, LinkedIn)
- Dark/Light mode toggle stored in `localStorage` key `jcash-theme`

## Contacts Section (`.ct-section`)
- Animated dropdown for Subject field — vanilla JS, no React
- Dropdown opens with CSS animation (`ct-dd-open`), items stagger slide in (`ct-item-slide`)
- Chevron rotates 180° on open via CSS transition
- Click outside closes via `document.addEventListener('mousedown')`
- Selected item highlighted orange (`ct-selected`)
- Subject options: General Inquiry, Technical Support, Business Partnership, Other
- Light mode fully supported via `html[data-theme="light"]` CSS overrides

## CoinGecko API
- Direct browser fetch is blocked by CORS — always use the server-side proxy
- Proxy route: `app/api/crypto/route.ts` fetches from CoinGecko and returns JSON
- Client always fetches `/api/crypto` (never `api.coingecko.com` directly)
- Free tier rate limit ~30 req/min — proxy caches with `next: { revalidate: 60 }`
- CoinGecko image domain whitelisted in `next.config.mjs` → `assets.coingecko.com`

## Crypto Ticker Widget (`components/crypto-ticker.tsx`)
- Real CoinGecko fetch every 60s (6 coins: BTC ETH SOL BNB XRP ADA)
- Visual micro-tick every 3s (±0.08% nudge) so prices feel live without extra API calls
- Charts: Recharts `AreaChart` with `type="monotone"`, gradient fill, hover tooltip
- `isAnimationActive={false}` on Area — prevents re-render flicker on tick
- Sparkline uses 7-day data from `sparkline_in_7d.price`, sampled to ~60 points
- Pulsing green LIVE badge + countdown timer to next real sync

## Next.js App Routes (Vercel only)
- `/` — serves `public/jcash-main.html` via `next.config.mjs` beforeFiles rewrite
- `/sign-in` — React page with Firebase Auth (SignInCard component)
- `/sign-up` — React page with Firebase Auth (SignUpCard component)
- `/forgot-password` — React page (ForgotPasswordCard component)
- `/dashboard` — placeholder ("Dashboard coming soon")
- `/api/crypto` — CoinGecko server proxy

## Next.js Key Files
- `app/layout.tsx` — root layout
- `app/sign-in/page.tsx` — uses `components/ui/sign-in-card.tsx`
- `app/sign-up/page.tsx` — uses `components/ui/sign-up-card.tsx`
- `app/forgot-password/page.tsx` — uses `components/ui/forgot-password-card.tsx`
- `app/dashboard/page.tsx` — placeholder
- `app/api/crypto/route.ts` — CoinGecko proxy
- `components/ui/animated-dropdown.tsx` — AnimatedDropdown with onSelect + selectedValue props
- `lib/firebase.ts` — Firebase app init (uses env vars)
- `lib/auth-actions.ts` — signInEmail, signInGoogle, signInGithub, signUpEmail, etc.
- `next.config.mjs` — image allowlist + beforeFiles rewrite `/ → /jcash-main.html`

## Environment Variables (`.env.local` — never commit)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = jcash-wallet.firebaseapp.com
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = jcash-wallet
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = jcash-wallet.firebasestorage.app
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = 176572167180
- `NEXT_PUBLIC_FIREBASE_APP_ID` = 1:176572167180:web:d51723c72a15c7c33a6a29
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` = G-7JDH4JZV8W

## Breakpoints
- `< 640px` → mobile layout
- `640–1023px` → tablet (desktop layout with CSS adjustments)
- `≥ 1024px` → full desktop layout
