'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import AnimatedDropdown from '@/components/ui/animated-dropdown'

const SUBJECT_ITEMS = [
  { name: 'General Inquiry', link: '#' },
  { name: 'Technical Support', link: '#' },
  { name: 'Business Partnership', link: '#' },
  { name: 'Bug Report', link: '#' },
  { name: 'Other', link: '#' },
]

function InfoCard({ icon, label, value, desc, href }: {
  icon: React.ReactNode
  label: string
  value: string
  desc: string
  href?: string
}) {
  const content = (
    <div className="group p-5 rounded-2xl border border-white/[0.08] dark:border-white/[0.08] bg-white/[0.03] dark:bg-white/[0.03] hover:border-orange-500/30 transition-colors flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex-shrink-0 flex items-center justify-center text-orange-500">
        {icon}
      </div>
      <div>
        <p className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-white/30 dark:text-white/30 mb-1">{label}</p>
        <span className="text-white dark:text-white text-sm font-semibold block">{value}</span>
        <p className="text-white/35 dark:text-white/35 text-xs mt-1">{desc}</p>
      </div>
    </div>
  )
  if (href) return <a href={href}>{content}</a>
  return <div>{content}</div>
}

export default function ContactPage() {
  const [subject, setSubject] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Message sent! We'll get back to you within 24 hours.")
    setName(''); setEmail(''); setSubject(''); setMessage('')
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] dark:bg-[#0a0a0a] py-20 px-6 relative overflow-hidden">
      {/* Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-72 bg-[radial-gradient(ellipse_at_top,rgba(255,122,0,0.07)_0%,transparent_70%)]" />

      <div className="max-w-5xl mx-auto relative">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-orange-400 text-sm transition-colors mb-12"
        >
          ← Back to JCASH
        </Link>

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-orange-500 mb-3">Contacts</p>
          <h1
            className="text-[clamp(1.8rem,4vw,2.6rem)] font-black text-white mb-3"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            Get In Touch
          </h1>
          <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
            Have questions, feedback, or want to partner with us?<br />We respond within 24 hours.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-[1fr_1.4fr] gap-8 items-start">

          {/* Left — info cards */}
          <div className="flex flex-col gap-3">
            <InfoCard
              href="mailto:admin@jcash.online"
              label="Support"
              value="admin@jcash.online"
              desc="For help with your account or transactions"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              }
            />
            <InfoCard
              href="mailto:johnasleylunnay@gmail.com"
              label="Business"
              value="johnasleylunnay@gmail.com"
              desc="Partnerships, integrations & enterprise"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              }
            />
            <InfoCard
              label="Response Time"
              value="Within 24 hours"
              desc="Mon–Fri, 9AM–6PM PHT"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              }
            />
            {/* Socials */}
            <div className="flex gap-2 pt-1">
              {[
                { label: 'X', svg: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" /> },
                { label: 'GitHub', svg: <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fill="currentColor" /> },
                { label: 'LinkedIn', svg: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor" /> },
              ].map(({ label, svg }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/45 hover:border-orange-500/50 hover:text-orange-500 hover:bg-orange-500/8 transition-all"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24">{svg}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md flex flex-col gap-5"
          >
            {/* Name + Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.68rem] font-bold tracking-[0.1em] uppercase text-white/35 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={cn(
                    'w-full px-4 py-[0.65rem] rounded-xl border border-white/10 bg-white/5',
                    'text-white text-sm placeholder:text-white/25 outline-none font-[family-name:var(--font-sans)]',
                    'focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition-all'
                  )}
                />
              </div>
              <div>
                <label className="block text-[0.68rem] font-bold tracking-[0.1em] uppercase text-white/35 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={cn(
                    'w-full px-4 py-[0.65rem] rounded-xl border border-white/10 bg-white/5',
                    'text-white text-sm placeholder:text-white/25 outline-none font-[family-name:var(--font-sans)]',
                    'focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition-all'
                  )}
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[0.68rem] font-bold tracking-[0.1em] uppercase text-white/35 mb-2">Subject</label>
              <AnimatedDropdown
                items={SUBJECT_ITEMS}
                text="Choose a subject…"
                selectedValue={subject}
                onSelect={(item) => setSubject(item.name)}
                className="w-full"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-[0.68rem] font-bold tracking-[0.1em] uppercase text-white/35 mb-2">Message</label>
              <textarea
                placeholder="Tell us how we can help…"
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 resize-y',
                  'text-white text-sm placeholder:text-white/25 outline-none font-[family-name:var(--font-sans)]',
                  'focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition-all'
                )}
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-[#ff7a00] text-black font-black text-[0.78rem] tracking-[0.1em] cursor-pointer shadow-[0_4px_20px_rgba(255,122,0,0.25)] hover:bg-[#ff9030] hover:shadow-[0_6px_28px_rgba(255,122,0,0.35)] transition-all"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              SEND MESSAGE →
            </motion.button>
          </motion.form>

        </div>
      </div>
    </main>
  )
}
