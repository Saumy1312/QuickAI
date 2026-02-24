import { Image, Sparkles, Download } from 'lucide-react'
import React, { useState } from 'react'
import useGenerateImage from '../hooks/useGenerateImage'

const GenerateImages = () => {
  const imageStyle = ['Realistic', 'Ghibli style', 'Anime style', 'Cartoon style', 'Fantasy style', 'Realistic style', '3D style', 'Portrait style']
  const [selectedStyle, setSelectedStyle] = useState('Realistic')
  const [input, setInput] = useState('')
  const [publish, setPublish] = useState(false)
  const { loading, content, generate, download } = useGenerateImage('/api/ai/generate-image')

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    await generate({ prompt: `Generate an image of ${input} in the style ${selectedStyle}`, publish })
  }

  return (
    <div className='h-full overflow-y-auto p-6 flex items-start flex-wrap gap-4 bg-[#0A0A0D] text-white'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-[#0F0F12] rounded-lg border border-white/10'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00AD25]' />
          <h1 className='text-xl font-semibold'>AI Image Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium text-gray-300'>Describe Your Image</p>
        <textarea onChange={(e) => setInput(e.target.value)} value={input} rows={4}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-green-500/50 transition-colors'
          placeholder='Describe what you want to see in the image...' required />
        <p className='mt-4 text-sm font-medium text-gray-300'>Style</p>
        <div className='mt-3 flex gap-3 flex-wrap'>
          {imageStyle.map((item) => (
            <span onClick={() => setSelectedStyle(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition-colors ${selectedStyle === item ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'text-gray-400 border-white/10 hover:border-white/20'}`}
              key={item}>{item}</span>
          ))}
        </div>
        <div className='my-6 flex items-center gap-2'>
          <label className='relative cursor-pointer'>
            <input type="checkbox" onChange={(e) => setPublish(e.target.checked)} checked={publish} className='sr-only peer' />
            <div className='w-9 h-5 bg-white/10 rounded-full peer-checked:bg-green-500 transition'></div>
            <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'></span>
          </label>
          <p className='text-sm text-gray-300'>Make this image Public</p>
        </div>
        <button disabled={loading} type='submit' className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 mt-2 text-sm rounded-lg cursor-pointer disabled:opacity-50'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Image className='w-5' />}
          Generate image
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-[#0F0F12] rounded-lg flex flex-col border border-white/10 min-h-96'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Image className='w-5 h-5 text-[#00AD25]' />
            <h1 className='text-xl font-semibold'>Generated image</h1>
          </div>
          {content && (
            <button onClick={() => download('generated-image.png')} className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors'>
              <Download className='w-3.5 h-3.5' /> Download
            </button>
          )}
        </div>
        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-600'>
              <Image className='w-9 h-9' />
              <p>Enter a topic and click "Generate image" to get started</p>
            </div>
          </div>
        ) : (
          <div className='mt-3 h-full'>
            <img src={content} alt="image" className='w-full h-full rounded-lg' />
          </div>
        )}
      </div>
    </div>
  )
}

export default GenerateImages