import React, { useEffect, useRef, useState } from 'react';
import { PricingTable } from '@clerk/clerk-react';

const Plan = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // Use IntersectionObserver instead of AOS to avoid white flash
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" className='bg-[#0A0A0D] px-4 sm:px-6 lg:px-8 py-28 relative overflow-hidden'>
      {/* Top border */}
      <div className='absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />

      {/* Ambient glow */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-purple-600/6 rounded-full blur-[80px] pointer-events-none' />

      {/* Header */}
      <div ref={ref} className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className='inline-flex items-center gap-2 border border-white/10 bg-white/3 rounded-full px-4 py-1.5 text-xs text-gray-400 font-medium tracking-widest uppercase mb-6'>
          <span className='w-1 h-1 rounded-full bg-purple-400'></span>
          Pricing
        </div>
        <h2 className='text-white text-4xl sm:text-6xl font-black tracking-tight mb-3'>
          Choose Your <span className='bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>Plan</span>
        </h2>
        <p className='text-gray-500 max-w-md mx-auto font-light'>
          Start for free. Upgrade when you need more power.
        </p>
      </div>

      {/* PricingTable — no animation wrapper to avoid white flash */}
      <div className={`max-w-4xl mx-auto transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <PricingTable
          appearance={{
            variables: {
              colorBackground: '#0F0F12',
              colorText: '#ffffff',
              colorTextSecondary: '#9ca3af',
              colorPrimary: '#a855f7',
              colorNeutral: '#ffffff',
              borderRadius: '0.75rem',
            },
            elements: {
              pricingTableCard: 'bg-[#0F0F12] border border-white/10 hover:border-white/20 transition-colors shadow-none',
              pricingTableCardTitle: 'text-white font-bold',
              pricingTableCardPrice: 'text-white',
              pricingTableCardFeatureList: 'text-gray-400',
              pricingTableCardCTA: 'bg-purple-600 hover:bg-purple-500 text-white border-0',
              badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
            }
          }}
        />
      </div>
    </section>
  );
};

export default Plan;