import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { assets } from '../assets/assets'

const Hero = () => {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.5 + 0.1
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`
        ctx.fill()
      })
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 * (1 - d / 120)})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        })
      })
      animationId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className='relative min-h-screen bg-[#0A0A0D] flex flex-col items-center justify-center px-4 overflow-hidden'>
      <canvas ref={canvasRef} className='absolute inset-0 w-full h-full' />

      {/* Glow blobs */}
      <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none' />

      <div className='relative z-10 text-center max-w-4xl mx-auto'>
        <div className='inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-8'>
          <Sparkles className='w-3 h-3 text-purple-400' />
          AI-powered content creation
        </div>

        <h1 className='text-4xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight'>
          Create amazing content<br />
          <span className='bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>with AI tools</span>
        </h1>

        <p className='mt-6 text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed'>
          Transform your content creation with our suite of premium AI tools. Write articles, generate images, and enhance your workflow.
        </p>

        <div className='flex flex-wrap justify-center gap-4 mt-10'>
          <button onClick={() => navigate('/ai')} className='flex items-center gap-2 bg-white text-black font-medium px-8 py-3 rounded-full hover:bg-gray-100 active:scale-95 transition-all'>
            Start creating now <ArrowRight className='w-4 h-4' />
          </button>
          <button className='flex items-center gap-2 border border-white/20 text-white px-8 py-3 rounded-full hover:bg-white/5 active:scale-95 transition-all'>
            Watch demo
          </button>
        </div>

        <div className='flex items-center justify-center gap-3 mt-10 text-gray-500 text-sm'>
          <img src={assets.user_group} alt="users" className='h-7 opacity-70' />
          Trusted by 200+ creators
        </div>
      </div>

      {/* Scroll indicator */}
      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600'>
        <div className='w-px h-8 bg-gradient-to-b from-transparent to-gray-600 animate-pulse' />
      </div>
    </div>
  )
}

export default Hero