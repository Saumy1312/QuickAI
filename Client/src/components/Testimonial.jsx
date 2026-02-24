import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { assets } from '../assets/assets';

const Testimonial = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true })
  }, [])

  const testimonials = [
    { image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200", name: 'John Doe', title: 'Marketing Director, TechCorp', content: 'ContentAI has revolutionized our content workflow. The quality of the articles is outstanding, and it saves us hours of work every week.', rating: 4 },
    { image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200", name: 'Jane Smith', title: 'Content Creator, TechCorp', content: 'ContentAI has made our content creation process effortless. The AI tools have helped us produce high-quality content faster than ever before.', rating: 5 },
    { image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200", name: 'David Lee', title: 'Content Writer, TechCorp', content: 'ContentAI has transformed our content creation process. The AI tools have helped us produce high-quality content faster than ever before.', rating: 4 },
  ]

  return (
    <div className='bg-[#0A0A0D] px-4 sm:px-20 xl:px-32 py-24'>
      <div className='text-center' data-aos="fade-up">
        <h2 className='text-white text-4xl sm:text-5xl font-bold'>Loved by Creators</h2>
        <p className='text-gray-500 max-w-lg mx-auto mt-4'>Don't just take our word for it. Here's what our users are saying.</p>
      </div>
      <div className='flex flex-wrap mt-10 justify-center gap-6'>
        {testimonials.map((t, index) => (
          <div key={index} data-aos="zoom-in"
            className='p-8 m-2 max-w-xs rounded-xl bg-[#0F0F12] border border-white/10 hover:border-white/20 hover:-translate-y-1 transition duration-300 cursor-pointer'>
            <div className="flex items-center gap-1">
              {Array(5).fill(0).map((_, i) => (
                <img key={i} src={i < t.rating ? assets.star_icon : assets.star_dull_icon} className='w-4 h-4' alt='star' />
              ))}
            </div>
            <p className='text-gray-400 text-sm my-5'>"{t.content}"</p>
            <hr className='mb-5 border-white/10' />
            <div className='flex items-center gap-4'>
              <img src={t.image} className='w-12 h-12 object-cover rounded-full' alt={t.name} />
              <div className='text-sm'>
                <h3 className='font-medium text-white'>{t.name}</h3>
                <p className='text-xs text-gray-500'>{t.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Testimonial