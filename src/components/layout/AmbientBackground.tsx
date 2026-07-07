import { useEffect, useRef, useState } from 'react'
import type { ColorPalette } from '../../types'
import { usePlanStore } from '../../store/planStore'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  drift: number
  phase: number
  opacity: number
  hue: number
  kind: 'dot' | 'flake' | 'ember' | 'petal' | 'mote'
}

type AmbientProfile = {
  count: number
  rise: boolean
  colors: string[]
  size: [number, number]
  speed: [number, number]
  kind: Particle['kind']
  opacity: [number, number]
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: string): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme()
  return mode === 'light' ? 'light' : 'dark'
}

function isWinterSeason() {
  const month = new Date().getMonth()
  return month === 11 || month === 0 || month === 1
}

function ambientProfile(palette: ColorPalette, theme: 'light' | 'dark'): AmbientProfile | null {
  if (palette === 'plain') return null

  if (palette === 'starwars') {
    if (theme === 'dark') {
      return {
        count: 56,
        rise: false,
        colors: ['#ffffff', '#8ec8ff', '#4da6ff', '#ffcc66'],
        size: [0.6, 2],
        speed: [0.05, 0.2],
        kind: 'dot',
        opacity: [0.25, 0.85],
      }
    }
    return {
      count: 36,
      rise: false,
      colors: ['#6080a8', '#90b8e0', '#c0d8f0'],
      size: [0.8, 2.2],
      speed: [0.04, 0.15],
      kind: 'dot',
      opacity: [0.12, 0.4],
    }
  }

  if (palette === 'got') {
    if (theme === 'dark') {
      return {
        count: 38,
        rise: false,
        colors: ['#e8e8ec', '#c9a227', '#8b1538'],
        size: [1, 3],
        speed: [0.25, 0.75],
        kind: 'flake',
        opacity: [0.15, 0.45],
      }
    }
    return {
      count: 28,
      rise: false,
      colors: ['#a89888', '#c9a227', '#8b1538'],
      size: [1, 2.8],
      speed: [0.18, 0.5],
      kind: 'flake',
      opacity: [0.1, 0.28],
    }
  }

  if (palette === 'witcher') {
    if (theme === 'dark') {
      return {
        count: 26,
        rise: true,
        colors: ['#c87533', '#6b8c5a', '#8a7060'],
        size: [1, 2.6],
        speed: [0.15, 0.45],
        kind: 'mote',
        opacity: [0.14, 0.38],
      }
    }
    return {
      count: 20,
      rise: false,
      colors: ['#a86830', '#5a7848', '#887060'],
      size: [0.9, 2.4],
      speed: [0.1, 0.32],
      kind: 'mote',
      opacity: [0.08, 0.22],
    }
  }

  if (palette === 'northrend') {
    if (theme === 'dark') {
      return {
        count: isWinterSeason() ? 48 : 34,
        rise: false,
        colors: ['#e8f4fc', '#90d8f0', '#30cfea'],
        size: [1, 3.2],
        speed: [0.3, 0.95],
        kind: 'flake',
        opacity: [0.2, 0.55],
      }
    }
    return {
      count: 30,
      rise: false,
      colors: ['#5a8aa8', '#8ab4d0', '#c8e8f8'],
      size: [1.2, 4],
      speed: [0.2, 0.65],
      kind: 'flake',
      opacity: [0.12, 0.35],
    }
  }

  if (palette === 'outland') {
    if (theme === 'dark') {
      return {
        count: 28,
        rise: true,
        colors: ['#92d038', '#a848e8', '#604878'],
        size: [1, 2.8],
        speed: [0.2, 0.55],
        kind: 'ember',
        opacity: [0.18, 0.42],
      }
    }
    return {
      count: 22,
      rise: false,
      colors: ['#9a88b8', '#b8a8d0', '#6a9a48'],
      size: [0.8, 2.2],
      speed: [0.12, 0.35],
      kind: 'mote',
      opacity: [0.08, 0.22],
    }
  }

  if (palette === 'pandaria') {
    if (theme === 'dark') {
      return {
        count: 24,
        rise: false,
        colors: ['#f4a0b0', '#f4c860', '#5ad890'],
        size: [2, 4.5],
        speed: [0.12, 0.4],
        kind: 'petal',
        opacity: [0.12, 0.32],
      }
    }
    return {
      count: 20,
      rise: false,
      colors: ['#f0a898', '#f4c860', '#58d088'],
      size: [1.8, 4],
      speed: [0.1, 0.32],
      kind: 'petal',
      opacity: [0.08, 0.22],
    }
  }

  return null
}

