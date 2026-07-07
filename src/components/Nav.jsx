import { useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { profile } from '../content/data'
import { useLang } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import MagneticButton from './MagneticButton'
import './Nav.css'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      className="nav__theme"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-cursor={isDark ? 'Light' : 'Dark'}
    >
      <span className="nav__theme-track">
        <span className={`nav__theme-thumb ${isDark ? 'is-dark' : ''}`}>
          {isDark ? (
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          )}
        </span>
      </span>
    </button>
  )
}

const LINKS = [
  { id: 'about', label: { id: 'Tentang', en: 'About' } },
  { id: 'work', label: { id: 'Karya', en: 'Work' } },
  { id: 'experience', label: { id: 'Pengalaman', en: 'Experience' } },
  { id: 'contact', label: { id: 'Kontak', en: 'Contact' } },
]

export default function Nav() {
  const { t, lang, toggle } = useLang()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 40)
    if (open) return
    setHidden(y > prev && y > 240)
  })

  const go = (id) => {
    setOpen(false)
    if (window.__lenis) window.__lenis.scrollTo(id === 'top' ? 0 : `#${id}`, { offset: -8 })
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'nav--scrolled' : ''}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: hidden ? -120 : 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="nav__inner container">
          <button className="nav__logo" onClick={() => go('top')} data-cursor="Top" aria-label="Home">
            <span className="nav__logo-mark">✦</span>
            <span className="nav__logo-name">{profile.name.split(' ')[0]}</span>
          </button>

          <nav className="nav__links" aria-label="Primary">
            {LINKS.map((l) => (
              <MagneticButton key={l.id} className="nav__link" strength={0.3} onClick={() => go(l.id)}>
                <span>{t(l.label)}</span>
              </MagneticButton>
            ))}
          </nav>

          <div className="nav__actions">
            <ThemeToggle />

            <button className="nav__lang" onClick={toggle} aria-label="Switch language">
              <span className={lang === 'id' ? 'is-active' : ''}>ID</span>
              <span className="nav__lang-sep">/</span>
              <span className={lang === 'en' ? 'is-active' : ''}>EN</span>
            </button>

            <MagneticButton className="nav__cta" onClick={() => go('contact')} cursor="Say hi">
              {t({ id: 'Ngobrol yuk', en: "Let's talk" })}
            </MagneticButton>

            <button
              className={`nav__burger ${open ? 'is-open' : ''}`}
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={open}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav__overlay"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="nav__overlay-links">
              {LINKS.map((l, i) => (
                <motion.button
                  key={l.id}
                  onClick={() => go(l.id)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="nav__overlay-index">0{i + 1}</span>
                  {t(l.label)}
                </motion.button>
              ))}
            </nav>
            <div className="nav__overlay-foot">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
