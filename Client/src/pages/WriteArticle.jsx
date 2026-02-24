import { Edit, Sparkles, Copy, Check } from 'lucide-react'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import useGenerateText from '../hooks/useGenerateText'
import useCopyToClipboard from '../hooks/useCopyToClipboard'

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: 'Short (500-800 words)' },
    { length: 1200, text: 'Medium (800-1200 words)' },
    { length: 1600, text: 'Long (1600+ words)' },
  ]
  const [selectedLength, setSelectedLength] = useState(articleLength[0])
  const [input, setInput] = useState('')
  const { loading, content, generate } = useGenerateText('/api/ai/generate-article')
  const { copied, copy } = useCopyToClipboard()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    await generate({ prompt: `Write an article about ${input} in ${selectedLength.text}`, length: selectedLength.length })
  }

  return (
    <div className='h-full overflow-y-auto p-6 flex items-start flex-wrap gap-4 bg-[#0A0A0D] text-white'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-[#0F0F12] rounded-lg border border-white/10'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Article Configuration</h1>
        </div>
        <p className='mt-6 text-sm font-medium text-gray-300'>Article Topic</p>
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text"
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-blue-500/50 transition-colors'
          placeholder='The future of artificial intelligence is....' required />
        <p className='mt-4 text-sm font-medium text-gray-300'>Article Length</p>
        <div className='mt-3 flex gap-3 flex-wrap'>
          {articleLength.map((item, index) => (
            <span onClick={() => setSelectedLength(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition-colors ${selectedLength.text === item.text ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'text-gray-400 border-white/10 hover:border-white/20'}`}
              key={index}>{item.text}</span>
          ))}
        </div>
        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Edit className='w-5' />}
          Generate article
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-[#0F0F12] rounded-lg flex flex-col border border-white/10 min-h-96'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Edit className='w-5 h-5 text-[#4A7AFF]' />
            <h1 className='text-xl font-semibold'>Generated Article</h1>
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
              <Edit className='w-9 h-9' />
              <p>Enter a topic and click "Generate article" to get started</p>
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

export default WriteArticle