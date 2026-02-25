import { Image, Sparkles, Download } from 'lucide-react'
import React, { useState } from 'react'
import useGenerateImage from '../hooks/useGenerateImage'

const GenerateImages = () => {
  const imageStyle = ['Realistic', 'Ghibli style', 'Anime style', 'Cartoon style', 'Fantasy style', '3D style', 'Portrait style']
  const [selectedStyle, setSelectedStyle] = useState('Realistic')
  const [input, setInput] = useState('')
  const [publish, setPublish] = useState(false)
  const { loading, content, generate, download } = useGenerateImage('/api/ai/generate-image', 'generate-image-content')

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    await generate({ prompt: `Generate an image of ${input} in the style ${selectedStyle}`, publish })
  }

  return (
    <div className='h-full flex flex-col bg-[#0A0A0D] text-white'>
      {/* Config bar */}
      <div className='border-b border-white/10 bg-[#0F0F12] px-6 py-4 flex-shrink-0'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center'>
            <Sparkles className='w-3.5 h-3.5 text-[#00AD25]' />
          </div>
          <h1 className='text-base font-semibold'>AI Image Generator</h1>
        </div>
        <form onSubmit={onSubmitHandler}>
          <div className='flex flex-col gap-3'>
            <div className='flex gap-3 items-end flex-wrap'>
              <div className='flex-1 min-w-[200px]'>
                <label className='text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5 block'>Prompt</label>
                <input onChange={(e) => setInput(e.target.value)} value={input} type="text"
                  className='w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-600 focus:border-green-500/50 transition-colors'
                  placeholder='A futuristic city at sunset...' required />
              </div>
              <label className='flex items-center gap-2 cursor-pointer pb-0.5'>
                <div className='relative'>
                  <input type="checkbox" onChange={(e) => setPublish(e.target.checked)} checked={publish} className='sr-only peer' />
                  <div className='w-8 h-4 bg-white/10 rounded-full peer-checked:bg-green-500 transition'></div>
                  <span className='absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'></span>
                </div>
                <span className='text-xs text-gray-400 whitespace-nowrap'>Make Public</span>
              </label>
              <button disabled={loading} type='submit' className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white text-sm font-medium disabled:opacity-50 whitespace-nowrap'>
                {loading ? <><span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'></span>Generating...</> : <><Image className='w-4 h-4' />Generate</>}
              </button>
            </div>
            <div>
              <label className='text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5 block'>Style</label>
              <div className='flex gap-1.5 flex-wrap'>
                {imageStyle.map((item) => (
                  <button type='button' key={item} onClick={() => setSelectedStyle(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedStyle === item ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'text-gray-400 border-white/10 hover:border-white/20'}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Output */}
      <div className='flex-1 overflow-y-auto p-6'>
        {!content ? (
          <div className='flex flex-col items-center justify-center h-full text-gray-700'>
            <Image className='w-10 h-10 mb-3 opacity-30' />
            <p className='text-sm'>Describe your image above and click Generate</p>
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Generated Image</p>
              <button onClick={() => download('generated-image.png')} className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 transition-colors'>
                <Download className='w-3.5 h-3.5' /> Download
              </button>
            </div>
            <img src={content} alt="Generated" className='max-w-2xl w-full rounded-xl border border-white/10' />
          </>
        )}
      </div>
    </div>
  )
}

export default GenerateImages