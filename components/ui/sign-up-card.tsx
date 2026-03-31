'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DotGrid } from './dot-grid'
import { signUpEmail, signInGoogle, signInGithub } from '@/lib/auth-actions'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-1 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 outline-none transition-all duration-200',
        'focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20',
        className
      )}
      {...props}
    />
  )
}

const GithubIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export function SignUpCard() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const [error, setError] = useState('')
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8])
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    setIsLoading(true)
    try {
      await signUpEmail(name, email, password)
      window.location.href = 'https://jcash-wallet.web.app'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('')
    setOauthLoading(provider)
    try {
      await (provider === 'google' ? signInGoogle() : signInGithub())
      window.location.href = 'https://jcash-wallet.web.app'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-[#0a0a0a] relative overflow-x-hidden overflow-y-auto flex items-center justify-center py-10 px-4">
      <DotGrid />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50vw] h-[35vh] rounded-b-full bg-orange-500/[0.06] blur-[100px] pointer-events-none" style={{ zIndex: 1 }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40vw] h-[25vh] rounded-t-full bg-orange-500/[0.05] blur-[100px] pointer-events-none" style={{ zIndex: 1 }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-sm relative"
        style={{ zIndex: 2, perspective: 1400 }}
      >
        <motion.div style={{ rotateX, rotateY }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative group">
          <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
            <motion.div className="absolute top-0 left-0 h-[2px] w-[45%] bg-gradient-to-r from-transparent via-orange-400 to-transparent"
              animate={{ left: ['-45%', '100%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }} />
            <motion.div className="absolute top-0 right-0 h-[45%] w-[2px] bg-gradient-to-b from-transparent via-orange-400 to-transparent"
              animate={{ top: ['-45%', '100%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut', delay: 0.6 }} />
            <motion.div className="absolute bottom-0 right-0 h-[2px] w-[45%] bg-gradient-to-r from-transparent via-orange-400 to-transparent"
              animate={{ right: ['-45%', '100%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut', delay: 1.2 }} />
            <motion.div className="absolute bottom-0 left-0 h-[45%] w-[2px] bg-gradient-to-b from-transparent via-orange-400 to-transparent"
              animate={{ bottom: ['-45%', '100%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut', delay: 1.8 }} />
          </div>

          <div className="relative bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-black/[0.07] dark:border-white/[0.07] shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

            <div className="text-center mb-5 space-y-2">
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.7 }}
                className="mx-auto w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                <span className="text-orange-400 font-black text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>J</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.04em' }}>
                Create Account
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-gray-500 dark:text-white/45 text-xs">
                Join JCASH — Secure. Fast. Limitless.
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <User className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200', focusedInput === 'name' ? 'text-orange-400' : 'text-gray-400 dark:text-white/30')} />
                <Input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)}
                  onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)} className="pl-10" />
              </div>
              <div className="relative">
                <Mail className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200', focusedInput === 'email' ? 'text-orange-400' : 'text-gray-400 dark:text-white/30')} />
                <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} className="pl-10" />
              </div>
              <div className="relative">
                <Lock className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200', focusedInput === 'password' ? 'text-orange-400' : 'text-gray-400 dark:text-white/30')} />
                <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)} className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/70 transition-colors">
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200', focusedInput === 'confirm' ? 'text-orange-400' : 'text-gray-400 dark:text-white/30')} />
                <Input type={showConfirm ? 'text' : 'password'} placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  onFocus={() => setFocusedInput('confirm')} onBlur={() => setFocusedInput(null)} className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/70 transition-colors">
                  {showConfirm ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)}
                    className="appearance-none h-4 w-4 rounded border border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 checked:bg-orange-500 checked:border-orange-500 transition-all duration-200" />
                  {agreed && (
                    <svg className="absolute inset-0 m-auto w-2.5 h-2.5 text-black pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-white/45 leading-relaxed">
                  I agree to the{' '}
                  <Link href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-400 transition-colors">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-orange-500 dark:text-orange-400 hover:text-orange-400 transition-colors">Privacy Policy</Link>
                </span>
              </label>

              {error && <p className="text-xs text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">{error}</p>}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={isLoading || !agreed}
                className="w-full h-11 rounded-xl bg-orange-500 text-black font-bold text-sm shadow-lg shadow-orange-500/25 hover:bg-orange-400 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.06em' }}>
                <AnimatePresence mode="wait">
                  {isLoading
                    ? <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="w-4 h-4 border-2 border-black/60 border-t-transparent rounded-full animate-spin" /></motion.div>
                    : <motion.span key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></motion.span>}
                </AnimatePresence>
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-black/8 dark:bg-white/8" />
                <span className="text-xs text-gray-400 dark:text-white/30">or continue with</span>
                <div className="flex-1 h-px bg-black/8 dark:bg-white/8" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => handleOAuth('github')} disabled={!!oauthLoading}
                  className="flex items-center justify-center gap-2 h-10 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-gray-800 dark:text-white text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 disabled:opacity-50">
                  {oauthLoading === 'github' ? <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 dark:border-t-white rounded-full animate-spin" /> : <GithubIcon />}
                  GitHub
                </button>
                <button type="button" onClick={() => handleOAuth('google')} disabled={!!oauthLoading}
                  className="flex items-center justify-center gap-2 h-10 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-gray-800 dark:text-white text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 disabled:opacity-50">
                  {oauthLoading === 'google' ? <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 dark:border-t-white rounded-full animate-spin" /> : <GoogleIcon />}
                  Google
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 dark:text-white/45">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-orange-500 dark:text-orange-400 hover:text-orange-400 dark:hover:text-orange-300 font-semibold transition-colors">Sign in</Link>
              </p>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
