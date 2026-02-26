import React, { useState, useRef } from 'react'
import {
  Sparkles, ImageIcon, Type, RefreshCw, Eraser,
  Crop, ArrowUpCircle, Upload, Download, X, Scissors, ChevronDown
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

// ── Image compression (max 1920px, 85% quality, triggers above 4MB) ──
const compressImage = (file) => {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX = 1920
      let { width, height } = img
      if (width > MAX) { height = (height * MAX) / width; width = MAX }
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        blob => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
        'image/jpeg', 0.85
      )
    }
  })
}

const processFile = async (file) => {
  if (file.size > 4 * 1024 * 1024) {
    toast.loading('Compressing image...', { id: 'compress' })
    const compressed = await compressImage(file)
    toast.dismiss('compress')
    return compressed
  }
  return file
}

const TOOLS = [
  { id: 'generate',           label: 'Text to Image',      icon: Sparkles,      desc: 'Generate images from a text prompt',         color: 'from-violet-500 to-purple-600', accent: 'violet', needsImage: false, needsMask: false, needsPrompt: true,  needsObject: false },
  { id: 'remove-background',  label: 'Remove Background',  icon: ImageIcon,     desc: 'Remove the background from any photo',       color: 'from-blue-500 to-cyan-500',     accent: 'blue',   needsImage: true,  needsMask: false, needsPrompt: false, needsObject: false },
  { id: 'remove-object',      label: 'Remove Object',      icon: Scissors,      desc: 'Remove any object from an image by name',    color: 'from-pink-500 to-rose-500',     accent: 'pink',   needsImage: true,  needsMask: false, needsPrompt: false, needsObject: true  },
  { id: 'remove-text',        label: 'Remove Text',        icon: Type,          desc: 'Erase text overlays and watermarks',         color: 'from-rose-500 to-pink-500',     accent: 'rose',   needsImage: true,  needsMask: false, needsPrompt: false, needsObject: false },
  { id: 'replace-background', label: 'Replace Background', icon: RefreshCw,     desc: 'Swap the background using a text prompt',    color: 'from-amber-500 to-orange-500',  accent: 'amber',  needsImage: true,  needsMask: false, needsPrompt: true,  needsObject: false },
  { id: 'cleanup',            label: 'Cleanup',            icon: Eraser,        desc: 'Remove unwanted areas using a mask',         color: 'from-teal-500 to-emerald-500',  accent: 'teal',   needsImage: true,  needsMask: true,  needsPrompt: false, needsObject: false },
  { id: 'uncrop',             label: 'Uncrop',             icon: Crop,          desc: 'Extend your image canvas in any direction',  color: 'from-indigo-500 to-blue-500',   accent: 'indigo', needsImage: true,  needsMask: false, needsPrompt: false, needsObject: false },
  { id: 'upscale',            label: 'Image Upscaling',    icon: ArrowUpCircle, desc: 'Increase image resolution up to 4x',        color: 'from-green-500 to-emerald-400', accent: 'green',  needsImage: true,  needsMask: false, needsPrompt: false, needsObject: false },
]

const ACCENT = {
  violet: { border: 'border-violet-500/40', text: 'text-violet-400', bg: 'bg-violet-500/10', active: 'bg-violet-500/15 text-violet-300' },
  blue:   { border: 'border-blue-500/40',   text: 'text-blue-400',   bg: 'bg-blue-500/10',   active: 'bg-blue-500/15 text-blue-300' },
  pink:   { border: 'border-pink-500/40',   text: 'text-pink-400',   bg: 'bg-pink-500/10',   active: 'bg-pink-500/15 text-pink-300' },
  rose:   { border: 'border-rose-500/40',   text: 'text-rose-400',   bg: 'bg-rose-500/10',   active: 'bg-rose-500/15 text-rose-300' },
  amber:  { border: 'border-amber-500/40',  text: 'text-amber-400',  bg: 'bg-amber-500/10',  active: 'bg-amber-500/15 text-amber-300' },
  teal:   { border: 'border-teal-500/40',   text: 'text-teal-400',   bg: 'bg-teal-500/10',   active: 'bg-teal-500/15 text-teal-300' },
  indigo: { border: 'border-indigo-500/40', text: 'text-indigo-400', bg: 'bg-indigo-500/10', active: 'bg-indigo-500/15 text-indigo-300' },
  green:  { border: 'border-green-500/40',  text: 'text-green-400',  bg: 'bg-green-500/10',  active: 'bg-green-500/15 text-green-300' },
}

