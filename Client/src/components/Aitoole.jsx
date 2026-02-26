import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import {
  MessageCircle, SquarePen, Image, FileText, Bug,
  Hash, Search, Edit, Sparkles, Eraser, Scissors,
  RefreshCw, Crop, ArrowUpCircle, FileSearch, Target,
  ChevronRight, Zap
} from 'lucide-react'

const TOOLS = [
  {
    title: 'AI Chatbot',
    description: 'Intelligent conversations with memory, file understanding, and vision capabilities.',
    Icon: MessageCircle,
    bg: { from: '#FF7B54', to: '#FFB26B' },
    shadow: 'rgba(255,123,84,0.3)',
    path: '/ai/ai-chat',
    badge: 'Most Popular',
    features: [
      { icon: MessageCircle, label: 'Natural conversation' },
      { icon: Image,         label: 'Image & PDF analysis' },
      { icon: FileText,      label: 'Document Q&A' },
    ],
  },
  {
    title: 'AI Article Writer',
    description: 'Full content studio — write articles, generate titles, and analyse SEO in one place.',
    Icon: SquarePen,
    bg: { from: '#3588F2', to: '#0BB0D7' },
    shadow: 'rgba(53,136,242,0.3)',
    path: '/ai/write-article',
    badge: null,
    features: [
      { icon: Edit,   label: 'Article generator' },
      { icon: Hash,   label: 'Blog title ideas' },
      { icon: Search, label: 'SEO analyser' },
    ],
  },
  {
    title: 'Image Tools',
    description: 'A full AI image suite — generate, edit, and transform images with 8 powerful tools.',
    Icon: Image,
    bg: { from: '#20C363', to: '#11B97E' },
    shadow: 'rgba(32,195,99,0.3)',
    path: '/ai/image-tools',
    badge: 'Premium',
    features: [
      { icon: Sparkles,      label: 'Text to image' },
      { icon: Eraser,        label: 'Remove background' },
      { icon: Scissors,      label: 'Remove object' },
      { icon: RefreshCw,     label: 'Replace background' },
      { icon: Crop,          label: 'Uncrop & upscale' },
    ],
  },
  {
    title: 'Resume Tools',
    description: 'AI-powered resume review, ATS scoring, and job description matching in one toolkit.',
    Icon: FileText,
    bg: { from: '#12B7AC', to: '#08B6CE' },
    shadow: 'rgba(18,183,172,0.3)',
    path: '/ai/review-resume',
    badge: null,
    features: [
      { icon: FileText,   label: 'Resume review' },
      { icon: FileSearch, label: 'ATS compatibility check' },
      { icon: Target,     label: 'Job matcher & cover letter' },
    ],
  },
  {
    title: 'Screenshot Bug Report',
    description: 'Upload any UI screenshot and instantly get a structured, professional bug report.',
    Icon: Bug,
    bg: { from: '#DC2626', to: '#F97316' },
    shadow: 'rgba(220,38,38,0.3)',
    path: '/ai/screenshot-bug-report',
    badge: null,
    features: [
      { icon: Bug,      label: 'Severity classification' },
      { icon: FileText, label: 'Steps to reproduce' },
      { icon: Zap,      label: 'Fix suggestions' },
    ],
  },
]

