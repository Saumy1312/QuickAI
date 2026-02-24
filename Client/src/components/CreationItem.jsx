import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

const typeColors = {
  'ai-chat': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'generate-code': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'article': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'blog-title': 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  'image': 'text-green-400 bg-green-400/10 border-green-400/20',
  'remove-background': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'remove-object': 'text-red-400 bg-red-400/10 border-red-400/20',
  'resume-review': 'text-teal-400 bg-teal-400/10 border-teal-400/20',
}

const CreationItem = ({ item, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const colorClass = typeColors[item.type] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'

  return (
    <div className='bg-[#0F0F12] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors'>
      <div className='flex items-center justify-between gap-3 p-4 cursor-pointer' onClick={() => setExpanded(!expanded)}>
        <div className='min-w-0 flex-1'>
          <p className='text-sm text-white truncate'>{item.prompt}</p>
          <p className='text-xs text-gray-500 mt-0.5'>{item.type} · {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colorClass}`}>{item.type}</span>
          {onDelete && (
            <button onClick={e => { e.stopPropagation(); onDelete(item.id) }} className='text-gray-600 hover:text-red-400 transition-colors p-1'>
              <Trash2 className='w-3.5 h-3.5' />
            </button>
          )}
          {expanded ? <ChevronUp className='w-4 h-4 text-gray-500' /> : <ChevronDown className='w-4 h-4 text-gray-500' />}
        </div>
      </div>
      {expanded && (
        <div className='border-t border-white/10 p-4'>
          {item.type === 'image' ? (
            <img src={item.content} alt="creation" className='w-full max-w-sm rounded-lg' />
          ) : (
            <div className='text-sm text-gray-300 prose prose-invert prose-sm max-w-none'>
              <div className='reset-tw'><Markdown>{item.content}</Markdown></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreationItem