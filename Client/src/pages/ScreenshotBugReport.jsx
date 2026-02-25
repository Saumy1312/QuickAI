import { Bug, Sparkles, Upload, Copy, Check } from 'lucide-react'
import React, { useState, useRef } from 'react'
import Markdown from 'react-markdown'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import useCopyToClipboard from '../hooks/useCopyToClipboard'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const ScreenshotBugReport = () => {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')
  const [appContext, setAppContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [content, setContent] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('bug-report-content')) || '' } catch { return '' }
  })
  const { getToken } = useAuth()
  const { copied, copy } = useCopyToClipboard()
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(file)
    } else {
      toast.error('Please upload an image file')
    }
  }

  const handleFileChange = (e) => handleFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!image) return toast.error('Please upload a screenshot')
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', image)
      if (appContext) formData.append('appContext', appContext)
      const { data } = await axios.post('/api/ai/screenshot-bug-report', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setContent(data.content)
        sessionStorage.setItem('bug-report-content', JSON.stringify(data.content))
      } else { toast.error(data.message) }
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  return (
    <div className='h-full flex flex-col bg-[#0A0A0D] text-white'>
      {/* Config bar */}
      <div className='border-b border-white/10 bg-[#0F0F12] px-6 py-4 flex-shrink-0'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center'>
            <Bug className='w-3.5 h-3.5 text-red-400' />
          </div>
          <h1 className='text-base font-semibold'>Screenshot → Bug Report</h1>
        </div>

        <form onSubmit={onSubmitHandler}>
          <div className='flex gap-3 items-end flex-wrap'>
            {/* Screenshot upload with drag & drop */}
            <div className='w-56 flex-shrink-0'>
              <label className='text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5 block'>Screenshot</label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors
                  ${dragging ? 'border-red-500/60 bg-red-500/10' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <Upload className='w-4 h-4 text-gray-400 flex-shrink-0' />
                <span className='text-sm text-gray-400 truncate'>{fileName || 'Upload or drag image...'}</span>
                <input ref={fileInputRef} onChange={handleFileChange} type="file" accept='image/*' className='hidden' />
              </div>
            </div>

            {/* Preview thumbnail */}
            {preview && <img src={preview} alt="Preview" className='h-11 w-11 object-cover rounded-lg border border-white/10 flex-shrink-0' />}

            {/* Optional context */}
            <div className='flex-1 min-w-[180px]'>
              <label className='text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5 block'>App Context <span className='normal-case text-gray-600'>(optional)</span></label>
              <input onChange={(e) => setAppContext(e.target.value)} value={appContext} type="text"
                className='w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-600 focus:border-red-500/50 transition-colors'
                placeholder='e.g. React e-commerce checkout page...' />
            </div>

            {/* Submit */}
            <button disabled={loading} type='submit'
              className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm font-medium disabled:opacity-50 whitespace-nowrap'>
              {loading
                ? <><span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'></span>Generating...</>
                : <><Bug className='w-4 h-4' />Generate Report</>}
            </button>
          </div>
        </form>
      </div>

      {/* Output */}
      <div className='flex-1 overflow-y-auto p-6'>
        {!content ? (
          <div className='flex flex-col items-center justify-center h-full text-gray-700'>
            <Bug className='w-10 h-10 mb-3 opacity-30' />
            <p className='text-sm'>Upload a UI screenshot and get a professional bug report instantly</p>
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Bug Report</p>
              <button onClick={() => copy(content)}
                className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 transition-colors'>
                {copied ? <Check className='w-3.5 h-3.5 text-green-400' /> : <Copy className='w-3.5 h-3.5' />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className='bg-[#0F0F12] rounded-xl border border-white/10 p-6'>
              <div className='reset-tw prose prose-invert prose-sm max-w-none'><Markdown>{content}</Markdown></div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ScreenshotBugReport