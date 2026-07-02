import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import Preloader from './components/Preloader'
import Background from './components/Background'
import Cursor from './components/Cursor'
import ScrollProgress from './components/ScrollProgress'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'

export default function App() {
  const [loading, setLoading] = useState(true)

  // Lock scroll while the preloader is up.
  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [loading])

  // Track the cursor inside .spot glass cards for the spotlight highlight.
  useEffect(() => {
    const onMove = (e) => {
      const el = e.target.closest?.('.spot')
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--sx', `${((e.clientX - r.left) / r.width) * 100}%`)
      el.style.setProperty('--sy', `${((e.clientY - r.top) / r.height) * 100}%`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // Smooth scrolling (Lenis) — start once the intro is done.
  useEffect(() => {
    if (loading) return
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    window.__lenis = lenis
    let raf
    const loop = (time) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      delete window.__lenis
    }
  }, [loading])

  return (
    <>
      <Background />
      <Cursor />
      <ScrollProgress />

      <AnimatePresence>
        {loading && <Preloader key="preloader" onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <Nav />
      <main>
        <Hero start={!loading} />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
    </>
  )
}
