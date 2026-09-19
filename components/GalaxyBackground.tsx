'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  twinkleOffset: number
}

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const rafRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      starsRef.current = Array.from({ length: 220 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.2 + 0.3,
        opacity: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.15 + 0.03,
        twinkleOffset: Math.random() * Math.PI * 2,
      }))
    }

    const drawNebula = (t: number) => {
      // Purple nebula blob
      const grd1 = ctx.createRadialGradient(
        canvas.width * 0.2 + Math.sin(t * 0.0003) * 40,
        canvas.height * 0.3 + Math.cos(t * 0.0004) * 30,
        0,
        canvas.width * 0.2,
        canvas.height * 0.3,
        canvas.width * 0.45
      )
      grd1.addColorStop(0, 'rgba(147,51,234,0.13)')
      grd1.addColorStop(0.5, 'rgba(109,40,217,0.06)')
      grd1.addColorStop(1, 'transparent')
      ctx.fillStyle = grd1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Blue nebula blob
      const grd2 = ctx.createRadialGradient(
        canvas.width * 0.8 + Math.cos(t * 0.0002) * 50,
        canvas.height * 0.6 + Math.sin(t * 0.0005) * 40,
        0,
        canvas.width * 0.8,
        canvas.height * 0.6,
        canvas.width * 0.4
      )
      grd2.addColorStop(0, 'rgba(59,130,246,0.11)')
      grd2.addColorStop(0.5, 'rgba(37,99,235,0.05)')
      grd2.addColorStop(1, 'transparent')
      ctx.fillStyle = grd2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Pink accent
      const grd3 = ctx.createRadialGradient(
        canvas.width * 0.5 + Math.sin(t * 0.00025) * 60,
        canvas.height * 0.8 + Math.cos(t * 0.0003) * 20,
        0,
        canvas.width * 0.5,
        canvas.height * 0.8,
        canvas.width * 0.3
      )
      grd3.addColorStop(0, 'rgba(255,45,120,0.07)')
      grd3.addColorStop(1, 'transparent')
      ctx.fillStyle = grd3
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const drawStars = (t: number) => {
      starsRef.current.forEach(star => {
        const twinkle = Math.sin(t * 0.002 + star.twinkleOffset) * 0.4 + 0.6
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${star.opacity * twinkle})`
        ctx.fill()

        // Occasional bright stars with cross glow
        if (star.size > 1.8) {
          ctx.beginPath()
          ctx.moveTo(star.x - star.size * 3, star.y)
          ctx.lineTo(star.x + star.size * 3, star.y)
          ctx.moveTo(star.x, star.y - star.size * 3)
          ctx.lineTo(star.x, star.y + star.size * 3)
          ctx.strokeStyle = `rgba(255,255,255,${star.opacity * twinkle * 0.3})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      })
    }

    const drawShootingStars = (t: number) => {
      const interval = 3000
      const phase = (t % interval) / interval
      if (phase < 0.06) {
        const progress = phase / 0.06
        const sx = canvas.width * 0.7
        const sy = canvas.height * 0.1
        const ex = sx + 200 * progress
        const ey = sy + 100 * progress
        const grd = ctx.createLinearGradient(sx, sy, ex, ey)
        grd.addColorStop(0, 'transparent')
        grd.addColorStop(0.4, 'rgba(255,255,255,0.4)')
        grd.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)
        ctx.strokeStyle = grd
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }

    const drawLightning = (t: number) => {
      const cycle = 7000
      const phase = (t % cycle) / cycle
      if (phase > 0.92 && phase < 0.96) {
        const alpha = phase < 0.94 ? (phase - 0.92) / 0.02 : (0.96 - phase) / 0.02
        ctx.save()
        ctx.globalAlpha = alpha * 0.6

        const x = canvas.width * 0.6
        let y = 0
        ctx.beginPath()
        ctx.moveTo(x, y)
        for (let i = 0; i < 10; i++) {
          y += canvas.height / 10
          ctx.lineTo(x + (Math.random() - 0.5) * 60, y)
        }
        ctx.strokeStyle = 'rgba(147,51,234,0.9)'
        ctx.lineWidth = 1.5
        ctx.shadowColor = 'rgba(147,51,234,1)'
        ctx.shadowBlur = 15
        ctx.stroke()
        ctx.restore()
      }
    }

    const animate = (timestamp: number) => {
      timeRef.current = timestamp
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawNebula(timestamp)
      drawStars(timestamp)
      drawShootingStars(timestamp)
      drawLightning(timestamp)
      rafRef.current = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
