import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const useGenerateImage = (endpoint) => {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const { getToken } = useAuth()

  const generate = async (payload) => {
    try {
      setLoading(true)
      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) { setContent(data.content) }
      else { toast.error(data.message) }
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  const download = (filename = 'image.png') => {
    if (!content) return
    const a = document.createElement('a')
    a.href = content
    a.download = filename
    a.click()
    toast.success('Image downloaded!')
  }

  return { loading, content, generate, download }
}

export default useGenerateImage