import { Scissors, Sparkles, Download } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import useGenerateImage from '../hooks/useGenerateImage'

const RemoveObject = () => {
  const [preview, setPreview] = useState(null)
  const [object, setObject] = useState('')
  const { loading, content, generate, download } = useGenerateImage('/api/ai/remove-image-object')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(file)
    } else { setPreview(null) }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (object.split(' ').length > 1) return toast('Please enter only one object')
    const file = e.target.image.files[0]
    const formData = new FormData()
    formData.append('image', file)
    formData.append('object', object)
    await generate(formData)
  }

  return (
    <div className='h-full overflow-y-auto p-6 flex items-start flex-wrap gap-4 bg-[#0A0A0D] text-white'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-[#0F0F12] rounded-lg border border-white/10'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Object Remover</h1>
        </div>
        <p className='mt-6 text-sm font-medium text-gray-300'>Upload image</p>
        <input name="image" onChange={handleFileChange} type="file" accept='image/*'
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-white/10 bg-white/5 text-gray-300 file:mr-3 file:text-xs file:bg-white/10 file:border-0 file:text-gray-300 file:rounded file:px-2 file:py-1 cursor-pointer'
          required />
        {preview && <img src={preview} alt="Preview" className='mt-3 w-50 h-32 object-cover rounded-md border border-white/10' />}
        <p className='mt-6 text-sm font-medium text-gray-300'>Describe object name to remove</p>
        <textarea onChange={(e) => setObject(e.target.value)} value={object} rows={4}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-blue-500/50 transition-colors'
          placeholder='e.g., watch or phone, Only single Object name' required />
        <button disabled={loading} type='submit' className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Scissors className='w-5' />}
          Remove object
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-[#0F0F12] rounded-lg flex flex-col border border-white/10 min-h-96'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Scissors className='w-5 h-5 text-[#4A7AFF]' />
            <h1 className='text-xl font-semibold'>Processed Image</h1>
          </div>
          {content && (
            <button onClick={() => download('removed-object.png')} className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors'>
              <Download className='w-3.5 h-3.5' /> Download
            </button>
          )}
        </div>
        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-600'>
              <Scissors className='w-9 h-9' />
              <p>Upload an image and click "Remove Object" to get started</p>
            </div>
          </div>
        ) : (
          <img src={content} alt="image" className='mt-3 w-full h-full rounded-lg' />
        )}
      </div>
    </div>
  )
}

export default RemoveObject