import React, { useEffect } from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import AOS from 'aos'
import 'aos/dist/aos.css'

const Aitoole = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  useEffect(() => {
    AOS.init({ duration: 800, once: true })
  }, [])

  return (
    <div id="features" className='bg-[#0A0A0D] px-4 sm:px-20 xl:px-32 py-24'>
      <div className='text-center mb-14'>
        <h2 data-aos="fade-up" className='text-white text-4xl sm:text-5xl font-bold'>Powerful AI Tools</h2>
        <p data-aos="fade-up" className='text-gray-500 max-w-lg mx-auto mt-4'>
          Everything you need to create, enhance, and optimize your content with cutting-edge AI technology.
        </p>
      </div>
      <div className='flex flex-wrap justify-center'>
        {AiToolsData.map((tool, index) => (
          <div key={index} data-aos="fade-up"
            className='p-8 m-4 max-w-xs rounded-xl bg-[#0F0F12] border border-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer'
            onClick={() => user && navigate(tool.path)}>
            <tool.Icon className='w-12 h-12 p-3 text-white rounded-xl' style={{ background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})` }} />
            <h3 className='mt-6 mb-3 text-lg font-semibold text-white'>{tool.title}</h3>
            <p className='text-gray-500 text-sm max-w-[95%]'>{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Aitoole