import React, { useEffect, useState } from 'react'
import { Gem, Sparkles, Clock, Search, X, ArrowRight } from 'lucide-react'
import { useAuth, useUser } from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ONBOARDING_KEY = 'quickai_onboarded';

const FILTER_TYPES = ['All', 'ai-chat', 'article', 'blog-title', 'image', 'code-generation', 'resume-review', 'ats-check', 'resume-match', 'bug-report'];

const OnboardingModal = ({ onClose }) => {
  const navigate = useNavigate();
  const tools = [
    { emoji: '✍️', title: 'Write Articles', desc: 'Generate full articles in seconds', path: '/ai/write-article' },
    { emoji: '🖼️', title: 'Generate Images', desc: 'Turn your ideas into stunning visuals', path: '/ai/generate-images' },
    { emoji: '💬', title: 'AI Chat', desc: 'Ask anything, get instant answers', path: '/ai/ai-chat' },
    { emoji: '📄', title: 'Resume Tools', desc: 'Review, match and improve your resume', path: '/ai/review-resume' },
  ];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4'>
      <div className='bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-lg p-6 text-white relative'>
        <button onClick={onClose} className='absolute top-4 right-4 text-gray-500 hover:text-white transition-colors'>
          <X className='w-5 h-5' />
        </button>

        <div className='text-center mb-6'>
          <div className='w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3'>
            <Sparkles className='w-6 h-6 text-purple-400' />
          </div>
          <h2 className='text-xl font-bold'>Welcome to Quick.ai! 🎉</h2>
          <p className='text-gray-400 text-sm mt-1'>Here's what you can do — pick something to start</p>
        </div>

        <div className='grid grid-cols-2 gap-3 mb-6'>
          {tools.map((tool) => (
            <button key={tool.title} onClick={() => { navigate(tool.path); onClose(); }}
              className='flex flex-col items-start gap-1.5 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-left'>
              <span className='text-2xl'>{tool.emoji}</span>
              <p className='text-sm font-semibold text-white'>{tool.title}</p>
              <p className='text-xs text-gray-500'>{tool.desc}</p>
            </button>
          ))}
        </div>

        <button onClick={onClose}
          className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:opacity-90 transition-opacity'>
          Explore all tools <ArrowRight className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('Free');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { getToken, has } = useAuth();
  const { user } = useUser();

  const getDashboardData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setCreations(data.creations);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const checkPlan = async () => {
    try {
      const isPremium = await has({ plan: 'premium' });
      setPlan(isPremium ? 'Premium' : 'Free');
    } catch (error) {
      setPlan('Free');
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`/api/ai/delete-creation/${id}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      if (data.success) {
        setCreations(prev => prev.filter(c => c.id !== id));
        toast.success('Deleted!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      const seen = localStorage.getItem(`${ONBOARDING_KEY}_${user.id}`);
      if (!seen) setShowOnboarding(true);
    }
  }, [user]);

  const handleCloseOnboarding = () => {
    if (user) localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
    setShowOnboarding(false);
  };

  useEffect(() => { getDashboardData(); checkPlan(); }, []);
  useEffect(() => { AOS.init({ duration: 600, easing: 'ease-out', once: true }); }, []);

  const filtered = creations.filter(c => {
    const matchesType = activeFilter === 'All' || c.type === activeFilter;
    const matchesSearch = c.prompt?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 bg-[#0A0A0D] text-white">

      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="flex justify-between items-center p-5 bg-[#0F0F12] rounded-xl border border-white/10 hover:border-white/20 transition-colors">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Creations</p>
            <h2 className="text-3xl font-bold mt-1">{creations.length}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div className="flex justify-between items-center p-5 bg-[#0F0F12] rounded-xl border border-white/10 hover:border-white/20 transition-colors">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Plan</p>
            <h2 className="text-3xl font-bold mt-1">{plan}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Gem className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className='flex flex-col gap-3 mb-4'>
        <div className='flex items-center gap-2'>
          <Clock className='w-4 h-4 text-gray-500' />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Creations</p>
        </div>

        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
          <input
            type='text'
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search by prompt...'
            className='w-full pl-9 pr-9 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 outline-none focus:border-white/20 transition-colors'
          />
          {search && (
            <button onClick={() => setSearch('')} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white'>
              <X className='w-3.5 h-3.5' />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className='flex gap-2 flex-wrap'>
          {FILTER_TYPES.map(type => (
            <button key={type} onClick={() => setActiveFilter(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeFilter === type
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                : 'text-gray-500 border-white/10 hover:border-white/20 hover:text-gray-300'}`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-40 text-gray-600'>
          <Sparkles className='w-10 h-10 mb-3 opacity-20' />
          <p className='text-sm'>{creations.length === 0 ? 'No creations yet. Start creating!' : 'No results found.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <CreationItem key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;