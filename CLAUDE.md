# JCASH Shadcn Preview

## Setup
Created via: `npx shadcn@latest init --preset b2BVBXALw --template next`
Preset: Nova style, Neutral base, Blue primary, Emerald charts, Inter font
Dev server: `npm run dev` → http://localhost:3000 (Next.js 16 + Turbopack)

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

## Key Files
- `app/page.tsx` — renders `<CryptoTicker />`
- `app/api/crypto/route.ts` — server-side CoinGecko proxy
- `components/crypto-ticker.tsx` — full widget with Recharts
- `next.config.mjs` — image domain allowlist
