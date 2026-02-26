import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { assets } from '../assets/assets';

const Testimonial = () => {
  useEffect(() => { AOS.init({ duration: 800, once: true }) }, [])

  const testimonials = [
    {
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
      name: 'John Doe',
      title: 'Marketing Director',
      company: 'TechCorp',
      content: 'QuickAI has revolutionized our content workflow. The quality of articles is outstanding — saves us hours every single week.',
      rating: 4,
      highlight: 'saves us hours'
    },
    {
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
      name: 'Jane Smith',
      title: 'Content Creator',
      company: 'Freelance',
      content: 'The AI image generator is insane. I produce professional-grade visuals in seconds that used to take my design team days.',
      rating: 5,
      highlight: 'insane'
    },
    {
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
      name: 'Sarah Lee',
      title: 'Product Manager',
      company: 'StartupXYZ',
      content: 'The resume matcher alone is worth the subscription. Got 3x more interview callbacks after optimizing my resume with QuickAI.',
      rating: 5,
      highlight: '3x more interviews'
    },
  ]

  return (
    <div className='bg-[#0A0A0D] px-4 sm:px-20 xl:px-32 py-28 relative overflow-hidden'>
      {/* Decorative elements */}
      <div className='absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />
      <div className='absolute bottom-1/2 left-0 w-[300px] h-[300px] bg-fuchsia-600/5 rounded-full blur-[80px] pointer-events-none' />
      <div className='absolute top-1/2 right-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none' />

      {/* Header */}
      <div className='text-center mb-16' data-aos="fade-up">
        <div className='inline-flex items-center gap-2 border border-white/10 bg-white/3 rounded-full px-4 py-1.5 text-xs text-gray-400 font-medium tracking-widest uppercase mb-6'>
          <span className='w-1 h-1 rounded-full bg-fuchsia-400'></span>
          What people say
        </div>
        <h2 className='text-white text-4xl sm:text-6xl font-black tracking-tight'>
          Loved by <span className='bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent'>Creators</span>
        </h2>
        <p className='text-gray-500 max-w-md mx-auto mt-4 font-light'>Real results from real people using QuickAI every day.</p>
      </div>

      {/* Testimonials */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
        {testimonials.map((t, index) => (
          <div key={index} data-aos="fade-up" data-aos-delay={index * 100}
            className='group relative p-7 rounded-2xl bg-[#0F0F12] border border-white/8 hover:border-white/18 transition-all duration-300 overflow-hidden flex flex-col'>

            {/* Top glow on hover */}
            <div className='absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-fuchsia-400/50 to-transparent' />

            {/* Big quote mark */}
            <div className='text-7xl font-black text-white/4 leading-none mb-2 select-none font-serif'>"</div>

            {/* Stars */}
            <div className='flex items-center gap-1 mb-4'>
              {Array(5).fill(0).map((_, i) => (
                <svg key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-amber-400' : 'text-white/10'}`} fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              ))}
            </div>

            {/* Content */}
            <p className='text-gray-300 text-sm leading-relaxed flex-1'>
              {t.content.split(t.highlight).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className='text-white font-semibold'>{t.highlight}</span>
                  )}
                </React.Fragment>
              ))}
            </p>

            {/* Divider */}
            <div className='my-5 h-px bg-white/6' />

            {/* Author */}
            <div className='flex items-center gap-3'>
              <img src={t.image} alt={t.name} className='w-10 h-10 rounded-full object-cover border border-white/10' />
              <div>
                <p className='text-white text-sm font-semibold'>{t.name}</p>
                <p className='text-gray-500 text-xs'>{t.title} · <span className='text-gray-400'>{t.company}</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom stats bar */}
      <div data-aos="fade-up" className='mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto'>
        {[
          { value: '4.9/5', label: 'Average rating' },
          { value: '200+', label: 'Happy users' },
          { value: '99%', label: 'Satisfaction' },
        ].map((s) => (
          <div key={s.label} className='text-center p-4 rounded-xl bg-white/3 border border-white/8'>
            <p className='text-white font-black text-xl'>{s.value}</p>
            <p className='text-gray-500 text-xs mt-0.5'>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Testimonial