import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, PricingTable } from '@clerk/clerk-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Plan = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
    });
  }, []);

  return (
    <section
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-20"
      data-aos="fade-up"
    >
      {/* Header */}
      <div className="text-center mb-12" data-aos="fade-down">
        <h2 className="text-slate-800 text-4xl font-semibold mb-3">
          Choose Your Plan
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto text-base">
          Start for free and scale up as you grow. Find the perfect plan for your content creation needs.
        </p>
      </div>

      {/* Clerk Pricing Table */}
      <div data-aos="zoom-in-up" data-aos-delay="150">
        <PricingTable />
      </div>
    </section>
  );
};

export default Plan;
