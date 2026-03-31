'use client';

import { useEffect, useState, useCallback } from 'react';
import Marquee from 'react-fast-marquee';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';

/* ── Types ─────────────────────────────────────────────── */
interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  sparkline_in_7d: { price: number[] };
}

/* ── Constants ──────────────────────────────────────────── */
const API_URL       = '/api/crypto';
const REAL_FETCH_MS = 60_000;
const TICK_MS       = 3_000;

/* ── Formatters ─────────────────────────────────────────── */
function fmtPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1)    return n.toFixed(3);
  return n.toFixed(5);
}

function fmtVolume(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

/* ── Sparkline ───────────────────────────────────────────── */
function Sparkline({ prices, up, coinId }: { prices: number[]; up: boolean; coinId: string }) {
  const step = Math.max(1, Math.floor(prices.length / 40));
  const data = prices.filter((_, i) => i % step === 0).map(price => ({ price }));
  const color  = up ? '#10b981' : '#ef4444';
  const fillId = `fill-${coinId}`;
  return (
    <ResponsiveContainer width="100%" height={56}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.28} />
            <stop offset="95%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <YAxis domain={['dataMin', 'dataMax']} hide />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div className="rounded-md border bg-popover px-2 py-1 text-[11px] font-medium shadow-md">
                ${fmtPrice(payload[0].value as number)}
              </div>
            ) : null
          }
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${fillId})`}
          dot={false}
          activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── Single coin card ────────────────────────────────────── */
function CoinCard({ coin }: { coin: Coin }) {
  const up = coin.price_change_percentage_24h >= 0;
  return (
    <Card className="mx-3 w-64 shrink-0 overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
      <CardContent className="p-4 pb-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Image
              src={coin.image}
              alt={coin.name}
              width={36}
              height={36}
              className="rounded-full"
              unoptimized
            />
            <div>
              <p className="text-sm font-semibold leading-none">{coin.name}</p>
              <p className="mt-0.5 text-xs uppercase text-muted-foreground">{coin.symbol}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold tabular-nums">${fmtPrice(coin.current_price)}</p>
            <Badge
              className={`mt-1 text-[10px] font-semibold px-1.5 py-0 border-0 ${
                up
                  ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20'
                  : 'bg-red-500/15 text-red-500 hover:bg-red-500/20'
              }`}
            >
              {up ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </Badge>
          </div>
        </div>

        {/* Sparkline */}
        {coin.sparkline_in_7d?.price?.length > 0 && (
          <div className="mt-2 -mx-4 -mb-1">
            <Sparkline prices={coin.sparkline_in_7d.price} up={up} coinId={coin.id} />
          </div>
        )}

        {/* Volume */}
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Vol 24h: {fmtVolume(coin.total_volume)}
        </p>
      </CardContent>
    </Card>
  );
}

/* ── Skeleton card ───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <Card className="mx-3 w-64 shrink-0 overflow-hidden animate-pulse">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="space-y-1.5">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-2.5 w-10 rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-4 w-12 rounded-full bg-muted ml-auto" />
          </div>
        </div>
        <div className="h-14 rounded bg-muted" />
        <div className="h-2.5 w-20 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

/* ── Main component ──────────────────────────────────────── */
export function CryptoTicker() {
  const [coins, setCoins]   = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: Coin[] = await res.json();
      setCoins(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  /* Real fetch every 60s */
  useEffect(() => {
    fetchPrices();
    const id = setInterval(() => fetchPrices(), REAL_FETCH_MS);
    return () => clearInterval(id);
  }, [fetchPrices]);

  /* Visual tick every 3s */
  useEffect(() => {
    const id = setInterval(() => {
      setCoins(prev =>
        prev.map(c => ({
          ...c,
          current_price: c.current_price * (1 + (Math.random() - 0.499) * 0.0008),
          price_change_percentage_24h:
            c.price_change_percentage_24h + (Math.random() - 0.5) * 0.04,
        }))
      );
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 mb-3 text-sm text-destructive mx-4">
          <AlertCircle size={15} />
          {error} — Rate limited, try again in a moment.
        </div>
      )}

      {/* Marquee loop */}
      {loading ? (
        <div className="flex overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <Marquee
          speed={55}
          pauseOnHover
          gradient
          gradientColor="var(--background)"
          gradientWidth={80}
        >
          {coins.map(coin => (
            <CoinCard key={coin.id} coin={coin} />
          ))}
        </Marquee>
      )}
    </div>
  );
}
