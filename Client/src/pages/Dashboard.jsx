import React, { useEffect, useState } from 'react'
import { Gem, Sparkles, Clock } from 'lucide-react'
import { Protect, useAuth } from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

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

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`/api/user/delete-creation/${id}`, {
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

  useEffect(() => { getDashboardData(); }, []);
  useEffect(() => { AOS.init({ duration: 600, easing: 'ease-out', once: true }); }, []);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 bg-[#0A0A0D] text-white">
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
            <h2 className="text-3xl font-bold mt-1">
              <Protect plan="Premium" fallback="Free">Premium</Protect>
            </h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Gem className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Recent Creations */}
      <div className='flex items-center gap-2 mb-4'>
        <Clock className='w-4 h-4 text-gray-500' />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Creations</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white animate-spin"></div>
        </div>
      ) : creations.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-40 text-gray-600'>
          <Sparkles className='w-10 h-10 mb-3 opacity-20' />
          <p className='text-sm'>No creations yet. Start creating!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {creations.map((item) => (
            <CreationItem key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;