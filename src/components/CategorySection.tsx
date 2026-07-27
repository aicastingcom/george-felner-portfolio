import { useEffect, useRef } from 'react'
import type { Category } from '../data/categories'
import { useScene, type ChapterMotion } from '../scene/SceneContext'
import { DeviceScreen } from './DeviceScreen'
import { SequenceRig } from './scene/SequenceRig'

type Props = { category: Category }

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/** Brief timeline: face-on → rotate to profile → screen side-in → fade → zoom */
function phases(p: number): ChapterMotion {
  const turn = smoothstep(0.05, 0.46, p)
  const reveal = smoothstep(0.42, 0.58, p)
  const fade = smoothstep(0.52, 0.74, p)
  const zoom = smoothstep(0.48, 0.96, p)
  return { turn, reveal, fade, zoom, progress: p }
}

export function CategorySection({ category }: Props) {
  const pinRef = useRef<HTMLElement>(null)
  const { activeId, report, motion, videoIndex, setVideoIndex } = useScene()
  const isActive = activeId === category.id

  useEffect(() => {
    const el = pinRef.current
    if (!el) return

    let raf = 0
    let watching = false

    const measure = () => {
      const rect = el.getBoundingClientRect()
      const ih = window.innerHeight
      // Skip work when section is far off-screen
      if (rect.bottom < -ih * 0.5 || rect.top > ih * 1.5) {
        report(category.id, 0, phases(rect.top < 0 ? 1 : 0))
        return
      }

      const total = el.offsetHeight - ih
      const progress = total > 0 ? clamp01(-rect.top / total) : 0

      const sticky = el.querySelector('.category-sticky') as HTMLElement | null
      let score = 0
      if (sticky) {
        const sr = sticky.getBoundingClientRect()
        const overlap = Math.max(0, Math.min(sr.bottom, ih) - Math.max(sr.top, 0))
        score = overlap / ih
        if (sr.top <= 1 && sr.bottom >= ih - 1) score = 1
      }

      report(category.id, score, phases(progress))
    }

    const tick = () => {
      measure()
      if (watching) raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        const next = Boolean(entry?.isIntersecting)
        if (next === watching) return
        watching = next
        if (watching) {
          cancelAnimationFrame(raf)
          raf = requestAnimationFrame(tick)
        } else {
          cancelAnimationFrame(raf)
          measure()
        }
      },
      { rootMargin: '50% 0px' },
    )
    io.observe(el)
    measure()

    return () => {
      watching = false
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [category.id, report])

  const showTitle = isActive && motion.reveal < 0.15
  const showCue = isActive && motion.progress < 0.18 && motion.reveal < 0.05
  const showFigure = isActive && motion.fade < 0.95

  return (
    <section className="category-pin" id={category.id} ref={pinRef} data-category={category.id}>
      <div className="category-sticky">
        {showTitle && (
          <div className="category-copy">
            <h2>{category.title}</h2>
            <p className="tagline">{category.tagline}</p>
          </div>
        )}

        {showFigure && (
          <div className="category-canvas">
            <SequenceRig category={category} turn={motion.turn} fade={motion.fade} />
          </div>
        )}

        {isActive && (
          <DeviceScreen
            category={category}
            turn={motion.turn}
            zoom={motion.zoom}
            active={isActive}
            index={videoIndex}
            onIndex={setVideoIndex}
          />
        )}

        {showCue && <p className="scroll-cue">Scroll to turn</p>}
      </div>
    </section>
  )
}
