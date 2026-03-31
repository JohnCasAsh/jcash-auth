import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const COIN_IDS = 'bitcoin,ethereum,solana,binancecoin,ripple,cardano';

const COINGECKO_URL =
  `https://api.coingecko.com/api/v3/coins/markets` +
  `?vs_currency=usd` +
  `&ids=${COIN_IDS}` +
  `&order=market_cap_desc` +
  `&sparkline=true` +
  `&price_change_percentage=24h`;

export async function GET() {
  try {
    const res = await fetch(COINGECKO_URL, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JCASH-Widget/1.0',
      },
      next: { revalidate: 60 }, // cache for 60s on server
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `CoinGecko error: ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to reach CoinGecko' },
      { status: 500 },
    );
  }
}