function spawnParticle(
  w: number,
  h: number,
  profile: AmbientProfile,
  fromTop = true,
): Particle {
  const [minS, maxS] = profile.size
  const [minSp, maxSp] = profile.speed
  const [minO, maxO] = profile.opacity
  return {
    x: Math.random() * w,
    y: fromTop ? Math.random() * -h : Math.random() * h,
    size: minS + Math.random() * (maxS - minS),
    speed: minSp + Math.random() * (maxSp - minSp),
    drift: (Math.random() - 0.5) * 0.5,
    phase: Math.random() * Math.PI * 2,
    opacity: minO + Math.random() * (maxO - minO),
    hue: Math.floor(Math.random() * profile.colors.length),
    kind: profile.kind,
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, color: string, frame: number) {
  ctx.globalAlpha = p.opacity
  ctx.fillStyle = color

  if (p.kind === 'petal') {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.phase + frame * 0.007)
    ctx.fillRect(-p.size, -p.size * 0.35, p.size * 2, p.size * 0.7)
    ctx.restore()
    return
  }

  if (p.kind === 'ember') {
    ctx.shadowBlur = 8
    ctx.shadowColor = color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    return
  }

  if (p.kind === 'flake') {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.phase * 0.5 + frame * 0.004)
    ctx.fillRect(-p.size * 0.35, -p.size, p.size * 0.7, p.size * 2)
    ctx.fillRect(-p.size, -p.size * 0.35, p.size * 2, p.size * 0.7)
    ctx.restore()
    return
  }

  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fill()
}

export function AmbientBackground() {
  const palette = usePlanStore((s) => s.data.settings.colorPalette)
  const themeMode = usePlanStore((s) => s.data.settings.theme)
  const ambientAnimation = usePlanStore((s) => s.data.settings.ambientAnimation)
  const customTheme = usePlanStore((s) => s.data.settings.customTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    resolveTheme(themeMode),
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const apply = () => setResolvedTheme(resolveTheme(themeMode))
    apply()
    if (themeMode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [themeMode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (ambientAnimation === 'off') return

    const animationPalette =
      customTheme.enabled && customTheme.basedOn ? customTheme.basedOn : palette
    const profile = ambientProfile(animationPalette, resolvedTheme)
    if (!profile) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    let raf = 0
    let particles: Particle[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: profile.count }, () =>
        spawnParticle(window.innerWidth, window.innerHeight, profile, false),
      )
    }

    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        const sway = Math.sin(frame * 0.012 + p.phase) * 0.3
        if (profile.rise) {
          p.y -= p.speed
          p.x += p.drift + sway * 0.15
          if (p.y < -10) Object.assign(p, spawnParticle(w, h, profile, false), { y: h + 10 })
        } else {
          p.y += p.speed
          p.x += p.drift + sway
          if (p.y > h + 10) Object.assign(p, spawnParticle(w, h, profile, true))
        }
        drawParticle(ctx, p, profile.colors[p.hue] ?? profile.colors[0], frame)
      }

      ctx.globalAlpha = 1
      frame += 1
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [palette, resolvedTheme, ambientAnimation, customTheme.enabled, customTheme.basedOn])

  return <canvas ref={canvasRef} className="ambient-bg" aria-hidden />
}
