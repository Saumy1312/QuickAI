import { Edit, Sparkles, Copy, Check, Download, Hash, Search, FileText, ChevronRight, RefreshCw, Lightbulb } from 'lucide-react'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import useGenerateText from '../hooks/useGenerateText'
import useCopyToClipboard from '../hooks/useCopyToClipboard'

// ── Tabs ──────────────────────────────────────────────────────
const TABS = [
  { id: 'article', label: 'Write Article', icon: Edit },
  { id: 'titles',  label: 'Blog Titles',   icon: Hash },
  { id: 'seo',     label: 'SEO Analysis',  icon: Search },
]

const TONES = ['Professional', 'Casual', 'Persuasive', 'Storytelling', 'Humorous']
const LENGTHS = [
  { length: 800,  text: 'Short',  desc: '~2 min read' },
  { length: 1200, text: 'Medium', desc: '~4 min read' },
  { length: 1600, text: 'Long',   desc: '~6 min read' },
]

// ── Write Article Tab ─────────────────────────────────────────
const ArticleTab = ({ onArticleGenerated }) => {
  const [input, setInput]               = useState('')
  const [selectedLength, setSelectedLength] = useState(LENGTHS[0])
  const [selectedTone, setSelectedTone] = useState('Professional')
  const { loading, content, generate }  = useGenerateText('/api/ai/generate-article', 'write-article-content')
  const { copied, copy }                = useCopyToClipboard()

  const onSubmit = async (e) => {
    e.preventDefault()
    await generate({
      prompt: `Write a ${selectedTone.toLowerCase()} article about: ${input}`,
      length: selectedLength.length
    })
  }

  const downloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${input.slice(0, 30).replace(/\s+/g, '-')}-article.txt`
    a.click()
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Config */}
      <div className='border-b border-white/10 bg-[#0F0F12] px-4 py-3 flex-shrink-0 flex flex-col gap-3'>
        <form onSubmit={onSubmit} className='flex flex-col gap-2'>
          <div className='flex gap-2'>
            <input value={input} onChange={e => setInput(e.target.value)} required
              placeholder='What should the article be about?'
              className='flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-600 focus:border-blue-500/50 transition-colors' />
            <button disabled={loading}
              className='flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white text-sm font-medium disabled:opacity-50 whitespace-nowrap flex-shrink-0'>
              {loading
                ? <><span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin' /><span className='hidden sm:inline'>Generating...</span></>
                : <><Edit className='w-4 h-4' /><span className='hidden sm:inline'>Generate</span></>}
            </button>
          </div>

          {/* Tone */}
          <div className='flex gap-1.5 flex-wrap'>
            {TONES.map(t => (
              <button type='button' key={t} onClick={() => setSelectedTone(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${selectedTone === t ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'text-gray-500 border-white/10 hover:border-white/20 hover:text-gray-300'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Length */}
          <div className='flex gap-1.5'>
            {LENGTHS.map(l => (
              <button type='button' key={l.text} onClick={() => setSelectedLength(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex flex-col items-center ${selectedLength.text === l.text ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'text-gray-500 border-white/10 hover:border-white/20'}`}>
                <span>{l.text}</span>
                <span className='text-[10px] opacity-60'>{l.desc}</span>
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Output */}
      <div className='flex-1 overflow-y-auto p-4'>
        {!content ? (
          <div className='flex flex-col items-center justify-center h-full text-gray-700 gap-3'>
            <Edit className='w-10 h-10 opacity-20' />
            <p className='text-sm'>Enter a topic and click Generate</p>
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between mb-3 flex-wrap gap-2'>
              <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>Generated Article</p>
              <div className='flex gap-2'>
                <button onClick={() => onArticleGenerated(content, input)}
                  className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors'>
                  <Search className='w-3.5 h-3.5' /> Analyse SEO
                </button>
                <button onClick={downloadTxt}
                  className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 transition-colors'>
                  <Download className='w-3.5 h-3.5' /> .txt
                </button>
                <button onClick={() => copy(content)}
                  className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 transition-colors'>
                  {copied ? <Check className='w-3.5 h-3.5 text-green-400' /> : <Copy className='w-3.5 h-3.5' />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
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

// ── Blog Titles Tab ───────────────────────────────────────────
const TitlesTab = () => {
  const [input, setInput]              = useState('')
  const [count, setCount]              = useState(10)
  const { loading, content, generate } = useGenerateText('/api/ai/generate-blog-title', 'blog-titles-content')
  const { copied, copy }               = useCopyToClipboard()

  const onSubmit = async (e) => {
    e.preventDefault()
    await generate({
      prompt: `Generate ${count} creative, SEO-friendly blog title ideas for the topic: "${input}". 
Return ONLY a numbered list of titles, nothing else. No explanations, no intros, just the numbered list.`
    })
  }

  // Parse the numbered list from content
  const titles = content
    ? content.split('\n').filter(l => l.trim().match(/^\d+\./)).map(l => l.replace(/^\d+\.\s*/, '').trim())
    : []

  return (
    <div className='flex flex-col h-full'>
      <div className='border-b border-white/10 bg-[#0F0F12] px-4 py-3 flex-shrink-0'>
        <form onSubmit={onSubmit} className='flex flex-col gap-2'>
          <div className='flex gap-2'>
            <input value={input} onChange={e => setInput(e.target.value)} required
              placeholder='Topic for blog titles...'
              className='flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-600 focus:border-purple-500/50 transition-colors' />
            <button disabled={loading}
              className='flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium disabled:opacity-50 whitespace-nowrap flex-shrink-0'>
              {loading
                ? <><span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin' /><span className='hidden sm:inline'>Generating...</span></>
                : <><Hash className='w-4 h-4' /><span className='hidden sm:inline'>Generate</span></>}
            </button>
          </div>
          <div className='flex gap-1.5'>
            {[5, 10, 15].map(n => (
              <button type='button' key={n} onClick={() => setCount(n)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${count === n ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'text-gray-500 border-white/10 hover:border-white/20'}`}>
                {n} titles
              </button>
            ))}
          </div>
        </form>
      </div>

      <div className='flex-1 overflow-y-auto p-4'>
        {titles.length === 0 && !content ? (
          <div className='flex flex-col items-center justify-center h-full text-gray-700 gap-3'>
            <Hash className='w-10 h-10 opacity-20' />
            <p className='text-sm'>Enter a topic to generate title ideas</p>
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between mb-3'>
              <p className='text-xs text-gray-500 uppercase tracking-wider font-medium'>{titles.length} Title Ideas</p>
              <button onClick={() => copy(content)}
                className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 transition-colors'>
                {copied ? <Check className='w-3.5 h-3.5 text-green-400' /> : <Copy className='w-3.5 h-3.5' />}
                {copied ? 'Copied!' : 'Copy all'}
              </button>
            </div>
            <div className='flex flex-col gap-2'>
              {titles.map((title, i) => (
                <TitleCard key={i} title={title} index={i} />
              ))}
              {titles.length === 0 && content && (
                <div className='bg-[#0F0F12] rounded-xl border border-white/10 p-4'>
                  <div className='reset-tw prose prose-invert prose-sm max-w-none'><Markdown>{content}</Markdown></div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const TitleCard = ({ title, index }) => {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(title)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className='flex items-center gap-3 bg-[#0F0F12] border border-white/8 rounded-xl px-4 py-3 group hover:border-white/20 transition-all'>
      <span className='text-xs text-gray-600 font-mono w-5 flex-shrink-0'>{index + 1}</span>
      <p className='flex-1 text-sm text-gray-200'>{title}</p>
      <button onClick={copy}
        className='opacity-0 group-hover:opacity-100 sm:opacity-0 opacity-100 transition-opacity text-gray-500 hover:text-white p-1 rounded flex-shrink-0'>
        {copied ? <Check className='w-3.5 h-3.5 text-green-400' /> : <Copy className='w-3.5 h-3.5' />}
      </button>
    </div>
  )
}

// ── SEO Analysis Tab ──────────────────────────────────────────
const SEOTab = ({ prefillArticle, prefillTopic }) => {
  const [article, setArticle]          = useState(prefillArticle || '')
  const [topic, setTopic]              = useState(prefillTopic || '')
  const { loading, content, generate } = useGenerateText('/api/ai/generate-article', 'seo-analysis-content')

  const onSubmit = async (e) => {
    e.preventDefault()
    await generate({
      prompt: `You are an SEO expert. Analyse the following article and provide a detailed SEO report.

Topic/Keyword: "${topic}"

Article:
${article}

Return your analysis in this EXACT format with these EXACT section headers:

## SEO Score
Give a score out of 100 and a one-line verdict.

## Meta Description
Write an optimised meta description (150-160 characters).

## Focus Keywords
List 5-8 primary and secondary keywords found or that should be added.

## Strengths
List 3-5 SEO strengths of this article.

## Issues Found
List any SEO problems (missing keywords, poor structure, thin content, etc).

## Quick Wins
List 3-5 specific actionable improvements to boost SEO immediately.

## Suggested Tags
Comma-separated list of 8-10 blog tags for this article.`,
      length: 1200
    })
  }

  // Parse score from content
  const scoreMatch = content?.match(/##\s*SEO Score[\s\S]*?(\d+)\s*\/\s*100/)
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null
  const scoreColor = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
  const scoreBg    = score >= 75 ? 'bg-green-500/10 border-green-500/30' : score >= 50 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'

  return (
    <div className='flex flex-col h-full'>
      <div className='border-b border-white/10 bg-[#0F0F12] px-4 py-3 flex-shrink-0'>
        <form onSubmit={onSubmit} className='flex flex-col gap-2'>
          <input value={topic} onChange={e => setTopic(e.target.value)} required
            placeholder='Target keyword / topic...'
            className='w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-600 focus:border-green-500/50 transition-colors' />
          <textarea value={article} onChange={e => setArticle(e.target.value)} required rows={3}
            placeholder='Paste your article here (or generate one from the Write Article tab and click "Analyse SEO")...'
            className='w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-600 focus:border-green-500/50 transition-colors resize-none' />
          <button disabled={loading}
            className='flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-medium disabled:opacity-50'>
            {loading
              ? <><span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin' /> Analysing...</>
              : <><Search className='w-4 h-4' /> Analyse SEO</>}
          </button>
        </form>
      </div>

      <div className='flex-1 overflow-y-auto p-4'>
        {!content ? (
          <div className='flex flex-col items-center justify-center h-full text-gray-700 gap-3'>
            <Search className='w-10 h-10 opacity-20' />
            <p className='text-sm text-center'>Paste an article and click Analyse SEO</p>
            <p className='text-xs text-gray-600 text-center'>Or generate an article first and click the "Analyse SEO" button</p>
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {/* Score card */}
            {score && (
              <div className={`flex items-center gap-4 p-4 rounded-xl border ${scoreBg}`}>
                <div className={`text-4xl font-bold ${scoreColor}`}>{score}<span className='text-lg text-gray-500'>/100</span></div>
                <div>
                  <p className='text-sm font-medium text-white'>SEO Score</p>
                  <p className='text-xs text-gray-400'>{score >= 75 ? 'Great — well optimised' : score >= 50 ? 'Good — some improvements needed' : 'Needs work — follow the quick wins below'}</p>
                </div>
              </div>
            )}
            {/* Full report */}
            <div className='bg-[#0F0F12] rounded-xl border border-white/10 p-4'>
              <div className='reset-tw prose prose-invert prose-sm max-w-none'><Markdown>{content}</Markdown></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ContentStudio ────────────────────────────────────────
const WriteArticle = () => {
  const [activeTab, setActiveTab]           = useState('article')
  const [seoArticle, setSeoArticle]         = useState('')
  const [seoTopic, setSeoTopic]             = useState('')

  const handleAnalyseSEO = (article, topic) => {
    setSeoArticle(article)
    setSeoTopic(topic)
    setActiveTab('seo')
  }

  return (
    <div className='h-full flex flex-col bg-[#0A0A0D] text-white overflow-hidden'>

      {/* Tab bar */}
      <div className='flex-shrink-0 border-b border-white/10 bg-[#0F0F12] px-4 pt-3 flex items-center gap-1'>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium border-b-2 transition-all
              ${activeTab === tab.id
                ? 'text-white border-blue-500 bg-white/5'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'}`}>
            <tab.icon className='w-3.5 h-3.5' />
            <span className='hidden sm:inline'>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className='flex-1 overflow-hidden'>
        {activeTab === 'article' && <ArticleTab onArticleGenerated={handleAnalyseSEO} />}
        {activeTab === 'titles'  && <TitlesTab />}
        {activeTab === 'seo'     && <SEOTab key={seoArticle} prefillArticle={seoArticle} prefillTopic={seoTopic} />}
      </div>
    </div>
  )
}

export default WriteArticle