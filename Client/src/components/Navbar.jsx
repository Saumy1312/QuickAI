import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'

const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { openSignIn } = useClerk()

  return (
    <div className="fixed z-50 w-full flex justify-between items-center py-4 px-6 sm:px-16 border-b border-white/5 bg-[#0A0A0D]/80 backdrop-blur-xl">
      <img src={assets.logo} alt="logo" className="w-28 sm:w-36 brightness-200 cursor-pointer" onClick={() => navigate('/')} />
      {user
        ? <UserButton />
        : <button onClick={openSignIn} className='flex items-center gap-2 bg-white text-black text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-100 transition cursor-pointer'>
            Get started <ArrowRight className='w-4 h-4' />
          </button>
      }
    </div>
  );
};

export default Navbar;