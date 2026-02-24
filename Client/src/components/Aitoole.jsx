import React from 'react';
import { assets } from '../assets/assets';

const testimonials = [
  { image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200", name: 'John Doe', title: 'Marketing Director, TechCorp', content: 'QuickAI has revolutionized our content workflow. The quality of the articles is outstanding, and it saves us hours every week.', rating: 4 },
  { image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200", name: 'Jane Smith', title: 'Content Creator', content: 'The AI tools have helped us produce high-quality content faster than ever before. Absolutely love it!', rating: 5 },
  { image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200", name: 'David Lee', title: 'Content Writer', content: 'QuickAI has transformed how I write. The image generation and background removal are incredible.', rating: 4 },
]

const Testimonial = () => (
  <div className='bg-[#0A0A0D] px-4 sm:px-16 xl:px-32 py-24'>
    <div className='text-center mb-14'>
      <h2 className='text-white text-4xl sm:text-5xl font-bold'>Loved by Creators</h2>
      <p className='text-gray-500 mt-4 max-w-lg mx-auto'>Don't just take our word for it. Here's what our users are saying.</p>
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto'>
      {testimonials.map((t, i) => (
        <div key={i} className='p-6 rounded-xl bg-[#0F0F12] border border-white/10 hover:border-white/20 transition-all duration-300'>
          <div className='flex gap-0.5 mb-4'>
            {Array(5).fill(0).map((_, j) => (
              <img key={j} src={j < t.rating ? assets.star_icon : assets.star_dull_icon} className='w-4 h-4' alt='star' />
            ))}
          </div>
          <p className='text-gray-400 text-sm leading-relaxed mb-6'>"{t.content}"</p>
          <div className='flex items-center gap-3'>
            <img src={t.image} className='w-10 h-10 rounded-full object-cover' alt={t.name} />
            <div>
              <p className='text-white text-sm font-medium'>{t.name}</p>
              <p className='text-gray-600 text-xs'>{t.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default Testimonial