const FileUploadZone = ({ label, sublabel, file, onFile, onClear, inputRef, accent }) => {
  const ac = ACCENT[accent]
  return (
    <div>
      {label && (
        <p className='text-xs text-gray-400 mb-2 font-medium'>
          {label} {sublabel && <span className='text-gray-600 font-normal'>{sublabel}</span>}
        </p>
      )}
      <input ref={inputRef} type='file' accept='image/*' className='hidden'
        onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]) }} />
      {file ? (
        <div className='relative w-fit group'>
          <img src={URL.createObjectURL(file)} alt='preview'
            className={`max-h-48 max-w-full rounded-xl border ${ac.border} object-contain`} />
          <button onClick={onClear}
            className='absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80'>
            <X className='w-3.5 h-3.5 text-white' />
          </button>
          <p className='text-[11px] text-gray-500 mt-1 truncate max-w-[240px]'>{file.name}</p>
        </div>
      ) : (
        <button onClick={() => inputRef.current.click()}
          className='flex items-center justify-center gap-2 px-4 py-5 rounded-xl border border-dashed border-white/15 text-gray-500 text-sm transition-all w-full hover:border-white/30 hover:text-gray-300 active:scale-95'>
          <Upload className='w-4 h-4' />
          Tap to upload image
        </button>
      )}
    </div>
  )
}

