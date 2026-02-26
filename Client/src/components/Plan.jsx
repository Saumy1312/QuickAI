import React, { useEffect } from 'react';
import { PricingTable } from '@clerk/clerk-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Plan = () => {
  useEffect(() => {
    AOS.init({ duration: 700, once: true })
  }, [])

  return (
    <section id="pricing" className='bg-[#0A0A0D] px-4 sm:px-6 lg:px-8 py-24' data-aos="fade-up">
      <div className='text-center mb-12' data-aos="fade-down">
        <h2 className='text-white text-4xl sm:text-5xl font-bold mb-3'>Choose Your Plan</h2>
        <p className='text-gray-500 max-w-xl mx-auto'>
          Start for free and scale up as you grow. Find the perfect plan for your content creation needs.
        </p>
      </div>
      <div className='max-w-4xl mx-auto' data-aos="zoom-in-up" data-aos-delay="150">
        <PricingTable />
      </div>
    </section>
  )
}

export default Plan