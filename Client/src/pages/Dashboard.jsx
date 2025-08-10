import React, { useEffect, useState } from 'react'
import { dummyCreationData } from '../assets/assets'
import { Gem, Sparkles } from 'lucide-react'
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

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out',
      once: true,
    });
  }, []);

  return (
    <div className="h-full overflow-y-scroll p-6 bg-[#f8f9fa]">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Creations */}
        <div className="flex justify-between items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition duration-200">
          <div className="text-slate-700">
            <p className="text-sm font-medium">Total Creations</p>
            <h2 className="text-2xl font-bold">{creations.length}</h2>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Active Plan */}
        <div className="flex justify-between items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition duration-200">
          <div className="text-slate-700">
            <p className="text-sm font-medium">Active Plan</p>
            <h2 className="text-2xl font-bold">
              <Protect plan="Premium" fallback="Free">Premium</Protect>
            </h2>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] flex items-center justify-center text-white">
            <Gem className="w-5 h-5" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-3/4">
          <div className="w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-lg font-semibold text-gray-700">Recent Creations</p>
          {creations.length === 0 ? (
            <p className="text-gray-500">No creations yet.</p>
          ) : (
            creations.map((item) => (
              <CreationItem key={item.id} item={item} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 