import { useState } from 'react'

// Saves state to sessionStorage so it persists when navigating between pages
const useSessionState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(key)
      return saved ? JSON.parse(saved) : defaultValue
    } catch { return defaultValue }
  })

  const setSessionState = (value) => {
    setState(value)
    try { sessionStorage.setItem(key, JSON.stringify(value)) } catch {}
  }

  return [state, setSessionState]
}

export default useSessionState