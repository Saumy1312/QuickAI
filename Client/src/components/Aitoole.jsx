import React, { useEffect } from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import AOS from 'aos'
import 'aos/dist/aos.css'

const Aitoole = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  useEffect(() => { AOS.init({ duration: 800, once: true }) }, [])

  return (
    <div id="features" className='bg-[#0A0A0D] px-4 sm:px-20 xl:px-32 py-28 relative overflow-hidden'>
      {/* Background decoration */}
      <div className='absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />
      <div className='absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/5 rounded-full blur-[80px] pointer-events-none' />

      {/* Section header */}
      <div className='text-center mb-16 relative z-10'>
        <div data-aos="fade-up" className='inline-flex items-center gap-2 border border-white/10 bg-white/3 rounded-full px-4 py-1.5 text-xs text-gray-400 font-medium tracking-widest uppercase mb-6'>
          <span className='w-1 h-1 rounded-full bg-blue-400'></span>
          What you can build
        </div>
        <h2 data-aos="fade-up" className='text-white text-4xl sm:text-6xl font-black tracking-tight'>
          Powerful <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>AI Tools</span>
        </h2>
        <p data-aos="fade-up" className='text-gray-500 max-w-md mx-auto mt-4 font-light'>
          Everything you need to create, enhance, and optimize your content with cutting-edge AI.
        </p>
      </div>

      {/* Tools grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10'>
        {AiToolsData.map((tool, index) => (
          <div key={index} data-aos="fade-up" data-aos-delay={index * 50}
            className='group relative p-6 rounded-2xl bg-[#0F0F12] border border-white/8 hover:border-white/20 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden'
            onClick={() => user && navigate(tool.path)}>

            {/* Hover glow */}
            <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${tool.bg.from}18 0%, transparent 70%)` }} />

            {/* Top line accent */}
            <div className='absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              style={{ background: `linear-gradient(to right, transparent, ${tool.bg.from}, transparent)` }} />

            <tool.Icon className='w-10 h-10 p-2.5 text-white rounded-xl mb-5 transition-transform group-hover:scale-110 duration-300'
              style={{ background: `linear-gradient(135deg, ${tool.bg.from}, ${tool.bg.to})` }} />

            <h3 className='text-base font-semibold text-white mb-2'>{tool.title}</h3>
            <p className='text-gray-500 text-sm leading-relaxed'>{tool.description}</p>

            {/* Arrow indicator */}
            <div className='mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              style={{ color: tool.bg.from }}>
              Try it →
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Aitoole