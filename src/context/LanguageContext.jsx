import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'

const LanguageContext = createContext(null)

const STORAGE_KEY = 'kb-lang'

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('id')

  // Restore saved preference once on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'id' || saved === 'en') setLang(saved)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang
  }, [lang])

  // Language switch with a soft page crossfade (View Transitions API);
  // falls back to an instant swap.
  const toggle = useCallback(() => {
    const next = document.documentElement.lang === 'id' ? 'en' : 'id'
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) {
      setLang(next)
      return
    }
    const transition = document.startViewTransition(() => {
      flushSync(() => setLang(next))
    })
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { opacity: [0, 1] },
          { duration: 320, easing: 'ease', pseudoElement: '::view-transition-new(root)' },
        )
      })
      .catch(() => {})
  }, [])

  // Resolve a bilingual value. Accepts { id, en } objects, arrays of them,
  // or plain strings (returned as-is).
  const t = useCallback(
    (value) => {
      if (value == null) return ''
      if (typeof value === 'string') return value
      if (Array.isArray(value)) return value.map((v) => t(v))
      return value[lang] ?? value.en ?? value.id ?? ''
    },
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
