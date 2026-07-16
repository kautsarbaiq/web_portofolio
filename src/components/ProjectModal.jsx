import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { projects } from '../content/data'
import { useLang } from '../context/LanguageContext'
import './ProjectModal.css'

/* Full-screen editorial case-study overlay. Opens from a project card,
   locks the page scroll, and lets you walk the whole index with the
   arrow keys or the prev/next rail. Content is 100% the real project
   data — no invented copy. */

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

const contentVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
}
const rowVariants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

export default function ProjectModal({ index, onClose, onNav }) {
  const { t } = useLang()
  const open = index !== null
  const project = open ? projects[index] : null
  const n = projects.length

  // scroll lock + keyboard controls while open
  useEffect(() => {
    if (!open) return
    window.__lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav((index + 1) % n)
      if (e.key === 'ArrowLeft') onNav((index - 1 + n) % n)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      window.__lenis?.start()
    }
  }, [open, index, n, onClose, onNav])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pmodal"
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          exit={{ clipPath: 'inset(100% 0 0 0)' }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* top rail */}
          <div className="pmodal__top container">
            <span className="pmodal__count">
              {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
            <button className="pmodal__close" onClick={onClose} data-cursor="Close" autoFocus>
              {t({ id: 'Tutup', en: 'Close' })} ✕
            </button>
          </div>

          {/* swappable content — animates when walking prev/next */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="pmodal__scroll"
              variants={contentVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -18, transition: { duration: 0.22 } }}
            >
              <div className="container">
                <motion.div className="pmodal__plate" variants={rowVariants}>
                  <motion.img
                    src={project.image}
                    alt={`${project.title} preview`}
                    initial={{ clipPath: 'inset(0 0 100% 0)' }}
                    animate={{ clipPath: 'inset(0 0 0% 0)' }}
                    transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                </motion.div>

                <div className="pmodal__grid">
                  <div className="pmodal__main">
                    <motion.h3 className="pmodal__title" variants={rowVariants}>
                      {project.title}
                    </motion.h3>
                    <motion.p className="pmodal__tagline" variants={rowVariants}>
                      {t(project.tagline)}
                    </motion.p>
                    <motion.div className="pmodal__links" variants={rowVariants}>
                      {project.links.live && (
                        <a href={project.links.live} target="_blank" rel="noreferrer" data-cursor="Open">
                          {t({ id: 'Kunjungi situs', en: 'Visit site' })} ↗
                        </a>
                      )}
                      {project.links.repo && (
                        <a href={project.links.repo} target="_blank" rel="noreferrer" data-cursor="Code">
                          {t({ id: 'Lihat kode', en: 'View code' })} ↗
                        </a>
                      )}
                    </motion.div>
                  </div>

                  <div className="pmodal__meta">
                    <motion.div className="pmodal__meta-row" variants={rowVariants}>
                      <span className="pmodal__meta-label">{t({ id: 'Tahun', en: 'Year' })}</span>
                      <span>{project.year}</span>
                    </motion.div>
                    <motion.div className="pmodal__meta-row" variants={rowVariants}>
                      <span className="pmodal__meta-label">{t({ id: 'Jenis', en: 'Type' })}</span>
                      <span>{project.type === 'app' ? t({ id: 'Aplikasi', en: 'App' }) : 'Web'}</span>
                    </motion.div>
                    {project.links.live && (
                      <motion.div className="pmodal__meta-row" variants={rowVariants}>
                        <span className="pmodal__meta-label">URL</span>
                        <span>{hostOf(project.links.live)}</span>
                      </motion.div>
                    )}
                    <motion.div className="pmodal__meta-row pmodal__meta-row--tech" variants={rowVariants}>
                      <span className="pmodal__meta-label">{t({ id: 'Teknologi', en: 'Stack' })}</span>
                      <span>{project.tech.join(' · ')}</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* prev / next rail */}
          <div className="pmodal__nav container">
            <button onClick={() => onNav((index - 1 + n) % n)} data-cursor="Prev">
              ← <span>{projects[(index - 1 + n) % n].title}</span>
            </button>
            <button onClick={() => onNav((index + 1) % n)} data-cursor="Next">
              <span>{projects[(index + 1) % n].title}</span> →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
