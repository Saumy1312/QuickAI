import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 px-6 md:px-16 lg:px-24 xl:px-32 pt-10 pb-6">
      <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start text-center md:text-left gap-8">

        {/* Logo + Description */}
        <div className="max-w-xs">
          <img src={assets.logo} alt="QuickAI Logo" className="h-7 mb-2 mx-auto md:mx-0" />
          <p className="text-sm">
            QuickAI helps you write, design, and innovate smarter — with AI tools built for creators.
          </p>
        </div>

        {/* Quick Links */}
        <div className="text-sm flex flex-col gap-1">
          <a href="#" className="hover:text-black transition-colors duration-200">Home</a>
          <a href="#" className="hover:text-black transition-colors duration-200">Features</a>
          <a href="#" className="hover:text-black transition-colors duration-200">Pricing</a>
          <a href="#" className="hover:text-black transition-colors duration-200">Contact</a>
        </div>

        {/* Newsletter */}
        <div className="w-full max-w-xs">
          <p className="text-sm font-medium mb-1">Subscribe for updates</p>
          <div className="flex">
            <input
              type="email"
              aria-label="Email address"
              placeholder="Enter your email address"
              className="h-8 px-3 text-sm border border-gray-300 rounded-l outline-none w-full"
            />
            <button
              className="bg-[#5044E5] text-white px-3 h-8 text-sm rounded-r hover:shadow-md transition-shadow"
              aria-label="Subscribe to newsletter"
            >
              Send
            </button>
          </div>
        </div>

        {/* Socials */}
        <div className="flex gap-4 items-center">
          {/* Instagram */}
          <a href="#" aria-label="Instagram">
            <svg className="w-5 h-5 hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zM4.5 7.75A3.25 3.25 0 017.75 4.5h8.5a3.25 3.25 0 013.25 3.25v8.5a3.25 3.25 0 01-3.25 3.25h-8.5a3.25 3.25 0 01-3.25-3.25v-8.5zm9.5 1a4 4 0 11-4 4 4 4 0 014-4zm0 1.5a2.5 2.5 0 102.5 2.5 2.5 2.5 0 00-2.5-2.5zm3.5-.75a.75.75 0 11.75-.75.75.75 0 01-.75.75z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a href="#" aria-label="LinkedIn">
            <svg className="w-5 h-5 hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.98 3.5C3.88 3.5 3 4.38 3 5.48c0 1.1.88 1.98 1.98 1.98h.02c1.1 0 1.98-.88 1.98-1.98C6.98 4.38 6.1 3.5 4.98 3.5zM3 8.75h3.96V21H3V8.75zm6.25 0h3.8v1.68h.05c.53-.98 1.82-2.02 3.75-2.02 4.01 0 4.75 2.64 4.75 6.07V21H17v-5.63c0-1.34-.03-3.07-1.88-3.07-1.88 0-2.17 1.47-2.17 2.98V21H9.25V8.75z" />
            </svg>
          </a>

          {/* GitHub */}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg className="w-5 h-5 hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.58 2 12.2c0 4.49 2.87 8.3 6.84 9.64.5.09.66-.22.66-.48v-1.68c-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.1-1.5-1.1-1.5-.9-.64.07-.63.07-.63 1 .07 1.53 1.04 1.53 1.04.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.75-.1-.26-.45-1.31.1-2.74 0 0 .84-.27 2.75 1.04a9.28 9.28 0 015 0c1.91-1.3 2.75-1.04 2.75-1.04.55 1.43.2 2.48.1 2.74.64.71 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.95.68 1.92v2.84c0 .27.17.58.67.48A10.22 10.22 0 0022 12.2C22 6.58 17.52 2 12 2z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Bottom line */}
      <div className="mt-6 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} <strong>QuickAI</strong>. Built with 💙 by the QuickAI Team.
      </div>
    </footer>
  );
};

export default Footer;
