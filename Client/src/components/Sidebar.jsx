import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Protect, useUser, useClerk } from '@clerk/clerk-react';
import {
  Eraser, FileText, Hash, House, Image,
  LogOut, Scissors, SquarePen, Users, Code, Target, Bug
} from 'lucide-react';
import { MessageCircle } from 'lucide-react';

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: House },
  { to: '/ai/ai-chat', label: 'AI Chat', Icon: MessageCircle },
  { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
  { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
  { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
  { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
  { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
  { to: '/ai/resume-job-matcher', label: 'Resume Matcher', Icon: Target },
  { to: '/ai/screenshot-bug-report', label: 'Bug Report', Icon: Bug },
  { to: '/ai/community', label: 'Community', Icon: Users },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const location = useLocation();
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/ai')) {
      setTimeout(() => setSlideIn(true), 100);
    }
  }, []);

  return (
    <div
      className={`
        w-60 bg-[#0F0F12] border-r border-white/10 flex flex-col justify-between items-center
        max-sm:fixed top-14 bottom-0 z-50
        transition-transform duration-500 ease-out
        ${slideIn ? 'translate-x-0' : '-translate-x-full'}
        ${sidebar ? 'max-sm:translate-x-0' : 'max-sm:-translate-x-full'}
        sm:translate-x-0 sm:static sm:flex
      `}
    >
      <div className="my-7 w-full">
        <img src={user.imageUrl} alt="User avatar" className="w-13 rounded-full mx-auto" />
        <h1 className="mt-1 text-center text-white text-sm font-medium">{user.fullName}</h1>
        <div className="px-4 mt-5 text-sm font-medium flex flex-col gap-0.5">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/ai'}
              onClick={() => setSidebar && setSidebar(false)}
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full border-t border-white/10 p-4 px-5 flex items-center justify-between">
        <div onClick={openUserProfile} className="flex gap-2 items-center cursor-pointer">
          <img src={user.imageUrl} className="w-8 rounded-full" alt="" />
          <div>
            <h1 className="text-sm font-medium text-white">{user.fullName}</h1>
            <p className="text-xs text-gray-500">
              <Protect plan="premium" fallback="Free">Premium</Protect> Plan
            </p>
          </div>
        </div>
        <LogOut
          onClick={signOut}
          className="w-5 text-gray-500 hover:text-gray-300 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Sidebar;