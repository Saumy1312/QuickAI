import { useUser } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth()

  const fetchCreations = async () => {
    try {
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) { setCreations(data.creations) } else { toast.error(data.message) }
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  const imageLikeToggle = async (id) => {
    try {
      const token = await getToken();
      const { data } = await axios.post('/api/user/toggle-like-creations', { id }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) { toast.success(data.message); await fetchCreations() } else { toast.error(data.message) }
    } catch (error) { toast.error(error.message) }
  };

  useEffect(() => { if (user) { fetchCreations() } }, [user])

  return !loading ? (
    <div className='flex-1 h-full flex flex-col gap-4 p-6 bg-[#0A0A0D]'>
      <p className='text-white font-semibold text-lg'>Community Creations</p>
      <div className='bg-[#0F0F12] border border-white/10 h-full w-full rounded-xl overflow-y-auto'>
        <div className='flex flex-wrap'>
          {creations.length === 0 && (
            <div className='w-full flex flex-col items-center justify-center py-20 text-gray-600'>
              <p className='text-sm'>No public creations yet.</p>
            </div>
          )}
          {creations.map((creation, index) => (
            <div key={index} className='relative group inline-block pl-3 pt-3 w-full sm:w-1/2 lg:w-1/3'>
              <div className='relative rounded-lg overflow-hidden'>
                <img src={creation.content} alt="" className='w-full h-full object-cover' />

                {/* Always visible: creator info bottom left + likes bottom right */}
                <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 flex items-end justify-between'>
                  {/* Creator info */}
                  <div className='flex items-center gap-2'>
                    {creation.creator_avatar ? (
                      <img
                        src={creation.creator_avatar}
                        alt={creation.creator_name}
                        className='w-6 h-6 rounded-full border border-white/20 object-cover flex-shrink-0'
                      />
                    ) : (
                      <div className='w-6 h-6 rounded-full bg-purple-500/40 border border-purple-400/30 flex items-center justify-center flex-shrink-0'>
                        <span className='text-white text-[10px] font-semibold'>
                          {creation.creator_name?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <span className='text-white text-xs font-medium truncate max-w-[100px]'>
                      {creation.creator_name}
                    </span>
                  </div>

                  {/* Likes */}
                  <div className='flex gap-1 items-center'>
                    <p className='text-white text-xs'>{creation.likes.length}</p>
                    <Heart
                      onClick={() => imageLikeToggle(creation.id)}
                      className={`min-w-5 h-5 hover:scale-110 cursor-pointer transition-transform ${creation.likes.includes(user.id) ? 'fill-red-500 text-red-600' : 'text-white'}`}
                    />
                  </div>
                </div>

                {/* Hover: show prompt */}
                <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4'>
                  <p className='text-white text-sm text-center line-clamp-4'>{creation.prompt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className='flex justify-center items-center h-full bg-[#0A0A0D]'>
      <span className='w-10 h-10 rounded-full border-3 border-purple-500 border-t-transparent animate-spin'></span>
    </div>
  )
}

export default Community