'use client'
import { useEffect } from 'react'

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js')
          reg.addEventListener?.('updatefound', () => {})
        } catch {}
      }
      setTimeout(register, 0)
    }
  }, [])
  return null
}
