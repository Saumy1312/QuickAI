import { FileText, Sparkles, Search, CheckCircle } from 'lucide-react';
import React, { useState } from 'react'
import Markdown from 'react-markdown';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const [analysisType, setAnalysisType] = useState('review'); // 'review' or 'ats'
    
    const { getToken } = useAuth();

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('resume', input);
            formData.append('analysisType', analysisType);

            const { data } = await axios.post('/api/ai/resume-review', formData,
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            );

            if (data.success) {
                setContent(data.content);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }
        setLoading(false)
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            {/* left col */}
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3'>
                    <Sparkles className='w-6 text-[#00DA83]' />
                    <h1 className='text-xl font-semibold'>Resume Analysis</h1>
                </div>

                {/* Analysis Type Selection */}
                <div className='mt-6'>
                    <p className='text-sm font-medium mb-3'>Choose Analysis Type</p>
                    <div className='flex gap-3'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                            <input
                                type="radio"
                                name="analysisType"
                                value="review"
                                checked={analysisType === 'review'}
                                onChange={(e) => setAnalysisType(e.target.value)}
                                className='w-4 h-4 text-[#00DA83]'
                            />
                            <FileText className='w-4 h-4' />
                            <span className='text-sm'>Review</span>
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                            <input
                                type="radio"
                                name="analysisType"
                                value="ats"
                                checked={analysisType === 'ats'}
                                onChange={(e) => setAnalysisType(e.target.value)}
                                className='w-4 h-4 text-[#00DA83]'
                            />
                            <Search className='w-4 h-4' />
                            <span className='text-sm'>ATS Check</span>
                        </label>
                    </div>
                </div>

                <p className='mt-6 text-sm font-medium'>Upload Resume</p>
                <input
                    onChange={(e) => setInput(e.target.files[0])}
                    type="file"
                    accept='application/pdf'
                    className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
                    required
                />
                <p className='text-xs text-gray-500 font-light mt-1'>Supports PDF resume only</p>

                <button
                    disabled={loading}
                    type='submit'
                    className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'
                >
                    {loading ? (
                        <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
                    ) : analysisType === 'ats' ? (
                        <CheckCircle className='w-5' />
                    ) : (
                        <FileText className='w-5' />
                    )}
                    {analysisType === 'ats' ? 'Check ATS Compatibility' : 'Review Resume'}
                </button>
            </form>

            {/* right col */}
            <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
                <div className='flex item-center gap-3'>
                    {analysisType === 'ats' ? (
                        <CheckCircle className='w-5 h-5 text-[#00DA83]' />
                    ) : (
                        <FileText className='w-5 h-5 text-[#00DA83]' />
                    )}
                    <h1 className='text-xl font-semibold'>
                        {analysisType === 'ats' ? 'ATS Analysis Results' : 'Review Results'}
                    </h1>
                </div>

                {!content ? (
                    <div className='flex-1 flex justify-center items-center'>
                        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                            {analysisType === 'ats' ? (
                                <CheckCircle className='w-9 h-9' />
                            ) : (
                                <FileText className='w-9 h-9' />
                            )}
                            <p>
                                Upload a resume and click "
                                {analysisType === 'ats' ? 'Check ATS Compatibility' : 'Review Resume'}
                                " to get started
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
                        <div className='reset-tw'>
                            <Markdown>{content}</Markdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReviewResume