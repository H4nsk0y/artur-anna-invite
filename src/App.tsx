import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FormEvent, lazy, ReactNode, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { copy, event, Language } from './content'
import { useSmoothWheelScroll } from './hooks/useSmoothWheelScroll'
import { Attendance, submitRsvp } from './services/rsvp'

const photoUrl = `${import.meta.env.BASE_URL}couple.jpg`
const musicUrl = `${import.meta.env.BASE_URL}music.mp3`
const AdminPage = lazy(() => import('./admin/AdminPage'))

function Icon({ name }: { name: 'sound' | 'muted' | 'map' | 'heart' | 'calendar' }) {
  const paths = {
    sound: <><path d="M11 5 6.8 8.5H3.5v7h3.3L11 19V5Z"/><path d="M15 8.5a5 5 0 0 1 0 7M17.8 5.8a9 9 0 0 1 0 12.4"/></>,
    muted: <><path d="M11 5 6.8 8.5H3.5v7h3.3L11 19V5Z"/><path d="m16 10 5 5m0-5-5 5"/></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

function Botanical({ side }: { side: 'left' | 'right' }) {
  return (
    <svg className={`botanical botanical--${side}`} viewBox="0 0 180 360" aria-hidden="true">
      <path d="M22 355C39 274 54 205 112 113c22-35 39-70 44-108" />
      <path d="M52 258c-21-12-35-31-38-55 25 4 43 20 45 45M78 204c-5-25 2-48 21-65 13 24 9 48-9 66M104 154c-18-14-26-34-23-56 23 8 37 26 32 49M132 101c-2-21 6-39 22-52 9 21 3 40-13 53M38 304c23-2 42 7 55 25-25 9-46 1-58-18" />
      <circle cx="117" cy="119" r="3" /><circle cx="64" cy="239" r="3" /><circle cx="146" cy="62" r="2.5" />
    </svg>
  )
}

function LanguageToggle({ language, onChange }: { language: Language; onChange: () => void }) {
  return (
    <button className="language-toggle" onClick={onChange} aria-label="Переключить язык">
      <span className={language === 'ru' ? 'active' : ''}>RU</span>
      <i />
      <span className={language === 'hy' ? 'active' : ''}>ՀԱՅ</span>
    </button>
  )
}

function EnvelopeGate({
  opening,
  language,
  onOpen,
}: {
  opening: boolean
  language: Language
  onOpen: () => void
}) {
  const t = copy[language]

  return (
    <motion.div
      className={`gate ${opening ? 'gate--opening' : ''}`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
    >
      <div className="gate__grain" />
      <Botanical side="left" />
      <Botanical side="right" />

      <div className="envelope-scene" aria-label={t.tapToOpen}>
        <div className="envelope">
          <div className="envelope__back" />
          <div className="envelope__letter">
            <span>{event.monogram}</span>
            <small>{t.heroDate}</small>
          </div>
          <div className="envelope__flap envelope__flap--top" />
          <div className="envelope__front">
            <div className="envelope__fold envelope__fold--left" />
            <div className="envelope__fold envelope__fold--right" />
            <div className="envelope__fold envelope__fold--bottom" />
          </div>
          <button className="wax-seal" onClick={onOpen} disabled={opening} aria-label={t.tapToOpen}>
            <span>{event.monogram}</span>
          </button>
        </div>
      </div>

      <div className="gate__hint">
        <span />
        <p>{t.tapToOpen}</p>
        <span />
      </div>
    </motion.div>
  )
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 34 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.section
      className={`flow-section ${className}`}
      initial={reduced ? false : { opacity: 0.2, y: 34, scale: 0.992 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.06 }}
      transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}

function SectionTitle({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="section-title">
      <span>{number}</span>
      <h2>{children}</h2>
      <i />
    </div>
  )
}

function Countdown({ language }: { language: Language }) {
  const t = copy[language]
  const target = useMemo(() => new Date(event.isoDate).getTime(), [])
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()))

  useEffect(() => {
    const timer = window.setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000)
    return () => window.clearInterval(timer)
  }, [target])

  const totalSeconds = Math.floor(left / 1000)
  const values = [
    [Math.floor(totalSeconds / 86400), t.days],
    [Math.floor((totalSeconds % 86400) / 3600), t.hours],
    [Math.floor((totalSeconds % 3600) / 60), t.minutes],
    [totalSeconds % 60, t.seconds],
  ]

  return (
    <div className="countdown">
      {values.map(([value, label]) => (
        <div className="countdown__item" key={String(label)}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function RsvpForm({ language }: { language: Language }) {
  const t = copy[language]
  const [fullName, setFullName] = useState('')
  const [attendance, setAttendance] = useState<Attendance | ''>('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'demo' | 'error'>('idle')

  async function handleSubmit(event_: FormEvent) {
    event_.preventDefault()
    if (!fullName.trim() || !attendance) {
      setStatus('error')
      return
    }

    setStatus('sending')
    try {
      const mode = await submitRsvp({ fullName: fullName.trim(), attendance, language })
      setStatus(mode === 'demo' ? 'demo' : 'success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="rsvp" onSubmit={handleSubmit}>
      <label className="field">
        <span>{t.fullName}</span>
        <input
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setStatus('idle') }}
          placeholder={t.fullNamePlaceholder}
          autoComplete="name"
        />
      </label>

      <fieldset>
        <legend>{t.attendanceQuestion}</legend>
        {(['yes', 'no'] as const).map((value) => (
          <label className={`radio-card ${attendance === value ? 'radio-card--selected' : ''}`} key={value}>
            <input
              type="radio"
              name="attendance"
              value={value}
              checked={attendance === value}
              onChange={() => { setAttendance(value); setStatus('idle') }}
            />
            <i />
            <span>{value === 'yes' ? t.yes : t.no}</span>
          </label>
        ))}
      </fieldset>

      <button className="primary-button" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? t.sending : t.send}
      </button>

      <AnimatePresence mode="wait">
        {status !== 'idle' && status !== 'sending' && (
          <motion.p
            className={`form-message form-message--${status}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            key={status}
          >
            {status === 'success' ? t.success : status === 'demo' ? t.demoSuccess : t.required}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  )
}

function MainInvitation({ language }: { language: Language }) {
  const t = copy[language]
  const names = event.partners[language]
  const reduced = useReducedMotion()

  return (
    <main className={`invitation invitation--${language}`}>
      <section className="hero">
        <img src={photoUrl} alt="Пара танцует" />
        <div className="hero__shade" />
        <div className="hero__content">
          <p>{t.heroEyebrow}</p>
          <h1><span>{names.one}</span><i>&</i><span>{names.two}</span></h1>
          <div><span /><b>{t.heroDate}</b><span /></div>
        </div>
        <div className="hero__scroll"><i /><span>scroll</span></div>
        <svg className="hero__tear" viewBox="0 0 640 46" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 22 C42 13 73 29 116 20 C153 12 180 29 220 22 C261 14 294 30 337 20 C380 10 413 28 455 20 C496 12 527 27 566 19 C596 13 619 18 640 14 L640 46 L0 46 Z" />
        </svg>
      </section>

      <AnimatedSection className="intro paper-section">
        <Reveal>
          <span className="ornament">✦</span>
          <h2>{t.dearTitle}</h2>
          <p>{t.dearText}</p>
          <div className="signature">{names.one} <i>&</i> {names.two}</div>
        </Reveal>
      </AnimatedSection>

      <AnimatedSection className="date-section dark-section">
        <Reveal className="date-card">
          <p>{t.inviteText}</p>
          <div className="date-display">
            <span>{event.dateDay}</span>
            <div><b>{t.month}</b><i>{t.weekday}</i><small>{event.dateYear}</small></div>
          </div>
          <div className="date-time"><Icon name="calendar" /><span>{t.timeLabel} {event.time}</span></div>
        </Reveal>
      </AnimatedSection>

      <AnimatedSection className="location paper-section">
        <Reveal>
          <SectionTitle number="01">{t.locationLabel}</SectionTitle>
          <div className="location-card">
            <Icon name="map" />
            <h3>{event.venue}</h3>
            <p>{event.address}</p>
            <a className="outline-button" href={event.mapUrl} target="_blank" rel="noreferrer">{t.mapButton}</a>
          </div>
        </Reveal>
      </AnimatedSection>

      <AnimatedSection className="schedule stone-section">
        <Reveal>
          <SectionTitle number="02">{t.scheduleLabel}</SectionTitle>
          <motion.div
            className="timeline"
            initial={reduced ? false : 'hidden'}
            whileInView={reduced ? undefined : 'visible'}
            viewport={{ once: true, amount: 0.28 }}
            variants={{ visible: { transition: { staggerChildren: 0.42, delayChildren: 0.12 } } }}
          >
            {t.schedule.map(([time, label], index) => (
              <motion.div
                className="timeline__item"
                key={time}
                variants={{
                  hidden: { opacity: 0, x: -20, y: 12 },
                  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <time>{time}</time>
                <i><span>{index + 1}</span></i>
                <p>{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </Reveal>
      </AnimatedSection>

      <AnimatedSection className="dress paper-section">
        <Reveal>
          <SectionTitle number="03">{t.dressLabel}</SectionTitle>
          <p className="section-copy">{t.dressText}</p>
          <div className="palette" aria-label="Цветовая палитра">
            {['#272724', '#6f5a4d', '#9e8270', '#c6b5a3', '#e5ddd1'].map((color, index) => (
              <motion.i key={color} style={{ background: color }} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} />
            ))}
          </div>
        </Reveal>
      </AnimatedSection>

      <AnimatedSection className="details dark-section">
        <Reveal>
          <SectionTitle number="04">{t.detailsLabel}</SectionTitle>
          <div className="details__list">
            {t.details.map((detail, index) => (
              <article key={detail}>
                <span>0{index + 1}</span>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </AnimatedSection>

      <AnimatedSection className="rsvp-section paper-section">
        <Reveal>
          <SectionTitle number="05">{t.rsvpLabel}</SectionTitle>
          <p className="section-copy">{t.rsvpText}</p>
          <RsvpForm language={language} />
        </Reveal>
      </AnimatedSection>

      <AnimatedSection className="countdown-section">
        <img src={photoUrl} alt="" />
        <div className="countdown-section__shade" />
        <Reveal className="countdown-section__content">
          <span>{t.countdownLabel}</span>
          <Countdown language={language} />
          <Icon name="heart" />
          <p>{t.footer}</p>
          <h2>{names.one} <i>&</i> {names.two}</h2>
        </Reveal>
      </AnimatedSection>
    </main>
  )
}

function InvitationApp() {
  const [language, setLanguage] = useState<Language>('ru')
  const [opening, setOpening] = useState(false)
  const [gateVisible, setGateVisible] = useState(true)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const openTimer = useRef<number | null>(null)

  useSmoothWheelScroll(!gateVisible)

  useEffect(() => {
    document.documentElement.lang = language === 'ru' ? 'ru' : 'hy'
  }, [language])

  useEffect(() => {
    document.body.classList.toggle('is-locked', gateVisible)
    return () => document.body.classList.remove('is-locked')
  }, [gateVisible])

  useEffect(() => () => {
    if (openTimer.current) window.clearTimeout(openTimer.current)
  }, [])

  function startMusic() {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.42
    void audio.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false))
  }

  function openInvitation() {
    if (opening) return
    startMusic()
    setOpening(true)
    openTimer.current = window.setTimeout(() => setGateVisible(false), 1750)
  }

  function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) startMusic()
    else {
      audio.pause()
      setMusicPlaying(false)
    }
  }

  const t = copy[language]

  return (
    <>
      <audio ref={audioRef} src={musicUrl} preload="metadata" loop />
      <MainInvitation language={language} />

      <div className="floating-controls">
        {!gateVisible && (
          <motion.button
            className="music-toggle"
            onClick={toggleMusic}
            aria-label={musicPlaying ? t.musicOn : t.musicOff}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Icon name={musicPlaying ? 'sound' : 'muted'} />
            {musicPlaying && <i />}
          </motion.button>
        )}
        <LanguageToggle language={language} onChange={() => setLanguage(language === 'ru' ? 'hy' : 'ru')} />
      </div>

      <AnimatePresence>
        {gateVisible && <EnvelopeGate opening={opening} language={language} onOpen={openInvitation} />}
      </AnimatePresence>
    </>
  )
}

function isAdminRoute() {
  const hash = window.location.hash
  return (
    hash.startsWith('#/admin') ||
    hash.includes('access_token=') ||
    hash.includes('refresh_token=') ||
    hash.includes('error_code=') ||
    hash.includes('type=') ||
    new URLSearchParams(window.location.search).has('admin')
  )
}

export default function App() {
  const [adminRoute, setAdminRoute] = useState(isAdminRoute)

  useEffect(() => {
    const handleRoute = () => setAdminRoute(isAdminRoute())
    window.addEventListener('hashchange', handleRoute)
    window.addEventListener('popstate', handleRoute)
    return () => {
      window.removeEventListener('hashchange', handleRoute)
      window.removeEventListener('popstate', handleRoute)
    }
  }, [])

  if (adminRoute) {
    return (
      <Suspense fallback={<div className="route-loader"><span /></div>}>
        <AdminPage />
      </Suspense>
    )
  }

  return <InvitationApp />
}
