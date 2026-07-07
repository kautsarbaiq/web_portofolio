import { useEffect, useState } from 'react'
import { profile, education } from '../content/data'
import { useLang } from '../context/LanguageContext'
import Reveal from './Reveal'
import SplitReveal from './SplitReveal'
import MagneticButton from './MagneticButton'
import './Contact.css'

function Clock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta',
      hour12: false,
    })
    const update = () => setTime(fmt.format(new Date()))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="footer__clock">{time} WIB</span>
}

export default function Contact() {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section className="section contact" id="contact">
      <div className="container">
        <Reveal as="span" className="eyebrow">
          {t({ id: '05 — Kontak', en: '05 — Contact' })}
        </Reveal>

        <SplitReveal
          as="h2"
          className="contact__title"
          segments={[
            { text: t({ id: 'Mari bangun ', en: "Let’s build " }) },
            { text: t({ id: 'sesuatu', en: 'something' }), className: 'serif gradient-text' },
            { br: true },
            { text: t({ id: 'yang berkesan.', en: 'worth remembering.' }) },
          ]}
        />

        <Reveal className="contact__actions" delay={0.12}>
          <MagneticButton className="contact__email" href={`mailto:${profile.email}`} cursor="Email">
            {profile.email}
          </MagneticButton>
          <button className="contact__copy" onClick={copyEmail} data-cursor="Copy">
            {copied ? t({ id: 'Tersalin ✓', en: 'Copied ✓' }) : t({ id: 'Salin email', en: 'Copy email' })}
          </button>
          <a
            className="contact__copy contact__cv"
            href="/Kautsar-Baiquni-CV.pdf"
            target="_blank"
            rel="noopener"
            download
            data-cursor="PDF"
          >
            {t({ id: 'Unduh CV', en: 'Download CV' })} ↓
          </a>
          <a
            className="contact__copy contact__cv"
            href="/Kautsar-Baiquni-Cover-Letter.pdf"
            target="_blank"
            rel="noopener"
            download
            data-cursor="PDF"
          >
            {t({ id: 'Unduh Cover Letter', en: 'Download Cover Letter' })} ↓
          </a>
        </Reveal>

        <Reveal className="contact__socials" delay={0.18}>
          {profile.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="contact__social" data-cursor="Open">
              <span className="contact__social-label">{s.label}</span>
              <span className="contact__social-handle">{s.handle}</span>
              <span className="contact__social-arrow">↗</span>
            </a>
          ))}
        </Reveal>
      </div>

      {/* giant outlined signature marquee */}
      <div className="sig" aria-hidden="true">
        <div className="sig__track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span className="sig__item" key={i}>
              Kautsar Baiquni <span className="sig__star">✦</span> Fullstack Developer{' '}
              <span className="sig__star">✦</span>
            </span>
          ))}
        </div>
      </div>

      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__col">
            <span className="footer__mark">✦ {profile.name}</span>
            <span className="footer__role">{t(profile.role)} · {t(profile.location)}</span>
            {education.map((e, i) => (
              <span className="footer__edu" key={i}>
                {t(e.school)} · {t(e.period)}
              </span>
            ))}
          </div>

          <div className="footer__col footer__col--right">
            <Clock />
            <button
              className="footer__top"
              onClick={() =>
                window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })
              }
              data-cursor="Top"
            >
              {t({ id: 'Kembali ke atas', en: 'Back to top' })} ↑
            </button>
          </div>
        </div>
        <div className="container footer__bottom">
          <span>© 2026 {profile.name}</span>
          <span>{t({ id: 'Dibuat dengan React, Three.js & rasa.', en: 'Built with React, Three.js & care.' })}</span>
        </div>
      </footer>
    </section>
  )
}
