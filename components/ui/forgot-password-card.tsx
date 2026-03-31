'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DotGrid } from './dot-grid'
import { resetPassword } from '@/lib/auth-actions'

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

export function ForgotPasswordCard() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [focusedInput, setFocusedInput] = useState<string | null>(null)

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
    setIsLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link')
    } finally {
      setIsLoading(false)
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

            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="text-center mb-6 space-y-2">
                    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.7 }}
                      className="mx-auto w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                      <span className="text-orange-400 font-black text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>J</span>
                    </motion.div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.04em' }}>
                      Reset Password
                    </h1>
                    <p className="text-gray-500 dark:text-white/45 text-xs">
                      Enter your email and we&apos;ll send a reset link
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-xs text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">{error}</p>}
                    <div className="relative">
                      <Mail className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200', focusedInput === 'email' ? 'text-orange-400' : 'text-gray-400 dark:text-white/30')} />
                      <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} className="pl-10" required />
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={isLoading}
                      className="w-full h-11 rounded-xl bg-orange-500 text-black font-bold text-sm shadow-lg shadow-orange-500/25 hover:bg-orange-400 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.06em' }}>
                      <AnimatePresence mode="wait">
                        {isLoading
                          ? <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="w-4 h-4 border-2 border-black/60 border-t-transparent rounded-full animate-spin" /></motion.div>
                          : <motion.span key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">Send Reset Link <ArrowRight className="w-4 h-4" /></motion.span>}
                      </AnimatePresence>
                    </motion.button>

                    <Link href="/sign-in" className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 transition-colors pt-1">
                      <ArrowLeft className="w-3 h-3" /> Back to Sign In
                    </Link>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 py-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}
                    className="mx-auto w-16 h-16 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-orange-400" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>Check your email</h2>
                    <p className="text-gray-500 dark:text-white/45 text-xs leading-relaxed">
                      We sent a reset link to<br />
                      <span className="text-orange-500 dark:text-orange-400">{email}</span>
                    </p>
                  </div>
                  <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back to Sign In
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
