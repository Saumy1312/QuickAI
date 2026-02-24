import { FileText, Sparkles, Search, CheckCircle, Copy, Check } from 'lucide-react'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import useCopyToClipboard from '../hooks/useCopyToClipboard'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

// ReviewResume uses FormData so we handle it directly (not via useGenerateText)
const ReviewResume = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [analysisType, setAnalysisType] = useState('review')
  const { getToken } = useAuth()
  const { copied, copy } = useCopyToClipboard()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('resume', input)
      formData.append('analysisType', analysisType)
      const { data } = await axios.post('/api/ai/resume-review', formData, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) { setContent(data.content) } else { toast.error(data.message) }
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-auto p-6 flex items-start flex-wrap gap-4 bg-[#0A0A0D] text-white'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-[#0F0F12] rounded-lg border border-white/10'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Resume Analysis</h1>
        </div>
        <div className='mt-6'>
          <p className='text-sm font-medium mb-3 text-gray-300'>Choose Analysis Type</p>
          <div className='flex gap-4'>
            {[{ value: 'review', label: 'Review', Icon: FileText }, { value: 'ats', label: 'ATS Check', Icon: Search }].map(({ value, label, Icon }) => (
              <label key={value} className='flex items-center gap-2 cursor-pointer text-gray-300'>
                <input type="radio" name="analysisType" value={value} checked={analysisType === value}
                  onChange={(e) => setAnalysisType(e.target.value)} className='w-4 h-4 accent-[#00DA83]' />
                <Icon className='w-4 h-4' />
                <span className='text-sm'>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <p className='mt-6 text-sm font-medium text-gray-300'>Upload Resume</p>
        <input onChange={(e) => setInput(e.target.files[0])} type="file" accept='application/pdf'
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-white/10 bg-white/5 text-gray-300 file:mr-3 file:text-xs file:bg-white/10 file:border-0 file:text-gray-300 file:rounded file:px-2 file:py-1 cursor-pointer'
          required />
        <p className='text-xs text-gray-500 font-light mt-1'>Supports PDF resume only</p>
        <button disabled={loading} type='submit' className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-50'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
            : analysisType === 'ats' ? <CheckCircle className='w-5' /> : <FileText className='w-5' />}
          {analysisType === 'ats' ? 'Check ATS Compatibility' : 'Review Resume'}
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-[#0F0F12] rounded-lg flex flex-col border border-white/10 min-h-96'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {analysisType === 'ats' ? <CheckCircle className='w-5 h-5 text-[#00DA83]' /> : <FileText className='w-5 h-5 text-[#00DA83]' />}
            <h1 className='text-xl font-semibold'>{analysisType === 'ats' ? 'ATS Analysis Results' : 'Review Results'}</h1>
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
              {analysisType === 'ats' ? <CheckCircle className='w-9 h-9' /> : <FileText className='w-9 h-9' />}
              <p>Upload a resume and click "{analysisType === 'ats' ? 'Check ATS Compatibility' : 'Review Resume'}" to get started</p>
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

export default ReviewResume