const ToolCard = ({ tool, index, onClick }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={index * 80}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className='group relative rounded-2xl cursor-pointer overflow-hidden transition-all duration-500'
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: hovered ? `1px solid ${tool.bg.from}55` : '1px solid rgba(255,255,255,0.07)',
        boxShadow: hovered ? `0 20px 60px -10px ${tool.shadow}, 0 0 0 1px ${tool.bg.from}22` : '0 4px 24px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
      }}
    >
      {/* Top glow bar */}
      <div className='absolute top-0 left-0 right-0 h-px transition-opacity duration-500'
        style={{
          background: `linear-gradient(to right, transparent, ${tool.bg.from}, ${tool.bg.to}, transparent)`,
          opacity: hovered ? 1 : 0,
        }} />

      {/* Background gradient wash */}
      <div className='absolute inset-0 transition-opacity duration-500 pointer-events-none'
        style={{
          background: `radial-gradient(ellipse at 30% 0%, ${tool.bg.from}12 0%, transparent 65%)`,
          opacity: hovered ? 1 : 0,
        }} />

      <div className='relative p-6'>
        {/* Header */}
        <div className='flex items-start justify-between mb-5'>
          <div className='w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110'
            style={{ background: `linear-gradient(135deg, ${tool.bg.from}, ${tool.bg.to})` }}>
            <tool.Icon className='w-5 h-5 text-white' />
          </div>
          {tool.badge && (
            <span className='text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full'
              style={{
                background: `${tool.bg.from}20`,
                color: tool.bg.from,
                border: `1px solid ${tool.bg.from}40`,
              }}>
              {tool.badge}
            </span>
          )}
        </div>

        {/* Title & description */}
        <h3 className='text-white font-bold text-lg mb-2 tracking-tight'>{tool.title}</h3>
        <p className='text-gray-500 text-sm leading-relaxed mb-5'>{tool.description}</p>

        {/* Features list */}
        <div className='flex flex-col gap-2 mb-5'>
          {tool.features.map((feat, i) => (
            <div key={i} className='flex items-center gap-2.5'>
              <div className='w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0'
                style={{ background: `${tool.bg.from}18` }}>
                <feat.icon className='w-3 h-3' style={{ color: tool.bg.from }} />
              </div>
              <span className='text-xs text-gray-400'>{feat.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className='flex items-center gap-1.5 text-xs font-semibold transition-all duration-300'
          style={{ color: hovered ? tool.bg.from : 'rgba(156,163,175,0.6)' }}>
          Try it now
          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${hovered ? 'translate-x-1' : ''}`} />
        </div>
      </div>
    </div>
  )
}

const Aitoole = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  useEffect(() => { AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic' }) }, [])

  return (
    <div id="features" className='bg-[#0A0A0D] px-4 sm:px-16 xl:px-28 py-28 relative overflow-hidden'>

      {/* Background decorations */}
      <div className='absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />
      <div className='absolute top-32 left-1/4 w-[500px] h-[500px] bg-blue-600/4 rounded-full blur-[120px] pointer-events-none' />
      <div className='absolute top-32 right-1/4 w-[400px] h-[400px] bg-purple-600/4 rounded-full blur-[100px] pointer-events-none' />

      {/* Section header */}
      <div className='text-center mb-16 relative z-10'>
        <div data-aos="fade-up"
          className='inline-flex items-center gap-2 border border-white/10 bg-white/3 rounded-full px-4 py-1.5 text-xs text-gray-400 font-medium tracking-widest uppercase mb-6'>
          <span className='w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse' />
          Everything in one place
        </div>
        <h2 data-aos="fade-up" data-aos-delay="50"
          className='text-white text-4xl sm:text-6xl font-black tracking-tight leading-tight'>
          Powerful <span className='bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>AI Tools</span>
        </h2>
        <p data-aos="fade-up" data-aos-delay="100"
          className='text-gray-500 max-w-lg mx-auto mt-4 font-light text-base leading-relaxed'>
          Five fully-featured tools. One platform. Create, enhance, and optimize your content with cutting-edge AI.
        </p>

        {/* Stats row */}
        <div data-aos="fade-up" data-aos-delay="150"
          className='inline-flex items-center gap-6 mt-8 px-6 py-3 rounded-2xl bg-white/3 border border-white/8'>
          {[
            { value: '5', label: 'AI Tools' },
            { value: '20+', label: 'Features' },
            { value: '∞', label: 'Possibilities' },
          ].map((stat, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className='w-px h-8 bg-white/10' />}
              <div className='text-center'>
                <div className='text-white font-black text-xl'>{stat.value}</div>
                <div className='text-gray-600 text-xs mt-0.5'>{stat.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Tools grid — 3 on top, 2 centered on bottom */}
      <div className='relative z-10 max-w-6xl mx-auto'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
          {TOOLS.slice(0, 3).map((tool, i) => (
            <ToolCard key={tool.title} tool={tool} index={i}
              onClick={() => user && navigate(tool.path)} />
          ))}
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-2/3 lg:mx-auto'>
          {TOOLS.slice(3).map((tool, i) => (
            <ToolCard key={tool.title} tool={tool} index={i + 3}
              onClick={() => user && navigate(tool.path)} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div data-aos="fade-up" className='text-center mt-14 relative z-10'>
        <p className='text-gray-600 text-sm'>
          Not signed in yet?{' '}
          <span onClick={() => navigate('/')}
            className='text-blue-400 hover:text-blue-300 cursor-pointer transition-colors font-medium'>
            Create a free account →
          </span>
        </p>
      </div>
    </div>
  )
}

export default Aitoole