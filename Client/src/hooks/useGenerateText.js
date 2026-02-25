import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const useGenerateText = (endpoint, sessionKey) => {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState(() => {
    if (!sessionKey) return ''
    try { return JSON.parse(sessionStorage.getItem(sessionKey)) || '' } catch { return '' }
  })
  const { getToken } = useAuth()

  const generate = async (payload) => {
    try {
      setLoading(true)
      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setContent(data.content)
        if (sessionKey) sessionStorage.setItem(sessionKey, JSON.stringify(data.content))
      } else { toast.error(data.message) }
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  return { loading, content, generate }
}

export default useGenerateText