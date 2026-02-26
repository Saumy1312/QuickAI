import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { ArrowRight, Zap, Image, FileText, Code } from 'lucide-react'

const Hero = () => {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Staggered entrance
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() > 0.5 ? 260 : 220,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.opacity})`
        ctx.fill()
      })
      particles.forEach((p, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(139,92,246,${0.06 * (1 - d / 100)})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  const floatingTools = [
    { icon: Zap, label: 'AI Chat', color: '#a855f7', delay: '0s' },
    { icon: Image, label: 'Image Gen', color: '#3b82f6', delay: '0.5s' },
    { icon: FileText, label: 'Articles', color: '#10b981', delay: '1s' },
    { icon: Code, label: 'Code Gen', color: '#f59e0b', delay: '1.5s' },
  ]

  return (
    <div id="home" className='relative min-h-screen bg-[#060608] flex flex-col items-center justify-center px-4 overflow-hidden'>
      <canvas ref={canvasRef} className='absolute inset-0 w-full h-full opacity-60' />

      {/* Mouse-reactive glow */}
      <div className='absolute inset-0 pointer-events-none transition-all duration-700'
        style={{ background: `radial-gradient(ellipse 60% 50% at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(109,40,217,0.13) 0%, transparent 70%)` }} />

      {/* Ambient glows */}
      <div className='absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-700/8 rounded-full blur-[120px] pointer-events-none' />
      <div className='absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-blue-700/8 rounded-full blur-[100px] pointer-events-none' />

      {/* Floating tool pills - desktop only */}
      <div className='hidden lg:block'>
        {floatingTools.map((tool, i) => (
          <div key={tool.label}
            className='absolute flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-white/3 backdrop-blur-sm text-xs text-gray-300 font-medium'
            style={{
              top: `${25 + i * 14}%`,
              left: i % 2 === 0 ? '6%' : 'auto',
              right: i % 2 !== 0 ? '6%' : 'auto',
              animation: `float 4s ease-in-out infinite`,
              animationDelay: tool.delay,
            }}>
            <tool.icon className='w-3.5 h-3.5' style={{ color: tool.color }} />
            {tool.label}
          </div>
        ))}
      </div>

      <div className={`relative z-10 text-center max-w-5xl mx-auto transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Badge */}
        <div className='inline-flex items-center gap-2 mb-10 relative'
          style={{ transitionDelay: '0.1s' }}>
          <div className='absolute inset-0 bg-purple-500/10 rounded-full blur-md' />
          <div className='relative flex items-center gap-2 border border-purple-500/30 bg-purple-500/5 rounded-full px-5 py-2 text-xs text-purple-300 font-medium tracking-widest uppercase'>
            <span className='w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse'></span>
            AI-powered content creation
          </div>
        </div>

        {/* Heading */}
        <h1 className='text-5xl sm:text-7xl md:text-8xl font-black text-white leading-[1.0] tracking-tight mb-6'>
          <span className='block' style={{ animation: 'slideUp 0.8s ease forwards', animationDelay: '0.2s', opacity: 0 }}>Create</span>
          <span className='block' style={{ animation: 'slideUp 0.8s ease forwards', animationDelay: '0.35s', opacity: 0 }}>
            <span className='bg-gradient-to-r from-purple-400 via-fuchsia-300 to-blue-400 bg-clip-text text-transparent'>amazing</span>
            {' '}content
          </span>
          <span className='block text-white/15 text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.2em] mt-2'
            style={{ animation: 'slideUp 0.8s ease forwards', animationDelay: '0.5s', opacity: 0 }}>
            WITH AI TOOLS
          </span>
        </h1>

        <p className='mt-8 text-gray-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed font-light'
          style={{ animation: 'slideUp 0.8s ease forwards', animationDelay: '0.6s', opacity: 0 }}>
          Transform your workflow with premium AI tools. Write articles, generate images, review resumes — all in one place.
        </p>

        {/* CTA - single button, no Watch demo */}
        <div className='flex justify-center mt-12'
          style={{ animation: 'slideUp 0.8s ease forwards', animationDelay: '0.75s', opacity: 0 }}>
          <button onClick={() => navigate('/ai')}
            className='group relative flex items-center gap-3 bg-white text-black font-bold px-10 py-4 rounded-full hover:bg-gray-100 active:scale-95 transition-all text-base overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)]'>
            <span className='relative z-10'>Start creating now</span>
            <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10' />
          </button>
        </div>

        {/* Social proof */}
        <div className='flex items-center justify-center gap-3 mt-14'
          style={{ animation: 'slideUp 0.8s ease forwards', animationDelay: '0.9s', opacity: 0 }}>
          <img src={assets.user_group} alt="users" className='h-8 opacity-70' />
          <div className='h-4 w-px bg-white/10' />
          <p className='text-gray-500 text-sm'>Trusted by <span className='text-white font-medium'>200+</span> creators</p>
        </div>

        {/* Real stat pills */}
        <div className='hidden sm:flex justify-center gap-4 mt-8'
          style={{ animation: 'slideUp 0.8s ease forwards', animationDelay: '1s', opacity: 0 }}>
          {[
            { label: 'AI tools available', value: '10+' },
            { label: 'Creations made', value: '500+' },
            { label: 'Free to start', value: '100%' },
          ].map((stat) => (
            <div key={stat.label} className='flex items-center gap-2 bg-white/3 border border-white/8 rounded-full px-5 py-2.5'>
              <span className='text-white font-bold text-sm'>{stat.value}</span>
              <span className='text-gray-600 text-xs'>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className='absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0A0A0D] to-transparent pointer-events-none' />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}

export default Hero