import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'kb-theme'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  // Theme switch with a circular reveal expanding from the toggle button
  // (View Transitions API). Falls back to a plain switch when the API is
  // missing or the user prefers reduced motion.
  const toggle = useCallback((event) => {
    const root = document.documentElement
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!document.startViewTransition || reduce) {
      setTheme(next)
      return
    }

    const x = event?.clientX ?? window.innerWidth - 90
    const y = event?.clientY ?? 40
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    // Freeze CSS transitions so the reveal edge stays crisp.
    root.classList.add('theme-switching')
    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next))
      root.dataset.theme = next
    })
    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 620,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
      .catch(() => {})
    transition.finished.finally(() => root.classList.remove('theme-switching'))
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
