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

// ── SEO helpers ───────────────────────────────────────────────
const extractSection = (content, header) => {
  if (!content) return ''
  const regex = new RegExp(`##\\s*${header}([\\s\\S]*?)(?=##|$)`, 'i')
  const match = content.match(regex)
  return match ? match[1].trim() : ''
}

const parseScore = (content) => {
  if (!content) return null
  // match any standalone 1-3 digit number in the SEO Score section
  const section = extractSection(content, 'SEO Score')
  const m = section.match(/\b(\d{1,3})\b/)
  return m ? Math.min(100, parseInt(m[1])) : null
}

const SeoCard = ({ icon, title, children, accent = 'white' }) => {
  const colors = {
    green:  'border-green-500/20 bg-green-500/5',
    amber:  'border-amber-500/20 bg-amber-500/5',
    red:    'border-red-500/20 bg-red-500/5',
    blue:   'border-blue-500/20 bg-blue-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
    white:  'border-white/10 bg-white/3',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[accent]}`}>
      <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
        <span>{icon}</span>{title}
      </p>
      {children}
    </div>
  )
}

const TagChip = ({ tag }) => (
  <span className='px-2 py-1 rounded-lg bg-white/8 border border-white/10 text-xs text-gray-300'>{tag.trim()}</span>
)

// ── SEO Analysis Tab ──────────────────────────────────────────
const SEOTab = ({ prefillArticle, prefillTopic }) => {
  const [article, setArticle]          = useState(prefillArticle || '')
  const [topic, setTopic]              = useState(prefillTopic || '')
  const [collapsed, setCollapsed]      = useState(false)
  const { loading, content, generate } = useGenerateText('/api/ai/generate-article', 'seo-analysis-content')
  const { copied, copy }               = useCopyToClipboard()

  const onSubmit = async (e) => {
    e.preventDefault()
    setCollapsed(true)
    await generate({
      prompt: `You are an SEO expert. Analyse this article and return a structured SEO report.

Target Keyword: "${topic}"

Article:
${article}

Return EXACTLY this structure, with EXACTLY these ## headers. Under SEO Score, write the number as just digits like "Score: 74":

## SEO Score
Score: [number 0-100]. [One sentence verdict].

## Meta Description
[150-160 character meta description]

## Focus Keywords
- keyword 1
- keyword 2
- keyword 3
- keyword 4
- keyword 5

## Strengths
- strength 1
- strength 2
- strength 3

## Issues Found
- issue 1
- issue 2
- issue 3

## Quick Wins
- quick win 1
- quick win 2
- quick win 3

## Suggested Tags
tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8`,
      length: 1000
    })
  }

  const score       = parseScore(content)
  const metaDesc    = extractSection(content, 'Meta Description')
  const keywords    = extractSection(content, 'Focus Keywords')
  const strengths   = extractSection(content, 'Strengths')
  const issues      = extractSection(content, 'Issues Found')
  const quickWins   = extractSection(content, 'Quick Wins')
  const tagsRaw     = extractSection(content, 'Suggested Tags')
  const tags        = tagsRaw ? tagsRaw.split(',').filter(Boolean) : []

  const scoreColor  = !score ? '' : score >= 75 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
  const scoreBorder = !score ? 'border-white/10' : score >= 75 ? 'border-green-500/40' : score >= 50 ? 'border-amber-500/40' : 'border-red-500/40'
  const scoreBg     = !score ? '' : score >= 75 ? 'bg-green-500/10' : score >= 50 ? 'bg-amber-500/10' : 'bg-red-500/10'
  const scoreLabel  = !score ? '' : score >= 75 ? 'Well optimised 🎉' : score >= 50 ? 'Good — room to improve' : 'Needs work — check quick wins'

  const BulletList = ({ text }) => {
    if (!text) return null
    const items = text.split('\n').filter(l => l.trim().match(/^[-•*]|\d+\./))
    if (items.length === 0) return <p className='text-sm text-gray-300'>{text}</p>
    return (
      <ul className='flex flex-col gap-1.5'>
        {items.map((item, i) => (
          <li key={i} className='flex gap-2 text-sm text-gray-300'>
            <span className='text-gray-600 mt-0.5 flex-shrink-0'>•</span>
            <span>{item.replace(/^[-•*]\s*|\d+\.\s*/, '')}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className='flex flex-col h-full'>

      {/* Form — collapses after submit */}
      <div className='border-b border-white/10 bg-[#0F0F12] flex-shrink-0'>
        {collapsed ? (
          /* Collapsed summary bar */
          <div className='px-4 py-2 flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2 min-w-0'>
              <Search className='w-3.5 h-3.5 text-green-400 flex-shrink-0' />
              <span className='text-xs text-gray-400 truncate'>
                <span className='text-white font-medium'>{topic}</span>
                {article && <span className='text-gray-600'> · {article.slice(0, 40).trim()}…</span>}
              </span>
            </div>
            <button
              onClick={() => setCollapsed(false)}
              className='text-xs text-gray-500 hover:text-white border border-white/10 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0'>
              Edit
            </button>
          </div>
        ) : (
          /* Full form */
          <form onSubmit={onSubmit} className='px-4 py-3 flex flex-col gap-2'>
            <input value={topic} onChange={e => setTopic(e.target.value)} required
              placeholder='Target keyword / topic...'
              className='w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-600 focus:border-green-500/50 transition-colors' />
            <textarea value={article} onChange={e => setArticle(e.target.value)} required rows={8}
              placeholder='Paste your article here, or generate one and click "Analyse SEO"...'
              className='w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none text-sm text-white placeholder-gray-600 focus:border-green-500/50 transition-colors resize-y min-h-[200px] max-h-[300px]' />
            <button disabled={loading}
              className='flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-medium disabled:opacity-50'>
              {loading
                ? <><span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin' /> Analysing...</>
                : <><Search className='w-4 h-4' /> Analyse SEO</>}
            </button>
          </form>
        )}
      </div>

      {/* Results */}
      <div className='flex-1 overflow-y-auto p-4'>
        {!content ? (
          <div className='flex flex-col items-center justify-center h-full text-gray-700 gap-3'>
            <Search className='w-10 h-10 opacity-20' />
            <p className='text-sm text-center'>Paste an article and click Analyse SEO</p>
            <p className='text-xs text-gray-600 text-center'>Or generate one in Write Article and click "Analyse SEO"</p>
          </div>
        ) : (
          <div className='flex flex-col gap-3 pb-6'>

            {/* Score card */}
            {score && (
              <div className={`flex items-center gap-5 p-5 rounded-xl border ${scoreBorder} ${scoreBg}`}>
                <div className='flex-shrink-0 relative w-20 h-20'>
                  <svg className='w-20 h-20 -rotate-90' viewBox='0 0 36 36'>
                    <circle cx='18' cy='18' r='15.9' fill='none' stroke='rgba(255,255,255,0.05)' strokeWidth='3' />
                    <circle cx='18' cy='18' r='15.9' fill='none'
                      stroke={score >= 75 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171'}
                      strokeWidth='3' strokeLinecap='round'
                      strokeDasharray={`${score} 100`} />
                  </svg>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <span className={`text-xl font-bold ${scoreColor}`}>{score}</span>
                  </div>
                </div>
                <div>
                  <p className='text-white font-semibold text-base'>SEO Score</p>
                  <p className={`text-sm ${scoreColor} font-medium`}>{scoreLabel}</p>
                  <p className='text-xs text-gray-500 mt-0.5'>out of 100</p>
                </div>
              </div>
            )}

            {/* Meta description */}
            {metaDesc && (
              <SeoCard icon='📝' title='Meta Description' accent='blue'>
                <p className='text-sm text-gray-200 leading-relaxed'>{metaDesc}</p>
                <div className='flex items-center justify-between mt-2'>
                  <span className={`text-xs ${metaDesc.length > 160 ? 'text-red-400' : 'text-gray-500'}`}>
                    {metaDesc.length} chars {metaDesc.length > 160 ? '(too long)' : '(good)'}
                  </span>
                  <button onClick={() => copy(metaDesc)}
                    className='flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors'>
                    {copied ? <Check className='w-3 h-3 text-green-400' /> : <Copy className='w-3 h-3' />}
                    Copy
                  </button>
                </div>
              </SeoCard>
            )}

            {/* 2-col grid for keywords + tags */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {keywords && (
                <SeoCard icon='🔑' title='Focus Keywords' accent='purple'>
                  <BulletList text={keywords} />
                </SeoCard>
              )}
              {tags.length > 0 && (
                <SeoCard icon='🏷️' title='Suggested Tags' accent='purple'>
                  <div className='flex flex-wrap gap-1.5'>
                    {tags.map((tag, i) => <TagChip key={i} tag={tag} />)}
                  </div>
                </SeoCard>
              )}
            </div>

            {/* Strengths */}
            {strengths && (
              <SeoCard icon='✅' title='Strengths' accent='green'>
                <BulletList text={strengths} />
              </SeoCard>
            )}

            {/* Issues */}
            {issues && (
              <SeoCard icon='⚠️' title='Issues Found' accent='red'>
                <BulletList text={issues} />
              </SeoCard>
            )}

            {/* Quick wins */}
            {quickWins && (
              <SeoCard icon='⚡' title='Quick Wins' accent='amber'>
                <BulletList text={quickWins} />
              </SeoCard>
            )}

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