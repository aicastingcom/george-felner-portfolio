import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { categories } from './data/categories'
import { Hero } from './components/Hero'
import { AboutPage } from './components/AboutPage'
import { CategorySection } from './components/CategorySection'
import { ThankYou } from './components/ThankYou'
import { ContactPage } from './components/ContactPage'
import { SceneProvider } from './scene/SceneContext'
import './App.css'

export default function App() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const pageOpen = aboutOpen || contactOpen

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      smoothWheel: true,
      wheelMultiplier: 0.7,
      touchMultiplier: 0.85,
      autoRaf: false,
    })

    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

    let raf = 0
    const loop = (time: number) => {
      if (!document.body.classList.contains('page-locked')) {
        lenis.raf(time)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('page-locked', pageOpen)
    document.body.style.overflow = pageOpen ? 'hidden' : ''
    return () => {
      document.body.classList.remove('page-locked')
      document.body.style.overflow = ''
    }
  }, [pageOpen])

  return (
    <SceneProvider>
      <div className="app">
        <header className="topnav">
          <a href="#top" className="nav-brand">
            George Felner
          </a>
          <nav>
            <button type="button" className="nav-link" onClick={() => setAboutOpen(true)}>
              About
            </button>
            <button type="button" className="nav-contact" onClick={() => setContactOpen(true)}>
              Contact Me
            </button>
          </nav>
        </header>

        <Hero />

        {categories.map((cat) => (
          <CategorySection key={cat.id} category={cat} />
        ))}

        <ThankYou />

        <footer className="site-footer">
          <p>George Felner · 12 international awards</p>
          <button type="button" className="footer-link" onClick={() => setContactOpen(true)}>
            georgefelner@gmail.com
          </button>
        </footer>

        <AboutPage open={aboutOpen} onClose={() => setAboutOpen(false)} />
        <ContactPage open={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    </SceneProvider>
  )
}
