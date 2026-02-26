import { FileText, Sparkles, Search, CheckCircle, Target, Copy, Check, Upload } from 'lucide-react'
import React, { useState, useRef } from 'react'
import Markdown from 'react-markdown'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import useCopyToClipboard from '../hooks/useCopyToClipboard'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const TABS = [
  { id: 'review', label: 'Review', Icon: FileText, color: 'emerald' },
  { id: 'ats', label: 'ATS Check', Icon: Search, color: 'emerald' },
  { id: 'match', label: 'Job Match', Icon: Target, color: 'violet' },
]

const ReviewResume = () => {
  const [tab, setTab] = useState('review')
  const [resume, setResume] = useState(null)
  const [fileName, setFileName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [content, setContent] = useState('')
  const { getToken } = useAuth()
  const { copied, copy } = useCopyToClipboard()
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (file && file.type === 'application/pdf') {
      setResume(file); setFileName(file.name); setContent('')
    } else toast.error('Please upload a PDF file')
  }

  const handleFileChange = (e) => handleFile(e.target.files[0])
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!resume) return toast.error('Please upload a resume PDF')
    if (tab === 'match' && !jobDescription.trim()) return toast.error('Please paste a job description')
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('resume', resume)
      let endpoint = '/api/ai/resume-review'
      if (tab === 'match') {
        endpoint = '/api/ai/resume-job-match'
        formData.append('jobDescription', jobDescription)
      } else {
        formData.append('analysisType', tab)
      }
      const { data } = await axios.post(endpoint, formData, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) setContent(data.content)
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  const tabColor = tab === 'match' ? 'violet' : 'emerald'
  const activeClass = tab === 'match'
    ? 'bg-violet-500/20 text-violet-400 border-violet-500/40'
    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
  const btnClass = tab === 'match'
    ? 'bg-gradient-to-r from-violet-600 to-purple-500'
    : 'bg-gradient-to-r from-[#00DA83] to-[#009BB3]'

  return (
    <div className='h-full flex flex-col bg-[#0A0A0D] text-white'>
      {/* Config bar */}
      <div className='border-b border-white/10 bg-[#0F0F12] px-4 py-3 flex-shrink-0'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
            <Sparkles className='w-3.5 h-3.5 text-[#00DA83]' />
          </div>
          <h1 className='text-base font-semibold'>Resume Tools</h1>
        </div>

        {/* Tabs */}
        <div className='flex gap-1.5 mb-3'>
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} type='button' onClick={() => { setTab(id); setContent('') }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${tab === id ? activeClass : 'text-gray-400 border-white/10 hover:border-white/20'}`}>
              <Icon className='w-3 h-3' />{label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmitHandler} className='flex flex-col gap-2'>
          {/* Resume upload */}
          <div
            onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${dragging ? 'border-emerald-500/60 bg-emerald-500/10' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
            <Upload className='w-4 h-4 text-gray-400 flex-shrink-0' />
            <span className='text-sm text-gray-400 truncate'>{fileName || 'Upload resume PDF or drag here...'}</span>
            <input ref={fileInputRef} onChange={handleFileChange} type="file" accept='application/pdf' className='hidden' />
          </div>

          {/* Job description — only for match tab */}
          {tab === 'match' && (
            <textarea onChange={(e) => setJobDescription(e.target.value)} value={jobDescription} rows={2}
              className='w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-600 focus:border-violet-500/50 transition-colors resize-none'
              placeholder='Paste the job description here...' />
          )}

          <button disabled={loading} type='submit'
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${btnClass} text-white text-sm font-medium disabled:opacity-50`}>
            {loading
              ? <><span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'></span>Analyzing...</>
              : tab === 'review' ? <><FileText className='w-4 h-4' />Review Resume</>
              : tab === 'ats' ? <><CheckCircle className='w-4 h-4' />Check ATS Score</>
              : <><Target className='w-4 h-4' />Match to Job</>}
          </button>
        </form>
      </div>

      {/* Output */}
      <div className='flex-1 overflow-y-auto p-4'>
        {!content ? (
          <div className='flex flex-col items-center justify-center h-full text-gray-700'>
            <FileText className='w-10 h-10 mb-3 opacity-30' />
            <p className='text-sm text-center'>
              {tab === 'review' ? 'Upload your resume for a detailed review' :
               tab === 'ats' ? 'Check how well your resume passes ATS filters' :
               'Upload resume + paste job description to see your match score'}
            </p>
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between mb-3'>
              <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>
                {tab === 'review' ? 'Review Results' : tab === 'ats' ? 'ATS Analysis' : 'Match Analysis'}
              </p>
              <button onClick={() => copy(content)} className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 transition-colors'>
                {copied ? <Check className='w-3.5 h-3.5 text-green-400' /> : <Copy className='w-3.5 h-3.5' />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className='bg-[#0F0F12] rounded-xl border border-white/10 p-4'>
              <div className='reset-tw prose prose-invert prose-sm max-w-none'><Markdown>{content}</Markdown></div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ReviewResume