import { MessageCircle, Sparkles, Send, Plus, Pencil, Trash2, Check, X, Menu } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

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
  const messagesEndRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const { getToken } = useAuth()

  useEffect(() => { fetchSessions() }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150
    if (isNearBottom) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchSessions = async () => {
    try {
      const { data } = await axios.get('/api/ai/chat-sessions', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) setSessions(data.sessions)
    } catch (e) { console.log(e.message) }
  }

  const loadSession = async (id) => {
    if (loadingSession) return
    try {
      setLoadingSession(true)
      const { data } = await axios.get(`/api/ai/chat-messages/${id}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setMessages(data.messages)
        setCurrentSessionId(id)
        setShowSidebar(false)
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch (e) { toast.error(e.message) }
    setLoadingSession(false)
  }

  const startNewChat = () => {
    setMessages([])
    setCurrentSessionId(null)
    setInput('')
    setShowSidebar(false)
  }

  const deleteSession = async (e, id) => {
    e.stopPropagation()
    try {
      await axios.delete(`/api/ai/chat-sessions/${id}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      setSessions(prev => prev.filter(s => s.id !== id))
      if (currentSessionId === id) startNewChat()
      toast.success('Deleted!')
    } catch (e) { toast.error(e.message) }
  }

  const startRename = (e, s) => {
    e.stopPropagation()
    setEditingId(s.id)
    setEditingTitle(s.title)
  }

  const saveRename = async (e, id) => {
    e.stopPropagation()
    try {
      await axios.patch(`/api/ai/chat-sessions/${id}`, { title: editingTitle }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editingTitle } : s))
      setEditingId(null)
      toast.success('Renamed!')
    } catch (e) { toast.error(e.message) }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    try {
      setLoading(true)
      const { data } = await axios.post('/api/ai/ai-chat', {
        prompt: input,
        sessionId: currentSessionId,
        messages: [...messages, userMessage]
      }, { headers: { Authorization: `Bearer ${await getToken()}` } })

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
        // If new session was created, update session list and set current
        if (!currentSessionId) {
          setCurrentSessionId(data.sessionId)
          fetchSessions()
        }
      } else {
        toast.error(data.message)
        setMessages(prev => prev.slice(0, -1))
      }
    } catch (e) {
      toast.error(e.message)
      setMessages(prev => prev.slice(0, -1))
    }
    setLoading(false)
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
      {/* Desktop Sidebar */}
      <div className='hidden sm:flex w-56 bg-[#0F0F12] border-r border-white/10 flex-col flex-shrink-0 p-3 gap-2'>
        <SessionList />
      </div>

      {/* Mobile Sidebar Overlay */}
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

      {/* Main */}
      <div className='flex-1 flex flex-col overflow-hidden min-w-0'>
        <div className='flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0F0F12] flex-shrink-0'>
          <button onClick={() => setShowSidebar(true)} className='sm:hidden text-gray-400 hover:text-white'>
            <Menu className='w-5 h-5' />
          </button>
          <div className='w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0'>
            <Sparkles className='w-3.5 h-3.5 text-purple-400' />
          </div>
          <h1 className='text-base font-semibold'>AI Assistant</h1>
          {messages.length > 0 && (
            <button onClick={startNewChat} className='ml-auto text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors'>
              <Plus className='w-3.5 h-3.5' /> New
            </button>
          )}
        </div>

        <div ref={scrollContainerRef} className='flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3'>
          {messages.length === 0 && (
            <div className='flex-1 flex flex-col justify-center items-center text-gray-600 gap-3 h-full'>
              <MessageCircle className='w-10 h-10 opacity-20' />
              <p className='text-sm text-center px-4'>Ask me anything and I'll help you out!</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] sm:max-w-[75%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                ? 'bg-purple-600/20 border border-purple-500/30 text-purple-100 rounded-br-sm'
                : 'bg-[#0F0F12] border border-white/10 text-gray-300 rounded-bl-sm'}`}>
                {msg.role === 'assistant'
                  ? <div className='reset-tw prose prose-invert prose-sm max-w-none'><Markdown>{msg.content}</Markdown></div>
                  : msg.content}
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

        <form onSubmit={onSubmitHandler} className='p-3 border-t border-white/10 bg-[#0F0F12] flex gap-2 flex-shrink-0'>
          <input type='text' value={input} onChange={e => setInput(e.target.value)}
            placeholder='Ask me anything...'
            className='flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-500 focus:border-purple-500/50 transition-colors min-w-0' required />
          <button disabled={loading}
            className='flex items-center justify-center w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors flex-shrink-0'>
            {loading ? <span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'></span> : <Send className='w-4 h-4' />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AiChat