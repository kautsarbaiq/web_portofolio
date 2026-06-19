import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { profile } from '../content/data'
import { useLang } from '../context/LanguageContext'
import './Preloader.css'

/* Intro: a counter races to 100 while the name reveals, then the
   panel splits and lifts to unveil the page. */
export default function Preloader({ onComplete }) {
  const { t } = useLang()
  const [count, setCount] = useState(0)

  useEffect(() => {
    let raf
    const start = performance.now()
    const DURATION = 1700
    const tick = (now) => {
      const p = Math.min((now - start) / DURATION, 1)
      // ease-out so the numbers slow near the end
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setTimeout(onComplete, 450)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onComplete])

  return (
    <motion.div
      className="preloader"
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="preloader__inner">
        <motion.div
          className="preloader__mark"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="preloader__name">{profile.name}</span>
          <span className="preloader__role">{t(profile.role)}</span>
        </motion.div>

        <div className="preloader__counter">
          <span>{String(count).padStart(3, '0')}</span>
          <span className="preloader__percent">%</span>
        </div>
      </div>

      <div className="preloader__bar">
        <motion.div className="preloader__bar-fill" style={{ scaleX: count / 100 }} />
      </div>
    </motion.div>
  )
}
