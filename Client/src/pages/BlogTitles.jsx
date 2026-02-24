import { Hash, Sparkles, Copy, Check } from 'lucide-react'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import useGenerateText from '../hooks/useGenerateText'
import useCopyToClipboard from '../hooks/useCopyToClipboard'

const BlogTitles = () => {
  const blogCategories = ['General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food']
  const [selectedCategory, setSelectedCategory] = useState('General')
  const [input, setInput] = useState('')
  const { loading, content, generate } = useGenerateText('/api/ai/generate-blog-title')
  const { copied, copy } = useCopyToClipboard()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    await generate({ prompt: `Generate a blog title for the keyword ${input} in the category ${selectedCategory}` })
  }

  return (
    <div className='h-full overflow-y-auto p-6 flex items-start flex-wrap gap-4 bg-[#0A0A0D] text-white'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-[#0F0F12] rounded-lg border border-white/10'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>AI Title Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium text-gray-300'>Keyword</p>
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text"
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-purple-500/50 transition-colors'
          placeholder='The future of artificial intelligence is....' required />
        <p className='mt-4 text-sm font-medium text-gray-300'>Category</p>
        <div className='mt-3 flex gap-3 flex-wrap'>
          {blogCategories.map((item) => (
            <span onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition-colors ${selectedCategory === item ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'text-gray-400 border-white/10 hover:border-white/20'}`}
              key={item}>{item}</span>
          ))}
        </div>
        <button disabled={loading} type='submit' className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#2C341F] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Hash className='w-5' />}
          Generate title
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-[#0F0F12] rounded-lg flex flex-col border border-white/10 min-h-96'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Hash className='w-5 h-5 text-[#8E37EB]' />
            <h1 className='text-xl font-semibold'>Generated titles</h1>
          </div>
          {content && (
            <button onClick={() => copy(content)} className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors'>
              {copied ? <Check className='w-3.5 h-3.5 text-green-400' /> : <Copy className='w-3.5 h-3.5' />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-600'>
              <Hash className='w-9 h-9' />
              <p>Enter a topic and click "Generate title" to get started</p>
            </div>
          </div>
        ) : (
          <div className='mt-3 text-sm text-gray-300'>
            <div className='reset-tw prose prose-invert prose-sm max-w-none'><Markdown>{content}</Markdown></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogTitles