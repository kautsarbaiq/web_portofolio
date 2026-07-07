import { useEffect, useState } from 'react'
import { useLang } from '../context/LanguageContext'
import './SectionNav.css'

/* Fixed dot navigation on the right edge: tracks the section in view,
   shows its label on hover/active, and smooth-scrolls on click. */

const SECTIONS = [
  { id: 'top', label: { id: 'Beranda', en: 'Home' } },
  { id: 'about', label: { id: 'Tentang', en: 'About' } },
  { id: 'experience', label: { id: 'Pengalaman', en: 'Experience' } },
  { id: 'work', label: { id: 'Karya', en: 'Work' } },
  { id: 'skills', label: { id: 'Keahlian', en: 'Skills' } },
  { id: 'contact', label: { id: 'Kontak', en: 'Contact' } },
]

export default function SectionNav() {
  const { t } = useLang()
  const [active, setActive] = useState('top')

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id)
        }
      },
      // a slim band around the viewport centre decides the active section
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  const go = (id) => {
    if (window.__lenis) window.__lenis.scrollTo(id === 'top' ? 0 : `#${id}`, { offset: -8 })
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="snav" aria-label="Sections">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          className={`snav__item ${active === s.id ? 'is-active' : ''}`}
          onClick={() => go(s.id)}
          aria-label={t(s.label)}
          aria-current={active === s.id ? 'true' : undefined}
        >
          <span className="snav__label">{t(s.label)}</span>
          <span className="snav__dot" />
        </button>
      ))}
    </nav>
  )
}
