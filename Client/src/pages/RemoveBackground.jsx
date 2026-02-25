import { Eraser, Sparkles, Download, Upload } from 'lucide-react'
import React, { useState } from 'react'
import useGenerateImage from '../hooks/useGenerateImage'

const RemoveBackground = () => {
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')
  const { loading, content, generate, download } = useGenerateImage('/api/ai/remove-image-background', 'remove-bg-content')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(file)
    } else { setPreview(null); setFileName('') }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    const file = e.target.image.files[0]
    const formData = new FormData()
    formData.append('image', file)
    await generate(formData)
  }

  return (
    <div className='h-full flex flex-col bg-[#0A0A0D] text-white'>
      {/* Config bar */}
      <div className='border-b border-white/10 bg-[#0F0F12] px-6 py-4 flex-shrink-0'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center'>
            <Sparkles className='w-3.5 h-3.5 text-[#FF4938]' />
          </div>
          <h1 className='text-base font-semibold'>Background Remover</h1>
        </div>
        <form onSubmit={onSubmitHandler}>
          <div className='flex gap-3 items-end flex-wrap'>
            <div className='flex-1 min-w-[200px]'>
              <label className='text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5 block'>Upload Image</label>
              <label className='flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-colors'>
                <Upload className='w-4 h-4 text-gray-400 flex-shrink-0' />
                <span className='text-sm text-gray-400 truncate'>{fileName || 'Choose an image file...'}</span>
                <input name="image" onChange={handleFileChange} type="file" accept='image/*' className='hidden' required />
              </label>
              <p className='text-xs text-gray-600 mt-1'>Supports JPG, PNG, WEBP</p>
            </div>
            {preview && <img src={preview} alt="Preview" className='h-11 w-11 object-cover rounded-lg border border-white/10 flex-shrink-0' />}
            <button disabled={loading} type='submit' className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white text-sm font-medium disabled:opacity-50 whitespace-nowrap'>
              {loading ? <><span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'></span>Processing...</> : <><Eraser className='w-4 h-4' />Remove Background</>}
            </button>
          </div>
        </form>
      </div>

      {/* Output */}
      <div className='flex-1 overflow-y-auto p-6'>
        {!content ? (
          <div className='flex flex-col items-center justify-center h-full text-gray-700'>
            <Eraser className='w-10 h-10 mb-3 opacity-30' />
            <p className='text-sm'>Upload an image above and click Remove Background</p>
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Processed Image</p>
              <button onClick={() => download('no-background.png')} className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 transition-colors'>
                <Download className='w-3.5 h-3.5' /> Download
              </button>
            </div>
            <div className='max-w-2xl rounded-xl border border-white/10 overflow-hidden'
              style={{ backgroundImage: 'repeating-conic-gradient(#1a1a1a 0% 25%, #111 0% 50%)', backgroundSize: '20px 20px' }}>
              <img src={content} alt="Processed" className='w-full' />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default RemoveBackground