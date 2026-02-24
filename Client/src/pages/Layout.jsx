import { useState } from 'react';
import React from 'react'
import { assets } from '../assets/assets'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { SignIn, useUser } from '@clerk/clerk-react';
import Sidebar from '../components/Sidebar';

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const user = useUser()
  return user ? (
    <div className='flex flex-col items-start justify-start h-screen bg-[#0A0A0D]'>
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-white/10 bg-[#0F0F12]'>
        <img className='cursor-pointer w-32 sm:w-44 brightness-200' src={assets.logo} alt="" onClick={() => navigate('/')} />
        {sidebar
          ? <X onClick={() => setSidebar(false)} className='w-6 h-6 text-gray-400 sm:hidden' />
          : <Menu onClick={() => setSidebar(true)} className='w-6 h-6 text-gray-400 sm:hidden' />
        }
      </nav>
      <div className='flex-1 w-full flex h-[calc(100vh-56px)]'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        {/* Click outside overlay to close sidebar on mobile */}
        {sidebar && (
          <div className='fixed inset-0 top-14 z-40 sm:hidden' onClick={() => setSidebar(false)} />
        )}
        <div className='flex-1 bg-[#0A0A0D] overflow-hidden'>
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className='flex items-center justify-center h-screen bg-[#0A0A0D]'>
      <SignIn />
    </div>
  )
}

export default Layout