const MageTools = () => {
  const [activeTool, setActiveTool] = useState('generate')
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState(null)
  const [imageFile, setImageFile]   = useState(null)
  const [maskFile, setMaskFile]     = useState(null)
  const [prompt, setPrompt]         = useState('')
  const [object, setObject]         = useState('')
  const [uncrop, setUncrop]         = useState({ extend_left: 256, extend_right: 256, extend_up: 256, extend_down: 256 })
  const [upscale, setUpscale]       = useState({ target_width: 2048, target_height: 2048 })
  const [menuOpen, setMenuOpen]     = useState(false)

  const imageRef = useRef()
  const maskRef  = useRef()

  const tool = TOOLS.find(t => t.id === activeTool)
  const ac   = ACCENT[tool.accent]

  const reset = () => {
    setResult(null); setImageFile(null)
    setMaskFile(null); setPrompt(''); setObject('')
  }

  const handleToolChange = (id) => {
    setActiveTool(id); reset(); setMenuOpen(false)
  }

  // Handle image file selection — auto-compress if > 4MB
  const handleImageFile = async (file) => {
    const ready = await processFile(file)
    setImageFile(ready)
  }

  // Mask doesn't need compression (it's a black/white image, usually small)
  const handleMaskFile = (file) => setMaskFile(file)

  const download = () => {
    const a = document.createElement('a')
    a.href = result
    a.download = `${activeTool}-result.png`
    a.target = '_blank'
    a.click()
  }

  const handleSubmit = async () => {
    try {
      setLoading(true); setResult(null)
      let response

      if (activeTool === 'generate') {
        if (!prompt.trim()) { toast.error('Enter a prompt'); return }
        response = await axios.post('/api/ai/generate-image', { prompt, publish: false })

      } else if (activeTool === 'remove-background') {
        if (!imageFile) { toast.error('Upload an image'); return }
        const fd = new FormData(); fd.append('image', imageFile)
        response = await axios.post('/api/ai/remove-image-background', fd)

      } else if (activeTool === 'remove-object') {
        if (!imageFile) { toast.error('Upload an image'); return }
        if (!object.trim()) { toast.error('Enter the object to remove'); return }
        const fd = new FormData(); fd.append('image', imageFile); fd.append('object', object)
        response = await axios.post('/api/ai/remove-image-object', fd)

      } else if (activeTool === 'remove-text') {
        if (!imageFile) { toast.error('Upload an image'); return }
        const fd = new FormData(); fd.append('image_file', imageFile)
        response = await axios.post('/api/ai/clipdrop-remove-text', fd)

      } else if (activeTool === 'replace-background') {
        if (!imageFile) { toast.error('Upload an image'); return }
        if (!prompt.trim()) { toast.error('Enter a background prompt'); return }
        const fd = new FormData(); fd.append('image_file', imageFile); fd.append('prompt', prompt)
        response = await axios.post('/api/ai/clipdrop-replace-background', fd)

      } else if (activeTool === 'cleanup') {
        if (!imageFile) { toast.error('Upload an image'); return }
        if (!maskFile)  { toast.error('Upload a mask image'); return }
        const fd = new FormData(); fd.append('image_file', imageFile); fd.append('mask_file', maskFile)
        response = await axios.post('/api/ai/clipdrop-cleanup', fd)

      } else if (activeTool === 'uncrop') {
        if (!imageFile) { toast.error('Upload an image'); return }
        const fd = new FormData(); fd.append('image_file', imageFile)
        Object.entries(uncrop).forEach(([k, v]) => fd.append(k, String(v)))
        response = await axios.post('/api/ai/clipdrop-uncrop', fd)

      } else if (activeTool === 'upscale') {
        if (!imageFile) { toast.error('Upload an image'); return }
        const fd = new FormData(); fd.append('image_file', imageFile)
        fd.append('target_width', String(upscale.target_width))
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
    <div className='h-full flex flex-col bg-[#0A0A0D] text-white overflow-hidden'>

      {/* ─── Mobile: dropdown tool picker ─── */}
      <div className='md:hidden flex-shrink-0 border-b border-white/10 bg-[#0F0F12] px-4 py-3'>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl ${ac.bg} border ${ac.border}`}>
          <div className='flex items-center gap-2.5'>
            <tool.icon className={`w-4 h-4 ${ac.text}`} />
            <span className='text-sm font-semibold'>{tool.label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <div className='mt-2 grid grid-cols-2 gap-2'>
            {TOOLS.map(t => {
              const isActive = activeTool === t.id
              const tac = ACCENT[t.accent]
              return (
                <button key={t.id} onClick={() => handleToolChange(t.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all active:scale-95
                    ${isActive ? `${tac.active} ${tac.border}` : 'text-gray-500 border-white/8 hover:bg-white/5 hover:text-gray-300'}`}>
                  <t.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? tac.text : 'text-gray-600'}`} />
                  <span className='truncate text-xs'>{t.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── Main area ─── */}
      <div className='flex-1 flex overflow-hidden'>

        {/* Desktop sidebar */}
        <div className='hidden md:flex w-56 flex-shrink-0 border-r border-white/8 bg-[#0D0D10] flex-col'>
          <div className='px-4 pt-5 pb-3'>
            <p className='text-[10px] font-bold text-gray-600 uppercase tracking-widest'>Image Tools</p>
          </div>
          <div className='flex-1 overflow-y-auto pb-4'>
            {TOOLS.map(t => {
              const isActive = activeTool === t.id
              const tac = ACCENT[t.accent]
              return (
                <button key={t.id} onClick={() => handleToolChange(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left
                    ${isActive ? `${tac.active} border-r-2 ${tac.border}` : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}>
                  <t.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? tac.text : ''}`} />
                  <span className='flex-1 truncate'>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content panel */}
        <div className='flex-1 flex flex-col overflow-hidden'>

          {/* Desktop header */}
          <div className='hidden md:flex border-b border-white/8 bg-[#0F0F12] px-6 py-4 flex-shrink-0 items-center gap-3'>
            <div className={`w-9 h-9 rounded-xl ${ac.bg} border ${ac.border} flex items-center justify-center flex-shrink-0`}>
              <tool.icon className={`w-4 h-4 ${ac.text}`} />
            </div>
            <div>
              <h1 className='text-sm font-semibold text-white'>{tool.label}</h1>
              <p className='text-xs text-gray-500 mt-0.5'>{tool.desc}</p>
            </div>
          </div>

          {/* Form */}
          <div className='flex-1 overflow-y-auto'>
            <div className='max-w-2xl mx-auto px-4 md:px-6 py-5 flex flex-col gap-5'>

              {/* Prompt */}
              {tool.needsPrompt && (
                <div>
                  <label className='text-xs text-gray-400 mb-2 block font-medium'>
                    {activeTool === 'generate' ? 'Image Prompt' : 'Background Prompt'}
                  </label>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3}
                    placeholder={activeTool === 'generate' ? 'A futuristic city at sunset, ultra realistic...' : 'A sunny beach with palm trees and blue ocean...'}
                    className='w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-700 transition-all resize-none' />
                </div>
              )}

              {/* Object name */}
              {tool.needsObject && (
                <div>
                  <label className='text-xs text-gray-400 mb-2 block font-medium'>Object to Remove</label>
                  <input type='text' value={object} onChange={e => setObject(e.target.value)}
                    placeholder='e.g. person, car, logo, background...'
                    className='w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-700 transition-all' />
                </div>
              )}

              {/* Image upload — uses handleImageFile for auto-compression */}
              {tool.needsImage && (
                <FileUploadZone
                  label='Source Image'
                  sublabel='— images over 4MB are auto-compressed'
                  file={imageFile}
                  onFile={handleImageFile}
                  onClear={() => setImageFile(null)}
                  inputRef={imageRef}
                  accent={tool.accent}
                />
              )}

              {/* Mask upload — no compression needed */}
              {tool.needsMask && (
                <FileUploadZone
                  label='Mask Image'
                  sublabel='— white areas will be removed'
                  file={maskFile}
                  onFile={handleMaskFile}
                  onClear={() => setMaskFile(null)}
                  inputRef={maskRef}
                  accent={tool.accent}
                />
              )}

              {/* Uncrop controls */}
              {activeTool === 'uncrop' && (
                <div>
                  <label className='text-xs text-gray-400 mb-3 block font-medium'>Extend canvas by (pixels)</label>
                  <div className='grid grid-cols-2 gap-3'>
                    {Object.entries(uncrop).map(([key, val]) => (
                      <div key={key}>
                        <label className='text-[11px] text-gray-600 capitalize mb-1 block'>{key.replace('extend_', '').replace('_', ' ')}</label>
                        <input type='number' min={0} max={2048} value={val}
                          onChange={e => setUncrop(p => ({ ...p, [key]: Number(e.target.value) }))}
                          className='w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white' />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upscale controls */}
              {activeTool === 'upscale' && (
                <div>
                  <label className='text-xs text-gray-400 mb-3 block font-medium'>Target dimensions (px)</label>
                  <div className='grid grid-cols-2 gap-3'>
                    {Object.entries(upscale).map(([key, val]) => (
                      <div key={key}>
                        <label className='text-[11px] text-gray-600 capitalize mb-1 block'>{key.replace('target_', '').replace('_', ' ')}</label>
                        <input type='number' min={512} max={4096} step={128} value={val}
                          onChange={e => setUpscale(p => ({ ...p, [key]: Number(e.target.value) }))}
                          className='w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white' />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cleanup hint */}
              {activeTool === 'cleanup' && (
                <div className={`flex gap-2.5 items-start p-3.5 rounded-xl ${ac.bg} border ${ac.border}`}>
                  <Eraser className={`w-4 h-4 ${ac.text} mt-0.5 flex-shrink-0`} />
                  <p className='text-xs text-gray-400 leading-relaxed'>
                    Paint <span className='text-white font-medium'>white</span> over the area to remove, keep everything else <span className='text-white font-medium'>black</span>. Both images must be the same size.
                  </p>
                </div>
              )}

              {/* Submit */}
              <button onClick={handleSubmit} disabled={loading}
                className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r ${tool.color}
                  text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed
                  hover:opacity-90 active:scale-95 transition-all shadow-lg w-full`}>
                {loading ? (
                  <><span className='w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin' /> Processing...</>
                ) : (
                  <><tool.icon className='w-4 h-4' /> Run {tool.label}</>
                )}
              </button>

              {/* Result */}
              {result && (
                <div className='pb-6'>
                  <div className='flex items-center justify-between mb-3'>
                    <p className='text-xs text-gray-500 uppercase tracking-widest font-semibold'>Result</p>
                    <button onClick={download}
                      className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors'>
                      <Download className='w-3.5 h-3.5' /> Download
                    </button>
                  </div>
                  <img src={result} alt='Result' className={`w-full rounded-2xl border ${ac.border} shadow-2xl`} />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MageTools