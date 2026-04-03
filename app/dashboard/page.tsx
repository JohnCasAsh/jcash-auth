'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, TrendingUp, ShoppingBag, Settings, LogOut,
  Link2, ExternalLink, RefreshCw, ChevronUp, ChevronDown,
  Menu, X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DotGrid } from '@/components/ui/dot-grid'
import { CryptoTicker } from '@/components/crypto-ticker'
import Image from 'next/image'

/* ── Constants ─────────────────────────────────────────────── */
const PORTFOLIO_URL = '/api/binance-portfolio'
const KEY_STORAGE   = 'jcash_binance_user_key'
const SEC_STORAGE   = 'jcash_binance_user_secret'

/* ── Types ──────────────────────────────────────────────────── */
interface Holding {
  asset: string
  total: number
  priceUsd: number
  valueUsd: number
  change24hPct: number | null
}
interface Portfolio {
  holdings: Holding[]
  totals: { valueUsd: number; dayChangeUsd: number; dayChangePct: number; assetCount: number }
}

/* ── Helpers ────────────────────────────────────────────────── */
function fmt(n: number, dec = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}
function fmtUsd(n: number) {
  return '$' + fmt(Math.abs(n), Math.abs(n) < 1 ? 4 : 2)
}
function fmtAmt(n: number) {
  return n >= 10 ? fmt(n, 2) : n.toFixed(6).replace(/\.?0+$/, '')
}

/* ── Coin icon with cascade fallback ────────────────────────── */
function CoinIcon({ sym, size = 40 }: { sym: string; size?: number }) {
  const [step, setStep] = useState(0)
  const srcs = [
    `https://assets.coincap.io/assets/icons/${sym.toLowerCase()}@2x.png`,
    `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${sym.toLowerCase()}.svg`,
  ]
  if (step < srcs.length) {
    return (
      <img
        src={srcs[step]}
        alt={sym}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        onError={() => setStep(s => s + 1)}
      />
    )
  }
  const colors = ['#ff7a00','#10b981','#3b82f6','#8b5cf6','#f59e0b','#ec4899','#06b6d4']
  let h = 0; for (const c of sym) h = (h * 31 + c.charCodeAt(0)) | 0
  const color = colors[Math.abs(h) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color + '22', color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800,
    }}>
      {sym.slice(0, 3).toUpperCase()}
    </div>
  )
}

