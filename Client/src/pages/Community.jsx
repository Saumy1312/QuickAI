import { useUser } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import { Heart, X, ImageIcon, ThumbsUp, Calendar } from 'lucide-react'
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

// ── Profile Modal ──────────────────────────────────────────────
const ProfileModal = ({ userId, onClose, getToken, currentUser }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await axios.get(`/api/user/profile/${userId}`, {
                    headers: { Authorization: `Bearer ${await getToken()}` }
                });
                if (data.success) setProfile(data.profile);
                else toast.error(data.message);
            } catch (e) { toast.error(e.message); }
            setLoading(false);
        };
        fetch();
    }, [userId]);

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4'
            onClick={onClose}>
            <div className='bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-md p-6 text-white relative'
                onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className='absolute top-4 right-4 text-gray-500 hover:text-white transition-colors'>
                    <X className='w-5 h-5' />
                </button>

                {loading ? (
                    <div className='flex justify-center items-center h-40'>
                        <span className='w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin'></span>
                    </div>
                ) : profile ? (
                    <>
                        {/* Avatar + Name */}
                        <div className='flex flex-col items-center text-center mb-6'>
                            {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.name}
                                    className='w-20 h-20 rounded-full border-2 border-white/10 object-cover mb-3' />
                            ) : (
                                <div className='w-20 h-20 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mb-3'>
                                    <span className='text-3xl font-bold text-white'>
                                        {profile.name?.[0]?.toUpperCase() || '?'}
                                    </span>
                                </div>
                            )}
                            <h2 className='text-xl font-bold'>{profile.name}</h2>
                            <p className='text-xs text-gray-500 flex items-center gap-1 mt-1'>
                                <Calendar className='w-3 h-3' />
                                Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className='grid grid-cols-2 gap-3 mb-6'>
                            <div className='bg-white/5 border border-white/10 rounded-xl p-4 text-center'>
                                <div className='flex items-center justify-center gap-1.5 text-blue-400 mb-1'>
                                    <ImageIcon className='w-4 h-4' />
                                </div>
                                <p className='text-2xl font-bold text-white'>{profile.publicCreations}</p>
                                <p className='text-xs text-gray-500 mt-0.5'>Public Creations</p>
                            </div>
                            <div className='bg-white/5 border border-white/10 rounded-xl p-4 text-center'>
                                <div className='flex items-center justify-center gap-1.5 text-red-400 mb-1'>
                                    <Heart className='w-4 h-4' />
                                </div>
                                <p className='text-2xl font-bold text-white'>{profile.totalLikes}</p>
                                <p className='text-xs text-gray-500 mt-0.5'>Total Likes</p>
                            </div>
                        </div>

                        {/* Their public images */}
                        {profile.creations.length > 0 && (
                            <>
                                <p className='text-xs text-gray-500 uppercase tracking-wider font-medium mb-3'>Their Creations</p>
                                <div className='grid grid-cols-3 gap-2 max-h-48 overflow-y-auto'>
                                    {profile.creations.map((c, i) => (
                                        <img key={i} src={c.content} alt={c.prompt}
                                            title={c.prompt}
                                            className='w-full h-20 object-cover rounded-lg border border-white/10 hover:border-white/30 transition-colors' />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <p className='text-center text-gray-500 py-10'>Profile not found.</p>
                )}
            </div>
        </div>
    );
};

// ── Community Page ─────────────────────────────────────────────
const Community = () => {
    const [creations, setCreations] = useState([])
    const { user } = useUser()
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState(null);
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

            {/* Profile Modal */}
            {selectedUserId && (
                <ProfileModal
                    userId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                    getToken={getToken}
                    currentUser={user}
                />
            )}

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

                                {/* Always visible bottom bar */}
                                <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 flex items-end justify-between'>
                                    {/* Clickable creator info */}
                                    <button
                                        onClick={() => setSelectedUserId(creation.user_id)}
                                        className='flex items-center gap-2 cursor-pointer bg-black/40 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-full px-2 py-1 transition-all'>
                                        {creation.creator_avatar ? (
                                            <img src={creation.creator_avatar} alt={creation.creator_name}
                                                className='w-6 h-6 rounded-full border border-white/20 object-cover flex-shrink-0' />
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
                                    </button>

                                    {/* Likes */}
                                    <div className='flex gap-1 items-center'>
                                        <p className='text-white text-xs'>{creation.likes.length}</p>
                                        <Heart
                                            onClick={() => imageLikeToggle(creation.id)}
                                            className={`min-w-5 h-5 hover:scale-110 cursor-pointer transition-transform ${creation.likes.includes(user.id) ? 'fill-red-500 text-red-600' : 'text-white'}`}
                                        />
                                    </div>
                                </div>

                                {/* Hover prompt */}
                                <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 pointer-events-none'>
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