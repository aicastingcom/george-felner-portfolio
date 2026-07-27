import { useEffect, useMemo, useState } from 'react'
import type { Category } from '../../data/categories'

type Props = {
  category: Category
  turn: number
  fade: number
}

type SeqInfo = { count: number; ext: 'webp' | 'jpg' | 'png' }

/**
 * Scroll-scrubbed turntable from George's character maps.
 * Rules: portfolio/SEQUENCE_RULES.md — read before any rebuild.
 * Exactly 5 hard-cut frames (frame-00 … frame-04). No AI faces. No CSS fake yaw.
 */
export function SequenceRig({ category, turn, fade }: Props) {
  const [info, setInfo] = useState<SeqInfo | null>(null)

  useEffect(() => {
    let cancelled = false
    const base = `/sequences/${category.id}`
    const exts = ['webp', 'jpg', 'png'] as const

    const probe = async () => {
      let ext: SeqInfo['ext'] = 'jpg'
      let count = 0

      for (let i = 0; i < 32; i++) {
        const pad = String(i).padStart(2, '0')
        let hit: SeqInfo['ext'] | null = null
        for (const e of exts) {
          const src = `${base}/frame-${pad}.${e}`
          const ok = await new Promise<boolean>((resolve) => {
            const img = new Image()
            img.onload = () => resolve(true)
            img.onerror = () => resolve(false)
            img.src = src
          })
          if (ok) {
            hit = e
            break
          }
        }
        if (!hit) break
        if (i === 0) ext = hit
        count++
      }

      if (!cancelled) setInfo({ count, ext })
    }

    void probe()
    return () => {
      cancelled = true
    }
  }, [category.id])

  useEffect(() => {
    if (!info || info.count < 1) return
    for (let i = 0; i < info.count; i++) {
      const img = new Image()
      img.decoding = 'async'
      img.src = `/sequences/${category.id}/frame-${String(i).padStart(2, '0')}.${info.ext}`
    }
  }, [category.id, info])

  const t = Math.max(0, Math.min(1, turn))

  const index = useMemo(() => {
    if (!info || info.count <= 1) return 0
    return Math.min(info.count - 1, Math.round(t * (info.count - 1)))
  }, [t, info])

  const opacity = Math.max(0, 1 - fade)

  // Slide figure as he turns — make room for device side-in (verified per chapter)
  const slideLeft = category.id === 'animation' || category.id === 'drone'
  const x = `${(slideLeft ? -1 : 1) * (8 + t * 14)}%`

  if (!info) {
    return <div className="sequence-rig sequence-loading" style={{ opacity }} />
  }

  if (info.count === 0) {
    return (
      <div className="sequence-rig sequence-pending" style={{ opacity }}>
        <p>Building turn sequence for {category.title}…</p>
      </div>
    )
  }

  const src = `/sequences/${category.id}/frame-${String(index).padStart(2, '0')}.${info.ext}`

  return (
    <div
      className={`sequence-rig side-${category.profileSide}`}
      style={{
        opacity,
        transform: `translateX(${x})`,
        willChange: 'opacity, transform',
      }}
    >
      <img className="sequence-frame" src={src} alt="" draggable={false} decoding="async" />
    </div>
  )
}
