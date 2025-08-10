import React, { useState, useEffect } from 'react'
import Markdown from 'react-markdown'

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(false)

  // Trigger animation on mount
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`
        p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer 
        transition-all duration-700 ease-out transform
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-50'}
      `}
    >
      <div className='flex justify-between items-center gap-4'>
        <div>
          <h2>{item.prompt}</h2>
          <p className='text-gray-500'>{item.type} - {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
        <button className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full'>
          {item.type}
        </button>
      </div>

      {expanded && (
        <div>
          {item.type === 'image' ? (
            <div>
              <img src={item.content} alt="image" className='mt-3 w-full max-w-md' />
            </div>
          ) : (
            <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-700'>
              <div className='reset-tw'>
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreationItem
