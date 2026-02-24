import { FileText, Sparkles, Search, CheckCircle, Copy, Check } from 'lucide-react'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import useCopyToClipboard from '../hooks/useCopyToClipboard'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

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
    <div className='h-full overflow-y-auto bg-[#0A0A0D] text-white'>
      {/* Config bar */}
      <div className='border-b border-white/10 bg-[#0F0F12] px-6 py-5'>
        <div className='flex items-center gap-3 mb-5'>
          <div className='w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
            <Sparkles className='w-4 h-4 text-[#00DA83]' />
          </div>
          <h1 className='text-lg font-semibold'>Resume Analysis</h1>
        </div>
        <form onSubmit={onSubmitHandler}>
          <div className='flex flex-wrap gap-3 items-end'>
            {/* Analysis type */}
            <div>
              <label className='text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5 block'>Analysis Type</label>
              <div className='flex gap-1.5'>
                {[{ value: 'review', label: 'Review', Icon: FileText }, { value: 'ats', label: 'ATS Check', Icon: Search }].map(({ value, label, Icon }) => (
                  <button type='button' key={value} onClick={() => setAnalysisType(value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border transition-all ${analysisType === value ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'text-gray-400 border-white/10 hover:border-white/20'}`}>
                    <Icon className='w-3.5 h-3.5' />{label}
                  </button>
                ))}
              </div>
            </div>
            {/* File upload */}
            <div className='flex-1 min-w-[200px]'>
              <label className='text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5 block'>Resume (PDF)</label>
              <input onChange={(e) => setInput(e.target.files[0])} type="file" accept='application/pdf'
                className='w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 file:mr-3 file:text-xs file:bg-white/10 file:border-0 file:text-gray-300 file:rounded file:px-2 file:py-1 cursor-pointer'
                required />
            </div>
            <button disabled={loading} type='submit' className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white text-sm font-medium disabled:opacity-50 whitespace-nowrap'>
              {loading ? <><span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'></span>Analyzing...</>
                : analysisType === 'ats' ? <><CheckCircle className='w-4 h-4' />Check ATS</> : <><FileText className='w-4 h-4' />Review</>}
            </button>
          </div>
        </form>
      </div>

      {/* Output */}
      <div className='p-6'>
        {!content ? (
          <div className='flex flex-col items-center justify-center py-24 text-gray-700'>
            <FileText className='w-10 h-10 mb-3 opacity-30' />
            <p className='text-sm'>Upload your resume above and click Review</p>
          </div>
        ) : (
          <div className='max-w-3xl'>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>
                {analysisType === 'ats' ? 'ATS Analysis Results' : 'Review Results'}
              </p>
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

export default ReviewResume