/* ── Sidebar nav items ───────────────────────────────────────── */
const NAV = [
  { id: 'wallet',  label: 'Wallet',  Icon: Wallet      },
  { id: 'crypto',  label: 'Crypto',  Icon: TrendingUp   },
  { id: 'shop',    label: 'Shop',    Icon: ShoppingBag  },
  { id: 'settings',label: 'Settings',Icon: Settings     },
]

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [activePage, setActivePage]       = useState('wallet')
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [showForm, setShowForm]           = useState(false)
  const [apiKey, setApiKey]               = useState('')
  const [apiSecret, setApiSecret]         = useState('')
  const [portfolio, setPortfolio]         = useState<Portfolio | null>(null)
  const [loadingPortfolio, setLoadingPortfolio] = useState(false)
  const [portfolioError, setPortfolioError]     = useState('')
  const [status, setStatus]               = useState('')

  /* Load saved creds on mount */
  useEffect(() => {
    const k = localStorage.getItem(KEY_STORAGE) || ''
    const s = localStorage.getItem(SEC_STORAGE)  || ''
    setApiKey(k); setApiSecret(s)
    if (k && s) setStatus('Credentials saved. Click Refresh to reload.')
  }, [])

  const loadPortfolio = useCallback(async (key: string, secret: string) => {
    if (!key || !secret) return
    setLoadingPortfolio(true)
    setPortfolioError('')
    try {
      const res = await fetch(PORTFOLIO_URL, {
        headers: { 'X-Binance-Key': key, 'X-Binance-Secret': secret },
        cache: 'no-store',
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || 'Failed')
      setPortfolio(data)
      setShowForm(false)
    } catch (e) {
      setPortfolioError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setLoadingPortfolio(false)
    }
  }, [])

  /* Auto-load on mount if creds present */
  useEffect(() => {
    const k = localStorage.getItem(KEY_STORAGE) || ''
    const s = localStorage.getItem(SEC_STORAGE)  || ''
    if (k && s) loadPortfolio(k, s)
  }, [loadPortfolio])

  const handleSave = () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setStatus('Please enter both API key and secret.')
      return
    }
    localStorage.setItem(KEY_STORAGE, apiKey.trim())
    localStorage.setItem(SEC_STORAGE, apiSecret.trim())
    setStatus('Saved! Loading your portfolio…')
    loadPortfolio(apiKey.trim(), apiSecret.trim())
  }

  const handleClear = () => {
    localStorage.removeItem(KEY_STORAGE); localStorage.removeItem(SEC_STORAGE)
    setApiKey(''); setApiSecret(''); setPortfolio(null)
    setStatus('Keys cleared.')
  }

  const totals = portfolio?.totals
  const dayUp  = (totals?.dayChangeUsd ?? 0) >= 0

  return (
    <div className="min-h-screen bg-[#050507] text-white flex overflow-hidden">
      <DotGrid />

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="fixed top-0 left-0 h-full w-[220px] bg-[#0a0a10]/95 border-r border-white/[0.06] backdrop-blur-xl z-30 flex flex-col lg:translate-x-0 lg:static lg:flex"
        style={{ translateX: undefined }}
      >
        {/* On desktop always show; on mobile animate */}
        <div className="hidden lg:flex flex-col h-full">
          <SidebarContent activePage={activePage} setActivePage={setActivePage} />
        </div>
        <div className="lg:hidden flex flex-col h-full">
          <SidebarContent activePage={activePage} setActivePage={(p) => { setActivePage(p); setSidebarOpen(false) }} />
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-sm lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <img src="/JCashw.png" alt="JCASH" className="w-7 h-7 object-contain" />
          <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-orbitron)' }}>JCASH</span>
        </header>

        {/* Crypto ticker */}
        <div className="border-b border-white/[0.04] py-2 bg-[#050507]/60">
          <CryptoTicker />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 max-w-3xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activePage === 'wallet' && (
              <motion.div key="wallet" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <WalletPage
                  portfolio={portfolio}
                  loading={loadingPortfolio}
                  error={portfolioError}
                  showForm={showForm}
                  setShowForm={setShowForm}
                  apiKey={apiKey}
                  setApiKey={setApiKey}
                  apiSecret={apiSecret}
                  setApiSecret={setApiSecret}
                  status={status}
                  handleSave={handleSave}
                  handleClear={handleClear}
                  onRefresh={() => loadPortfolio(apiKey, apiSecret)}
                  dayUp={dayUp}
                  totals={totals}
                />
              </motion.div>
            )}
            {activePage === 'crypto' && (
              <motion.div key="crypto" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <PlaceholderPage icon={<TrendingUp className="w-10 h-10 text-orange-400" />} title="Crypto Market" sub="Live prices are shown in the ticker above." />
              </motion.div>
            )}
            {activePage === 'shop' && (
              <motion.div key="shop" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <PlaceholderPage icon={<ShoppingBag className="w-10 h-10 text-orange-400" />} title="JCASH Shop" sub="Spend your JC Credits on digital goods." />
              </motion.div>
            )}
            {activePage === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <PlaceholderPage icon={<Settings className="w-10 h-10 text-orange-400" />} title="Settings" sub="Account preferences and app configuration." />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

/* ── Sidebar content ─────────────────────────────────────────── */
function SidebarContent({ activePage, setActivePage }: { activePage: string; setActivePage: (p: string) => void }) {
  return (
    <>
      <div className="p-5 flex items-center gap-2 border-b border-white/[0.06]">
        <img src="/JCashw.png" alt="JCASH" className="w-8 h-8 object-contain" />
        <span className="text-base font-bold tracking-wider" style={{ fontFamily: 'var(--font-orbitron)' }}>JCASH</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActivePage(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              activePage === id
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
            }`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-white/[0.06]">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all">
          <LogOut className="w-4 h-4 flex-shrink-0" /> Sign out
        </button>
      </div>
    </>
  )
}

/* ── Placeholder page ───────────────────────────────────────── */
function PlaceholderPage({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      {icon}
      <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-orbitron)' }}>{title}</p>
      <p className="text-sm text-white/40">{sub}</p>
    </div>
  )
}

/* ── Wallet page ─────────────────────────────────────────────── */
interface WalletProps {
  portfolio: Portfolio | null
  loading: boolean
  error: string
  showForm: boolean
  setShowForm: (v: boolean) => void
  apiKey: string; setApiKey: (v: string) => void
  apiSecret: string; setApiSecret: (v: string) => void
  status: string
  handleSave: () => void
  handleClear: () => void
  onRefresh: () => void
  dayUp: boolean
  totals: Portfolio['totals'] | undefined
}

function WalletPage({ portfolio, loading, error, showForm, setShowForm, apiKey, setApiKey, apiSecret, setApiSecret, status, handleSave, handleClear, onRefresh, dayUp, totals }: WalletProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-lg font-bold mb-0.5" style={{ fontFamily: 'var(--font-orbitron)' }}>Web3 Wallet</p>
        <p className="text-xs text-white/40">View-only · Connected to your Binance read-only API</p>
      </div>

      {/* Hero card */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-[#0a0a18] to-[#0d0d22] p-6 text-center">
        <div className="absolute bottom-[-50px] right-[-50px] w-44 h-44 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Total Portfolio</p>
        <p className="text-3xl font-black text-blue-400" style={{ fontFamily: 'var(--font-orbitron)' }}>
          {totals ? `$${fmt(totals.valueUsd, totals.valueUsd < 1 ? 4 : 2)}` : '$--'}
        </p>
        {totals && (
          <p className="text-xs text-white/40 mt-1.5">
            24h P/L{' '}
            <span className={`font-bold ${dayUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {dayUp ? '+' : ''}{fmtUsd(totals.dayChangeUsd)} ({dayUp ? '+' : ''}{fmt(totals.dayChangePct)}%)
            </span>
            {' '}· Updated live
          </p>
        )}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <Link2 className="w-4 h-4" />
          Manage Binance Connection
          {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Connection form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-white/[0.08] bg-[#0a0a10]/90">
              <CardContent className="p-5 space-y-3">
                <p className="text-xs text-white/50 leading-relaxed">
                  Use your own Binance read-only API credentials. They stay in your browser and are only used to fetch your wallet balance.
                </p>
                <a
                  href="https://www.binance.com/en/my/settings/api-management"
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white/60 hover:text-white hover:bg-white/[0.07] transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Open Binance API Management
                </a>
                <div className="space-y-1">
                  <label className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Binance API Key</label>
                  <input
                    type="text" value={apiKey} onChange={e => setApiKey(e.target.value)}
                    placeholder="Paste your Binance API key"
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15 transition-all"
                    autoComplete="off" spellCheck={false}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Binance Secret Key</label>
                  <input
                    type="password" value={apiSecret} onChange={e => setApiSecret(e.target.value)}
                    placeholder="Paste your Binance secret key"
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15 transition-all"
                    autoComplete="off" spellCheck={false}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={handleSave}
                    className="flex-1 h-9 rounded-lg bg-orange-500 text-black text-sm font-bold hover:bg-orange-400 transition-colors">
                    Save &amp; Load
                  </button>
                  <button onClick={handleClear}
                    className="px-4 h-9 rounded-lg border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
                    Clear
                  </button>
                  <button onClick={() => setShowForm(false)}
                    className="px-4 h-9 rounded-lg border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
                    Cancel
                  </button>
                </div>
                {status && <p className="text-xs text-blue-400">{status}</p>}
                {error  && <p className="text-xs text-red-400">{error}</p>}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Holdings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] uppercase tracking-widest text-white/40 font-semibold">Holdings</p>
          {portfolio && (
            <button onClick={onRefresh} disabled={loading}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        <Card className="border-white/[0.08] bg-[#0a0a10]/90">
          <CardContent className="p-0">
            {loading && (
              <div className="py-10 text-center">
                <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-white/40">Loading your portfolio…</p>
              </div>
            )}
            {!loading && !portfolio && !error && (
              <div className="py-10 text-center px-6">
                <Wallet className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm font-semibold mb-1">Connect your Binance account</p>
                <p className="text-xs text-white/40 mb-4">Enter your read-only API credentials to view your real portfolio.</p>
                <button onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-black text-sm font-bold hover:bg-orange-400 transition-colors">
                  <Link2 className="w-4 h-4" /> Connect Binance
                </button>
              </div>
            )}
            {!loading && error && (
              <div className="py-8 text-center px-6">
                <p className="text-sm text-red-400 font-medium mb-1">Connection failed</p>
                <p className="text-xs text-white/40 mb-3">{error}</p>
                <button onClick={() => setShowForm(true)}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Try again →</button>
              </div>
            )}
            {!loading && portfolio && portfolio.holdings.length > 0 && (
              <div className="divide-y divide-white/[0.05]">
                {portfolio.holdings.map((h, i) => {
                  const up = h.change24hPct !== null && h.change24hPct >= 0
                  return (
                    <motion.div
                      key={h.asset}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <CoinIcon sym={h.asset} size={40} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{h.asset}</p>
                        <p className="text-xs text-white/40">{fmtAmt(h.total)} {h.asset} · ${fmt(h.priceUsd, h.priceUsd < 1 ? 5 : 2)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{fmtUsd(h.valueUsd)}</p>
                        {h.change24hPct !== null ? (
                          <Badge className={`mt-0.5 text-[10px] px-1.5 py-0 border-0 ${up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                            {up ? '+' : ''}{h.change24hPct.toFixed(2)}%
                          </Badge>
                        ) : (
                          <Badge className="mt-0.5 text-[10px] px-1.5 py-0 border-0 bg-blue-500/15 text-blue-400">LIVE</Badge>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-[11px] text-white/25 text-center pb-2">
        ⓘ JCASH does not hold your crypto. Wallet connection is view-only.
      </p>
    </div>
  )
}
