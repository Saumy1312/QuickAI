import { useState } from 'react'
import toast from 'react-hot-toast'

const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false)

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return { copied, copy }
}

export default useCopyToClipboard