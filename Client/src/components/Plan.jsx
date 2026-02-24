import React from 'react';
import { PricingTable } from '@clerk/clerk-react';

const Plan = () => (
  <div className='bg-[#0A0A0D] px-4 sm:px-16 py-24'>
    <div className='text-center mb-14'>
      <h2 className='text-white text-4xl sm:text-5xl font-bold'>Choose Your Plan</h2>
      <p className='text-gray-500 mt-4 max-w-xl mx-auto'>Start for free and scale up as you grow.</p>
    </div>
    <div className='max-w-4xl mx-auto'>
      <PricingTable />
    </div>
  </div>
)

export default Plan