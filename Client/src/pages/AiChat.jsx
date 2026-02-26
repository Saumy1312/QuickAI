import { MessageCircle, Sparkles, Send, Plus, Pencil, Trash2, Check, X, Menu, Copy, Paperclip, FileText, Image, ScanText } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

const extractPdfText = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    fullText += `\n--- Page ${i} ---\n${content.items.map(item => item.str).join(' ')}`
  }
  if (fullText.length > 12000) fullText = fullText.slice(0, 12000) + '\n\n[Document truncated...]'
  return fullText.trim()
}

const AiChat = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)
  const [loadingSession, setLoadingSession] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [attachment, setAttachment] = useState(null) // current pending attachment
  const [sessionContext, setSessionContext] = useState(null) // { type, fileName, fileText, imageUrl } — persists for whole session
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const messagesEndRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const imageInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const dragCounter = useRef(0)
  const { getToken } = useAuth()

  useEffect(() => { fetchSessions() }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150
    if (isNearBottom) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleDragEnter = (e) => {
    e.preventDefault(); dragCounter.current++
    if (e.dataTransfer.items?.length > 0) setIsDragging(true)
  }
  const handleDragLeave = (e) => {
    e.preventDefault(); dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }
  const handleDragOver = (e) => e.preventDefault()
  const handleDrop = async (e) => {
    e.preventDefault(); setIsDragging(false); dragCounter.current = 0
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (file.type.startsWith('image/')) await processImage(file)
    else if (ALLOWED_FILE_TYPES.includes(file.type)) await processFile(file)
    else toast.error('Unsupported file type.')
  }

  const processImage = async (file) => {
    const preview = URL.createObjectURL(file)
    setAttachment({ type: 'image', preview, url: null, name: file.name })
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await axios.post('/api/ai/upload-chat-image', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) setAttachment({ type: 'image', preview, url: data.url, name: file.name })
      else { toast.error('Image upload failed'); setAttachment(null) }
    } catch { toast.error('Upload failed'); setAttachment(null) }
    setUploading(false)
  }

  const processFile = async (file) => {
    setAttachment({ type: 'file', name: file.name, extractedText: null })
    setUploading(true)
    try {
      let text = ''
      if (file.type === 'application/pdf') {
        toast.loading('Reading PDF...', { id: 'pdf-extract' })
        text = await extractPdfText(file)
        toast.dismiss('pdf-extract')
        if (!text) { toast.error('Could not extract text — PDF may be image-based'); setAttachment(null); setUploading(false); return }
      } else if (file.type === 'text/plain' || file.type === 'text/csv') {
        text = await file.text()
        if (text.length > 12000) text = text.slice(0, 12000) + '\n\n[Truncated...]'
      } else {
        if (file.size > 4 * 1024 * 1024) { toast.error('Word/Excel files must be under 4MB'); setAttachment(null); setUploading(false); return }
        const formData = new FormData()
        formData.append('file', file)
        const { data } = await axios.post('/api/ai/upload-chat-file', formData, {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })
        if (data.success) text = data.text
        else { toast.error(data.message); setAttachment(null); setUploading(false); return }
      }
      setAttachment({ type: 'file', name: file.name, extractedText: text })
      toast.success('File ready! Ask anything about it.')
    } catch (e) {
      toast.dismiss('pdf-extract')
      toast.error('Failed to read file')
      setAttachment(null)
    }
    setUploading(false)
  }

  const handleImageSelect = async (e) => { const f = e.target.files[0]; if (f) await processImage(f) }
  const handleFileSelect = async (e) => { const f = e.target.files[0]; if (f) await processFile(f) }

  const removeAttachment = () => {
    setAttachment(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const clearSessionContext = () => {
    setSessionContext(null)
    toast.success('File context cleared')
  }

  const copyMessage = (content, index) => {
    navigator.clipboard.writeText(content); setCopiedIndex(index)
    toast.success('Copied!'); setTimeout(() => setCopiedIndex(null), 2000)
  }
  const copyFullConversation = () => {
    navigator.clipboard.writeText(messages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n\n'))
    toast.success('Conversation copied!')
  }

  const fetchSessions = async () => {
    try {
      const { data } = await axios.get('/api/ai/chat-sessions', { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) setSessions(data.sessions)
    } catch (e) { console.log(e.message) }
  }

  const loadSession = async (id) => {
    if (loadingSession) return
    try {
      setLoadingSession(true)
      const { data } = await axios.get(`/api/ai/chat-messages/${id}`, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) {
        setMessages(data.messages); setCurrentSessionId(id)
        setSessionContext(null) // clear context when switching sessions
        setShowSidebar(false)
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch (e) { toast.error(e.message) }
    setLoadingSession(false)
  }

  const startNewChat = () => {
    setMessages([]); setCurrentSessionId(null); setInput('')
    setAttachment(null); setSessionContext(null); setShowSidebar(false)
  }

  const deleteSession = async (e, id) => {
    e.stopPropagation()
    try {
      await axios.delete(`/api/ai/chat-sessions/${id}`, { headers: { Authorization: `Bearer ${await getToken()}` } })
      setSessions(prev => prev.filter(s => s.id !== id))
      if (currentSessionId === id) startNewChat()
      toast.success('Deleted!')
    } catch (e) { toast.error(e.message) }
  }

  const startRename = (e, s) => { e.stopPropagation(); setEditingId(s.id); setEditingTitle(s.title) }
  const saveRename = async (e, id) => {
    e.stopPropagation()
    try {
      await axios.patch(`/api/ai/chat-sessions/${id}`, { title: editingTitle }, { headers: { Authorization: `Bearer ${await getToken()}` } })
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editingTitle } : s))
      setEditingId(null); toast.success('Renamed!')
    } catch (e) { toast.error(e.message) }
  }

  const sendMessage = async () => {
    if (!input.trim() && !attachment) return
    if (attachment && !attachment.url && !attachment.extractedText) return toast.error('Still processing, please wait')

    // If there's a new attachment, set it as the session context (persists for whole conversation)
    let activeContext = sessionContext
    if (attachment) {
      const newContext = attachment.type === 'image'
        ? { type: 'image', imageUrl: attachment.url, fileName: attachment.name }
        : { type: 'file', fileText: attachment.extractedText, fileName: attachment.name }
      setSessionContext(newContext)
      activeContext = newContext
    }

    const userMessage = {
      role: 'user',
      content: input,
      imageUrl: attachment?.type === 'image' ? attachment.url : null,
      fileName: attachment?.type === 'file' ? attachment.name : null,
    }
    setMessages(prev => [...prev, userMessage])
    setInput(''); setAttachment(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (fileInputRef.current) fileInputRef.current.value = ''
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    try {
      setLoading(true)
      const { data } = await axios.post('/api/ai/ai-chat', {
        prompt: input,
        sessionId: currentSessionId,
        messages: [...messages, userMessage],
        // Always send the active context so AI remembers the file/image throughout conversation
        imageUrl: activeContext?.type === 'image' ? activeContext.imageUrl : null,
        fileText: activeContext?.type === 'file' ? activeContext.fileText : null,
        fileName: activeContext?.fileName || null,
      }, { headers: { Authorization: `Bearer ${await getToken()}` } })

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
        if (!currentSessionId) { setCurrentSessionId(data.sessionId); fetchSessions() }
      } else { toast.error(data.message); setMessages(prev => prev.slice(0, -1)) }
    } catch (e) { toast.error(e.message); setMessages(prev => prev.slice(0, -1)) }
    setLoading(false)
  }

  const onSubmitHandler = (e) => { e.preventDefault(); sendMessage() }

  const getFileIcon = (name) => {
    if (!name) return '📄'
    const ext = name?.split('.').pop().toLowerCase()
    if (ext === 'pdf') return '📕'
    if (['doc', 'docx'].includes(ext)) return '📘'
    if (['xls', 'xlsx'].includes(ext)) return '📗'
    if (ext === 'csv') return '📊'
    return '📝'
  }

  const SessionList = () => (
    <>
      <button onClick={startNewChat}
        className='flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 transition-colors'>
        <Plus className='w-4 h-4' /> New Chat
      </button>
      <p className='text-xs text-gray-600 font-medium mt-3 px-1 uppercase tracking-wider'>History</p>
      <div className='flex flex-col gap-1 overflow-y-auto flex-1 mt-1'>
        {sessions.length === 0 && <p className='text-xs text-gray-600 px-1 mt-2'>No chats yet</p>}
        {sessions.map(s => (
          <div key={s.id} onClick={() => loadSession(s.id)}
            className={`group flex items-center gap-1 px-2 py-2 rounded-lg text-xs cursor-pointer transition-colors ${currentSessionId === s.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
            {editingId === s.id ? (
              <div className='flex items-center gap-1 flex-1' onClick={e => e.stopPropagation()}>
                <input value={editingTitle} onChange={e => setEditingTitle(e.target.value)} autoFocus
                  className='flex-1 bg-white/10 border border-white/20 rounded px-1 py-0.5 text-xs text-white outline-none min-w-0'
                  onKeyDown={e => { if (e.key === 'Enter') saveRename(e, s.id); if (e.key === 'Escape') setEditingId(null) }} />
                <button onClick={e => saveRename(e, s.id)} className='text-green-400'><Check className='w-3 h-3' /></button>
                <button onClick={e => { e.stopPropagation(); setEditingId(null) }} className='text-red-400'><X className='w-3 h-3' /></button>
              </div>
            ) : (
              <>
                <span className='flex-1 truncate'>{s.title}</span>
                <div className='hidden group-hover:flex items-center gap-1'>
                  <button onClick={e => startRename(e, s)} className='text-gray-500 hover:text-gray-200 p-0.5'><Pencil className='w-3 h-3' /></button>
                  <button onClick={e => deleteSession(e, s.id)} className='text-gray-500 hover:text-red-400 p-0.5'><Trash2 className='w-3 h-3' /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div className='h-full flex text-white bg-[#0A0A0D] overflow-hidden'>
      <div className='hidden sm:flex w-56 bg-[#0F0F12] border-r border-white/10 flex-col flex-shrink-0 p-3 gap-2'>
        <SessionList />
      </div>

      {showSidebar && (
        <div className='sm:hidden fixed inset-0 z-50 flex'>
          <div className='w-72 bg-[#0F0F12] border-r border-white/10 flex flex-col p-3 gap-2'>
            <div className='flex justify-end mb-1'>
              <button onClick={() => setShowSidebar(false)} className='text-gray-400 hover:text-white'><X className='w-5 h-5' /></button>
            </div>
            <SessionList />
          </div>
          <div className='flex-1 bg-black/50' onClick={() => setShowSidebar(false)} />
        </div>
      )}

      <div className='flex-1 flex flex-col overflow-hidden min-w-0 relative'
        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
        onDragOver={handleDragOver} onDrop={handleDrop}>

        {isDragging && (
          <div className='absolute inset-0 z-50 flex flex-col items-center justify-center bg-purple-900/30 backdrop-blur-sm border-2 border-dashed border-purple-400/60 pointer-events-none'>
            <div className='flex flex-col items-center gap-3'>
              <div className='w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center'>
                <Paperclip className='w-8 h-8 text-purple-300' />
              </div>
              <p className='text-purple-200 font-semibold text-lg'>Drop to attach</p>
              <p className='text-purple-400 text-sm'>Images (OCR), PDF (any size), Word, Excel, TXT</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className='flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0F0F12] flex-shrink-0'>
          <button onClick={() => setShowSidebar(true)} className='sm:hidden text-gray-400 hover:text-white'><Menu className='w-5 h-5' /></button>
          <div className='w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0'>
            <Sparkles className='w-3.5 h-3.5 text-purple-400' />
          </div>
          <h1 className='text-base font-semibold'>AI Assistant</h1>
          <div className='ml-2 hidden sm:flex items-center gap-2 text-xs text-gray-600'>
            <span className='flex items-center gap-1'><Image className='w-3 h-3' /> Images</span>
            <span className='flex items-center gap-1'><ScanText className='w-3 h-3' /> OCR</span>
            <span className='flex items-center gap-1'><FileText className='w-3 h-3' /> PDF/Docs</span>
            <span className='flex items-center gap-1 text-purple-500'>✦ Drag & drop</span>
          </div>
          {messages.length > 0 && (
            <div className='ml-auto flex items-center gap-2'>
              <button onClick={copyFullConversation}
                className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 transition-colors'>
                <Copy className='w-3.5 h-3.5' /> Copy all
              </button>
              <button onClick={startNewChat} className='text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1'>
                <Plus className='w-3.5 h-3.5' /> New
              </button>
            </div>
          )}
        </div>

        {/* Active session context banner */}
        {sessionContext && (
          <div className='px-4 py-2 bg-purple-500/5 border-b border-purple-500/20 flex items-center gap-2'>
            <span className='text-sm'>{sessionContext.type === 'image' ? '🖼️' : getFileIcon(sessionContext.fileName)}</span>
            <span className='text-xs text-purple-300 flex-1 truncate'>
              <span className='text-purple-500'>Context: </span>{sessionContext.fileName} — AI remembers this for the whole conversation
            </span>
            <button onClick={clearSessionContext} className='text-xs text-gray-600 hover:text-red-400 transition-colors flex-shrink-0'>
              <X className='w-3.5 h-3.5' />
            </button>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollContainerRef} className='flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3'>
          {messages.length === 0 && (
            <div className='flex-1 flex flex-col justify-center items-center text-gray-600 gap-4 h-full'>
              <MessageCircle className='w-10 h-10 opacity-20' />
              <p className='text-sm text-center'>Ask me anything, upload a file, or drop one anywhere!</p>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                {[
                  { icon: '🖼️', label: 'Analyze images' },
                  { icon: '📝', label: 'OCR / Extract text' },
                  { icon: '📕', label: 'Read PDFs (any size)' },
                  { icon: '💬', label: 'Full conversation on file' },
                ].map(item => (
                  <div key={item.label} className='flex items-center gap-2 border border-white/8 rounded-lg px-3 py-2 text-gray-600'>
                    <span>{item.icon}</span><span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`group relative max-w-[88%] sm:max-w-[75%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                ? 'bg-purple-600/20 border border-purple-500/30 text-purple-100 rounded-br-sm'
                : 'bg-[#0F0F12] border border-white/10 text-gray-300 rounded-bl-sm'}`}>
                {msg.imageUrl && <img src={msg.imageUrl} alt="attached" className='w-full max-w-xs rounded-lg mb-2 border border-white/10' />}
                {msg.fileName && (
                  <div className='flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 mb-2'>
                    <span className='text-lg'>{getFileIcon(msg.fileName)}</span>
                    <span className='text-xs text-gray-300 truncate'>{msg.fileName}</span>
                  </div>
                )}
                {msg.role === 'assistant'
                  ? <div className='reset-tw prose prose-invert prose-sm max-w-none'><Markdown>{msg.content}</Markdown></div>
                  : msg.content}
                <button onClick={() => copyMessage(msg.content, i)}
                  className='absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1f] border border-white/10 rounded-md p-1 text-gray-400 hover:text-white'>
                  {copiedIndex === i ? <Check className='w-3 h-3 text-green-400' /> : <Copy className='w-3 h-3' />}
                </button>
              </div>
            </div>
          ))}
          {loading && (
            <div className='flex justify-start'>
              <div className='bg-[#0F0F12] border border-white/10 px-4 py-3 rounded-xl rounded-bl-sm'>
                <div className='flex gap-1'>
                  {[0, 150, 300].map(d => <span key={d} className='w-2 h-2 bg-gray-500 rounded-full animate-bounce' style={{ animationDelay: `${d}ms` }}></span>)}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending attachment preview */}
        {attachment && (
          <div className='px-3 py-2 bg-[#0F0F12] border-t border-white/5'>
            <div className='relative inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2'>
              {attachment.type === 'image' ? (
                <>
                  <img src={attachment.preview} alt="preview" className='h-10 w-10 object-cover rounded border border-white/10' />
                  <span className='text-xs text-gray-400 max-w-[120px] truncate'>{attachment.name}</span>
                </>
              ) : (
                <>
                  <span className='text-xl'>{getFileIcon(attachment.name)}</span>
                  <div>
                    <p className='text-xs text-white truncate max-w-[150px]'>{attachment.name}</p>
                    <p className='text-[10px] text-gray-500'>
                      {uploading ? 'Reading file...' : attachment.extractedText ? '✓ Ready — type your question' : 'Processing...'}
                    </p>
                  </div>
                </>
              )}
              {uploading && <span className='w-3.5 h-3.5 border-2 border-t-transparent border-purple-400 rounded-full animate-spin'></span>}
              <button onClick={removeAttachment} className='w-4 h-4 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 ml-1'>
                <X className='w-2.5 h-2.5 text-white' />
              </button>
            </div>
          </div>
        )}

        {/* Input bar */}
        <form onSubmit={onSubmitHandler} className='p-3 border-t border-white/10 bg-[#0F0F12] flex gap-2 flex-shrink-0 items-center'>
          <button type='button' onClick={() => imageInputRef.current?.click()} title='Attach image'
            className='flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0'>
            <Image className='w-4 h-4' />
          </button>
          <input ref={imageInputRef} type='file' accept='image/*' onChange={handleImageSelect} className='hidden' />

          <button type='button' onClick={() => fileInputRef.current?.click()} title='Attach PDF, Word, Excel, TXT'
            className='flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0'>
            <Paperclip className='w-4 h-4' />
          </button>
          <input ref={fileInputRef} type='file' accept='.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx' onChange={handleFileSelect} className='hidden' />

          <input type='text' value={input} onChange={e => setInput(e.target.value)}
            placeholder={
              attachment?.type === 'image' ? 'Ask about this image...' :
              attachment?.type === 'file' ? 'Ask anything about this file...' :
              sessionContext ? `Chatting about ${sessionContext.fileName} — ask anything...` :
              'Ask anything or drop a file...'
            }
            className='flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-500 focus:border-purple-500/50 transition-colors min-w-0' />

          <button disabled={loading || uploading}
            className='flex items-center justify-center w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors flex-shrink-0'>
            {loading ? <span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'></span> : <Send className='w-4 h-4' />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AiChat