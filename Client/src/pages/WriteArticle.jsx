import { Edit, Sparkles, Copy, Check } from 'lucide-react'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import useGenerateText from '../hooks/useGenerateText'
import useCopyToClipboard from '../hooks/useCopyToClipboard'

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: 'Short' },
    { length: 1200, text: 'Medium' },
    { length: 1600, text: 'Long' },
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
    <div className='h-full overflow-y-auto bg-[#0A0A0D] text-white'>
      {/* Config bar */}
      <div className='border-b border-white/10 bg-[#0F0F12] px-6 py-5'>
        <div className='flex items-center gap-3 mb-5'>
          <div className='w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center'>
            <Sparkles className='w-4 h-4 text-[#4A7AFF]' />
          </div>
          <h1 className='text-lg font-semibold'>Write Article</h1>
        </div>
        <form onSubmit={onSubmitHandler}>
          <div className='flex flex-wrap gap-3 items-end'>
            <div className='flex-1 min-w-[200px]'>
              <label className='text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5 block'>Topic</label>
              <input onChange={(e) => setInput(e.target.value)} value={input} type="text"
                className='w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-600 focus:border-blue-500/50 transition-colors'
                placeholder='The future of artificial intelligence...' required />
            </div>
            <div>
              <label className='text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5 block'>Length</label>
              <div className='flex gap-1.5'>
                {articleLength.map((item, index) => (
                  <button type='button' key={index} onClick={() => setSelectedLength(item)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-medium border transition-all ${selectedLength.text === item.text ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'text-gray-400 border-white/10 hover:border-white/20'}`}>
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
            <button disabled={loading} className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white text-sm font-medium disabled:opacity-50 whitespace-nowrap'>
              {loading ? <><span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'></span>Generating...</> : <><Edit className='w-4 h-4' />Generate</>}
            </button>
          </div>
        </form>
      </div>

      {/* Output */}
      <div className='p-6'>
        {!content ? (
          <div className='flex flex-col items-center justify-center py-24 text-gray-700'>
            <Edit className='w-10 h-10 mb-3 opacity-30' />
            <p className='text-sm'>Enter a topic above and click Generate</p>
          </div>
        ) : (
          <div className='max-w-3xl'>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Generated Article</p>
              <button onClick={() => copy(content)} className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 transition-colors'>
                {copied ? <Check className='w-3.5 h-3.5 text-green-400' /> : <Copy className='w-3.5 h-3.5' />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className='bg-[#0F0F12] rounded-xl border border-white/10 p-6'>
              <div className='reset-tw prose prose-invert prose-sm max-w-none'><Markdown>{content}</Markdown></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WriteArticle