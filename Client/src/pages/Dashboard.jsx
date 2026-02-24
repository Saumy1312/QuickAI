import React, { useEffect, useState } from 'react'
import { Gem, Sparkles, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Protect, useAuth } from '@clerk/clerk-react'
import Markdown from 'react-markdown'
import axios from 'axios';
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const typeColors = {
  'ai-chat': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'generate-code': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'article': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'blog-title': 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  'image': 'text-green-400 bg-green-400/10 border-green-400/20',
  'remove-background': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'remove-object': 'text-red-400 bg-red-400/10 border-red-400/20',
  'resume-review': 'text-teal-400 bg-teal-400/10 border-teal-400/20',
}

const CreationItem = ({ item, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const colorClass = typeColors[item.type] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'

  return (
    <div className='bg-[#0F0F12] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors'>
      <div className='flex items-center justify-between gap-3 p-4 cursor-pointer' onClick={() => setExpanded(!expanded)}>
        <div className='min-w-0 flex-1'>
          <p className='text-sm text-white truncate'>{item.prompt}</p>
          <p className='text-xs text-gray-500 mt-0.5'>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colorClass}`}>{item.type}</span>
          <button onClick={e => { e.stopPropagation(); onDelete(item.id) }} className='text-gray-600 hover:text-red-400 transition-colors p-1'>
            <Trash2 className='w-3.5 h-3.5' />
          </button>
          {expanded ? <ChevronUp className='w-4 h-4 text-gray-500' /> : <ChevronDown className='w-4 h-4 text-gray-500' />}
        </div>
      </div>
      {expanded && (
        <div className='border-t border-white/10 p-4'>
          {item.type === 'image' ? (
            <img src={item.content} alt="creation" className='w-full max-w-sm rounded-lg' />
          ) : (
            <div className='text-sm text-gray-300 prose prose-invert prose-sm max-w-none'>
              <div className='reset-tw'><Markdown>{item.content}</Markdown></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-user-creations', { headers: { Authorization: `Bearer ${await getToken()}` } });
      if (data.success) setCreations(data.creations);
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`/api/user/delete-creation/${id}`, { headers: { Authorization: `Bearer ${await getToken()}` } });
      if (data.success) { setCreations(prev => prev.filter(c => c.id !== id)); toast.success('Deleted!'); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  useEffect(() => { getDashboardData(); }, []);

  return (
    <div className='h-full overflow-y-auto p-4 sm:p-6 bg-[#0A0A0D] text-white'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
        <div className='bg-[#0F0F12] border border-white/10 rounded-xl p-5 flex items-center justify-between hover:border-white/20 transition-colors'>
          <div>
            <p className='text-gray-400 text-xs font-medium uppercase tracking-wider'>Total Creations</p>
            <h2 className='text-3xl font-bold mt-1'>{creations.length}</h2>
          </div>
          <div className='w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center'>
            <Sparkles className='w-5 h-5 text-blue-400' />
          </div>
        </div>
        <div className='bg-[#0F0F12] border border-white/10 rounded-xl p-5 flex items-center justify-between hover:border-white/20 transition-colors'>
          <div>
            <p className='text-gray-400 text-xs font-medium uppercase tracking-wider'>Active Plan</p>
            <h2 className='text-3xl font-bold mt-1'><Protect plan="premium" fallback="Free">Premium</Protect></h2>
          </div>
          <div className='w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center'>
            <Gem className='w-5 h-5 text-purple-400' />
          </div>
        </div>
      </div>

      <div className='flex items-center gap-2 mb-4'>
        <Clock className='w-4 h-4 text-gray-500' />
        <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Recent Creations</p>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-40'>
          <div className='w-8 h-8 rounded-full border-2 border-white/10 border-t-white animate-spin'></div>
        </div>
      ) : creations.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-40 text-gray-600'>
          <Sparkles className='w-10 h-10 mb-3 opacity-20' />
          <p className='text-sm'>No creations yet. Start creating!</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {creations.map(item => <CreationItem key={item.id} item={item} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
};

export default Dashboard;