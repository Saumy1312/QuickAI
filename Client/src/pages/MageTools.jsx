import React, { useState, useRef } from 'react'
import {
  Sparkles, Image, Type, RefreshCw, Eraser,
  Crop, ArrowUpCircle, Upload, Download, X, ChevronRight
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const TOOLS = [
  {
    id: 'generate',
    label: 'Text to Image',
    icon: Sparkles,
    desc: 'Generate images from a text prompt using AI',
    color: 'from-violet-500 to-purple-600',
    accent: 'violet',
    needsImage: false,
    needsMask: false,
    needsPrompt: true,
  },
  {
    id: 'remove-background',
    label: 'Remove Background',
    icon: Image,
    desc: 'Instantly remove the background from any photo',
    color: 'from-blue-500 to-cyan-500',
    accent: 'blue',
    needsImage: true,
    needsMask: false,
    needsPrompt: false,
  },
  {
    id: 'remove-text',
    label: 'Remove Text',
    icon: Type,
    desc: 'Erase text overlays and watermarks from images',
    color: 'from-rose-500 to-pink-500',
    accent: 'rose',
    needsImage: true,
    needsMask: false,
    needsPrompt: false,
  },
  {
    id: 'replace-background',
    label: 'Replace Background',
    icon: RefreshCw,
    desc: 'Swap the background using a text prompt',
    color: 'from-amber-500 to-orange-500',
    accent: 'amber',
    needsImage: true,
    needsMask: false,
    needsPrompt: true,
  },
  {
    id: 'cleanup',
    label: 'Cleanup',
    icon: Eraser,
    desc: 'Remove unwanted objects using a painted mask',
    color: 'from-teal-500 to-emerald-500',
    accent: 'teal',
    needsImage: true,
    needsMask: true,
    needsPrompt: false,
  },
  {
    id: 'uncrop',
    label: 'Uncrop',
    icon: Crop,
    desc: 'Extend your image canvas in any direction with AI',
    color: 'from-indigo-500 to-blue-500',
    accent: 'indigo',
    needsImage: true,
    needsMask: false,
    needsPrompt: false,
  },
  {
    id: 'upscale',
    label: 'Image Upscaling',
    icon: ArrowUpCircle,
    desc: 'Increase image resolution up to 4x with AI',
    color: 'from-green-500 to-emerald-400',
    accent: 'green',
    needsImage: true,
    needsMask: false,
    needsPrompt: false,
  },
]

const accentClasses = {
  violet: { ring: 'ring-violet-500/40', border: 'border-violet-500/40', text: 'text-violet-400', bg: 'bg-violet-500/10', activeSidebar: 'bg-violet-500/10 text-violet-300 border-r-2 border-violet-500' },
  blue:   { ring: 'ring-blue-500/40',   border: 'border-blue-500/40',   text: 'text-blue-400',   bg: 'bg-blue-500/10',   activeSidebar: 'bg-blue-500/10 text-blue-300 border-r-2 border-blue-500' },
  rose:   { ring: 'ring-rose-500/40',   border: 'border-rose-500/40',   text: 'text-rose-400',   bg: 'bg-rose-500/10',   activeSidebar: 'bg-rose-500/10 text-rose-300 border-r-2 border-rose-500' },
  amber:  { ring: 'ring-amber-500/40',  border: 'border-amber-500/40',  text: 'text-amber-400',  bg: 'bg-amber-500/10',  activeSidebar: 'bg-amber-500/10 text-amber-300 border-r-2 border-amber-500' },
  teal:   { ring: 'ring-teal-500/40',   border: 'border-teal-500/40',   text: 'text-teal-400',   bg: 'bg-teal-500/10',   activeSidebar: 'bg-teal-500/10 text-teal-300 border-r-2 border-teal-500' },
  indigo: { ring: 'ring-indigo-500/40', border: 'border-indigo-500/40', text: 'text-indigo-400', bg: 'bg-indigo-500/10', activeSidebar: 'bg-indigo-500/10 text-indigo-300 border-r-2 border-indigo-500' },
  green:  { ring: 'ring-green-500/40',  border: 'border-green-500/40',  text: 'text-green-400',  bg: 'bg-green-500/10',  activeSidebar: 'bg-green-500/10 text-green-300 border-r-2 border-green-500' },
}

// Reusable file upload drop zone
const FileUploadZone = ({ label, sublabel, file, onFile, onClear, inputRef, accent }) => {
  const ac = accentClasses[accent]
  return (
    <div>
      {label && <p className='text-xs text-gray-400 mb-1.5 font-medium'>{label} {sublabel && <span className='text-gray-600 font-normal'>{sublabel}</span>}</p>}
      <input ref={inputRef} type='file' accept='image/*' className='hidden' onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]) }} />
      {file ? (
        <div className='relative w-fit group'>
          <img
            src={URL.createObjectURL(file)} alt='preview'
            className={`max-h-44 max-w-xs rounded-xl border ${ac.border} object-contain`}
          />
          <button
            onClick={onClear}
            className='absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500/80'>
            <X className='w-3 h-3 text-white' />
          </button>
          <p className='text-[11px] text-gray-500 mt-1 truncate max-w-xs'>{file.name}</p>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current.click()}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border border-dashed border-white/15 text-gray-500 hover:${ac.border} hover:${ac.text} text-sm transition-all w-full justify-center`}>
          <Upload className='w-4 h-4' />
          Click to upload image
        </button>
      )}
    </div>
  )
}

const MageTools = () => {
  const [activeTool, setActiveTool]     = useState('generate')
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState(null)
  const [imageFile, setImageFile]       = useState(null)
  const [maskFile, setMaskFile]         = useState(null)
  const [prompt, setPrompt]             = useState('')
  const [uncrop, setUncrop]             = useState({ extend_left: 256, extend_right: 256, extend_up: 256, extend_down: 256 })
  const [upscale, setUpscale]           = useState({ target_width: 2048, target_height: 2048 })

  const imageRef = useRef()
  const maskRef  = useRef()

  const tool = TOOLS.find(t => t.id === activeTool)
  const ac   = accentClasses[tool.accent]

  const resetState = () => {
    setResult(null)
    setImageFile(null)
    setMaskFile(null)
    setPrompt('')
  }

  const handleToolChange = (id) => {
    setActiveTool(id)
    resetState()
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = result
    a.download = `${activeTool}-result.png`
    a.target = '_blank'
    a.click()
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setResult(null)
      let response

      if (activeTool === 'generate') {
        if (!prompt.trim()) { toast.error('Please enter a prompt'); return }
        response = await axios.post('/api/ai/generate-image', { prompt, publish: false })

      } else if (activeTool === 'remove-background') {
        if (!imageFile) { toast.error('Please upload an image'); return }
        const fd = new FormData()
        fd.append('image', imageFile)
        response = await axios.post('/api/ai/remove-image-background', fd)

      } else if (activeTool === 'remove-text') {
        if (!imageFile) { toast.error('Please upload an image'); return }
        const fd = new FormData()
        fd.append('image_file', imageFile)
        response = await axios.post('/api/ai/clipdrop-remove-text', fd)

      } else if (activeTool === 'replace-background') {
        if (!imageFile) { toast.error('Please upload an image'); return }
        if (!prompt.trim()) { toast.error('Please enter a background prompt'); return }
        const fd = new FormData()
        fd.append('image_file', imageFile)
        fd.append('prompt', prompt)
        response = await axios.post('/api/ai/clipdrop-replace-background', fd)

      } else if (activeTool === 'cleanup') {
        if (!imageFile) { toast.error('Please upload an image'); return }
        if (!maskFile)  { toast.error('Please upload a mask image'); return }
        const fd = new FormData()
        fd.append('image_file', imageFile)
        fd.append('mask_file',  maskFile)
        response = await axios.post('/api/ai/clipdrop-cleanup', fd)

      } else if (activeTool === 'uncrop') {
        if (!imageFile) { toast.error('Please upload an image'); return }
        const fd = new FormData()
        fd.append('image_file', imageFile)
        Object.entries(uncrop).forEach(([k, v]) => fd.append(k, String(v)))
        response = await axios.post('/api/ai/clipdrop-uncrop', fd)

      } else if (activeTool === 'upscale') {
        if (!imageFile) { toast.error('Please upload an image'); return }
        const fd = new FormData()
        fd.append('image_file', imageFile)
        fd.append('target_width',  String(upscale.target_width))
        fd.append('target_height', String(upscale.target_height))
        response = await axios.post('/api/ai/clipdrop-upscale', fd)
      }

      if (response?.data?.success) {
        setResult(response.data.content)
        toast.success('Done!')
      } else {
        toast.error(response?.data?.message || 'Something went wrong')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='h-full flex bg-[#0A0A0D] text-white overflow-hidden'>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <div className='w-56 flex-shrink-0 border-r border-white/8 bg-[#0D0D10] flex flex-col'>
        <div className='px-4 pt-5 pb-3'>
          <p className='text-[10px] font-bold text-gray-600 uppercase tracking-widest'>Image Tools</p>
        </div>
        <div className='flex-1 overflow-y-auto pb-4'>
          {TOOLS.map(t => {
            const isActive = activeTool === t.id
            const itemAc   = accentClasses[t.accent]
            return (
              <button
                key={t.id}
                onClick={() => handleToolChange(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left
                  ${isActive ? itemAc.activeSidebar : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}>
                <t.icon className='w-4 h-4 flex-shrink-0' />
                <span className='flex-1 truncate'>{t.label}</span>
                {isActive && <ChevronRight className='w-3 h-3 opacity-60' />}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main Panel ──────────────────────────────────── */}
      <div className='flex-1 flex flex-col overflow-hidden'>

        {/* Header */}
        <div className='border-b border-white/8 bg-[#0F0F12] px-6 py-4 flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <div className={`w-9 h-9 rounded-xl ${ac.bg} border ${ac.border} flex items-center justify-center flex-shrink-0`}>
              <tool.icon className={`w-4 h-4 ${ac.text}`} />
            </div>
            <div>
              <h1 className='text-sm font-semibold text-white'>{tool.label}</h1>
              <p className='text-xs text-gray-500 mt-0.5'>{tool.desc}</p>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className='flex-1 overflow-y-auto'>
          <div className='max-w-2xl mx-auto px-6 py-6 flex flex-col gap-6'>

            {/* ── Prompt (generate & replace-background) ── */}
            {tool.needsPrompt && (
              <div>
                <label className='text-xs text-gray-400 mb-2 block font-medium'>
                  {activeTool === 'generate' ? 'Image Prompt' : 'Background Prompt'}
                </label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={3}
                  placeholder={
                    activeTool === 'generate'
                      ? 'A futuristic city at sunset, ultra realistic...'
                      : 'A sunny beach with palm trees and blue ocean...'
                  }
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none text-sm text-white
                    placeholder-gray-700 focus:${ac.border} focus:ring-1 ${ac.ring} transition-all resize-none`}
                />
              </div>
            )}

            {/* ── Image Upload ── */}
            {tool.needsImage && (
              <FileUploadZone
                label='Source Image'
                file={imageFile}
                onFile={setImageFile}
                onClear={() => setImageFile(null)}
                inputRef={imageRef}
                accent={tool.accent}
              />
            )}

            {/* ── Mask Upload (cleanup only) ── */}
            {tool.needsMask && (
              <FileUploadZone
                label='Mask Image'
                sublabel='— white areas will be removed'
                file={maskFile}
                onFile={setMaskFile}
                onClear={() => setMaskFile(null)}
                inputRef={maskRef}
                accent={tool.accent}
              />
            )}

            {/* ── Uncrop Controls ── */}
            {activeTool === 'uncrop' && (
              <div>
                <label className='text-xs text-gray-400 mb-3 block font-medium'>Extend canvas by (pixels)</label>
                <div className='grid grid-cols-2 gap-3'>
                  {Object.entries(uncrop).map(([key, val]) => (
                    <div key={key}>
                      <label className='text-[11px] text-gray-600 capitalize mb-1 block'>
                        {key.replace('extend_', '').replace('_', ' ')}
                      </label>
                      <input
                        type='number' min={0} max={2048} value={val}
                        onChange={e => setUncrop(p => ({ ...p, [key]: Number(e.target.value) }))}
                        className={`w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white
                          focus:border-indigo-500/50 focus:ring-1 ring-indigo-500/20 transition-all`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Upscale Controls ── */}
            {activeTool === 'upscale' && (
              <div>
                <label className='text-xs text-gray-400 mb-3 block font-medium'>Target dimensions (px)</label>
                <div className='grid grid-cols-2 gap-3'>
                  {Object.entries(upscale).map(([key, val]) => (
                    <div key={key}>
                      <label className='text-[11px] text-gray-600 capitalize mb-1 block'>
                        {key.replace('target_', '').replace('_', ' ')}
                      </label>
                      <input
                        type='number' min={512} max={4096} step={128} value={val}
                        onChange={e => setUpscale(p => ({ ...p, [key]: Number(e.target.value) }))}
                        className='w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white focus:border-green-500/50 focus:ring-1 ring-green-500/20 transition-all'
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Cleanup hint ── */}
            {activeTool === 'cleanup' && (
              <div className={`flex gap-2.5 items-start p-3 rounded-xl ${ac.bg} border ${ac.border}`}>
                <Eraser className={`w-4 h-4 ${ac.text} mt-0.5 flex-shrink-0`} />
                <p className='text-xs text-gray-400 leading-relaxed'>
                  Create a mask image where <span className='text-white font-medium'>white areas</span> mark the regions you want removed.
                  The source image and mask must be the <span className='text-white font-medium'>same dimensions</span>.
                </p>
              </div>
            )}

            {/* ── Submit Button ── */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r ${tool.color}
                text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed
                hover:opacity-90 transition-all shadow-lg w-full sm:w-fit`}>
              {loading ? (
                <>
                  <span className='w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin' />
                  Processing...
                </>
              ) : (
                <>
                  <tool.icon className='w-4 h-4' />
                  Run {tool.label}
                </>
              )}
            </button>

            {/* ── Result ── */}
            {result && (
              <div>
                <div className='flex items-center justify-between mb-3'>
                  <p className='text-xs text-gray-500 uppercase tracking-widest font-semibold'>Result</p>
                  <button
                    onClick={download}
                    className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors'>
                    <Download className='w-3.5 h-3.5' />
                    Download
                  </button>
                </div>
                <img
                  src={result}
                  alt='Result'
                  className={`w-full rounded-2xl border ${ac.border} shadow-2xl`}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default MageTools