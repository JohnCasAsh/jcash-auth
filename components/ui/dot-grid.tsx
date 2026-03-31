'use client'
import { useEffect, useRef } from 'react'

export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const DOT_R    = 2.2
    const GAP      = 22
    const PROXIMITY = 110
    const SHOCK_R  = 200
    const SHOCK_STR = 4.5
    const SPD_TRIG = 1.2
    const FRICTION = 0.87
    const SPRING_K = 0.055
    const SPRING_D = 0.72
    const ORANGE   = { r: 255, g: 122, b: 0 }

    type Dot = { cx: number; cy: number; ox: number; oy: number; vx: number; vy: number; phase: number }
    let dots: Dot[] = []
    const ptr = { x: -9999, y: -9999, vx: 0, vy: 0, lx: 0, ly: 0, lt: 0 }
    let rafId: number

    function buildGrid() {
      const dpr = window.devicePixelRatio || 1
      const W = window.innerWidth, H = window.innerHeight
      canvas!.width  = Math.floor(W * dpr)
      canvas!.height = Math.floor(H * dpr)
      canvas!.style.width  = W + 'px'
      canvas!.style.height = H + 'px'
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cell   = DOT_R * 2 + GAP
      const cols   = Math.floor((W + GAP) / cell)
      const rows   = Math.floor((H + GAP) / cell)
      const startX = (W - (cols * cell - GAP)) / 2 + DOT_R
      const startY = (H - (rows * cell - GAP)) / 2 + DOT_R

      dots = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ cx: startX + c * cell, cy: startY + r * cell, ox: 0, oy: 0, vx: 0, vy: 0, phase: 0 })
        }
      }
    }

    function draw() {
      const W = window.innerWidth, H = window.innerHeight
      ctx!.clearRect(0, 0, W, H)

      const isLight   = !document.documentElement.classList.contains('dark')
      const base      = isLight ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
      const baseAlpha = isLight ? 0.09 : 0.12
      const px = ptr.x, py = ptr.y
      const proxSq = PROXIMITY * PROXIMITY

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]

        if (d.phase === 1) {
          d.vx *= FRICTION; d.vy *= FRICTION
          d.ox += d.vx;    d.oy += d.vy
          if (Math.abs(d.vx) < 0.25 && Math.abs(d.vy) < 0.25) d.phase = 2
        } else if (d.phase === 2) {
          d.vx = (d.vx - SPRING_K * d.ox) * SPRING_D
          d.vy = (d.vy - SPRING_K * d.oy) * SPRING_D
          d.ox += d.vx; d.oy += d.vy
          if (Math.abs(d.ox) < 0.04 && Math.abs(d.oy) < 0.04 && Math.abs(d.vx) < 0.04) {
            d.ox = 0; d.oy = 0; d.vx = 0; d.vy = 0; d.phase = 0
          }
        }

        const ox = d.cx + d.ox, oy = d.cy + d.oy
        const ddx = d.cx - px, ddy = d.cy - py
        const dsq  = ddx * ddx + ddy * ddy
        let rr: number, gg: number, bb: number, aa: number

        if (dsq < proxSq) {
          let t = 1 - Math.sqrt(dsq) / PROXIMITY
          t = t * t * (3 - 2 * t)
          rr = (base.r + (ORANGE.r - base.r) * t) | 0
          gg = (base.g + (ORANGE.g - base.g) * t) | 0
          bb = (base.b + (ORANGE.b - base.b) * t) | 0
          aa = baseAlpha + t * (0.85 - baseAlpha)
        } else {
          rr = base.r; gg = base.g; bb = base.b; aa = baseAlpha
        }

        ctx!.beginPath()
        ctx!.arc(ox, oy, DOT_R, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${rr},${gg},${bb},${aa.toFixed(2)})`
        ctx!.fill()
      }

      rafId = requestAnimationFrame(draw)
    }

    function onMove(e: MouseEvent) {
      const now = performance.now()
      const dt  = ptr.lt ? now - ptr.lt : 16
      const vx  = (e.clientX - ptr.lx) / dt * 16
      const vy  = (e.clientY - ptr.ly) / dt * 16
      ptr.lt = now; ptr.lx = e.clientX; ptr.ly = e.clientY
      ptr.vx = vx; ptr.vy = vy
      ptr.x  = e.clientX; ptr.y = e.clientY

      const speed = Math.sqrt(vx * vx + vy * vy)
      if (speed > SPD_TRIG) {
        const proxSq = PROXIMITY * PROXIMITY
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i]
          if (d.phase !== 0) continue
          const dx = d.cx - ptr.x, dy = d.cy - ptr.y
          const dsq = dx * dx + dy * dy
          if (dsq < proxSq) {
            const t = (1 - Math.sqrt(dsq) / PROXIMITY) * 0.28
            d.phase = 1
            d.vx = vx * t; d.vy = vy * t
          }
        }
      }
    }

    function onShock(e: MouseEvent) {
      const cx = e.clientX, cy = e.clientY
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]
        const dx = d.cx - cx, dy = d.cy - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < SHOCK_R && dist > 0) {
          const falloff = 1 - dist / SHOCK_R
          d.phase = 1
          d.vx = (dx / dist) * SHOCK_STR * falloff * 2.5
          d.vy = (dy / dist) * SHOCK_STR * falloff * 2.5
        }
      }
    }

    function onTouch(e: TouchEvent) {
      if (e.touches[0]) { ptr.x = e.touches[0].clientX; ptr.y = e.touches[0].clientY }
    }

    function onLeave() { ptr.x = -9999; ptr.y = -9999 }

    buildGrid()
    draw()

    window.addEventListener('resize',     buildGrid, { passive: true })
    window.addEventListener('mousemove',  onMove,    { passive: true })
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('click',      onShock)
    window.addEventListener('touchmove',  onTouch,   { passive: true })
    window.addEventListener('touchend',   onLeave,   { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize',     buildGrid)
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('click',      onShock)
      window.removeEventListener('touchmove',  onTouch)
      window.removeEventListener('touchend',   onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
