import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { Category } from '../data/categories'
import { categories } from '../data/categories'

export type ChapterMotion = {
  turn: number
  reveal: number
  fade: number
  zoom: number
  progress: number
}

type SceneState = {
  activeId: string | null
  motion: ChapterMotion
  videoIndex: number
  setVideoIndex: (i: number) => void
  report: (id: string, score: number, motion: ChapterMotion) => void
  activeCategory: Category | null
}

const SceneCtx = createContext<SceneState | null>(null)

const emptyMotion: ChapterMotion = { turn: 0, reveal: 0, fade: 0, zoom: 0, progress: 0 }

function nearlyEqual(a: ChapterMotion, b: ChapterMotion, eps = 0.004) {
  return (
    Math.abs(a.turn - b.turn) < eps &&
    Math.abs(a.reveal - b.reveal) < eps &&
    Math.abs(a.fade - b.fade) < eps &&
    Math.abs(a.zoom - b.zoom) < eps &&
    Math.abs(a.progress - b.progress) < eps
  )
}

export function SceneProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(categories[0]?.id ?? null)
  const [motion, setMotion] = useState<ChapterMotion>(emptyMotion)
  const [videoIndex, setVideoIndex] = useState(0)
  const scoresRef = useRef(new Map<string, number>())
  const motionById = useRef(new Map<string, ChapterMotion>())
  const activeIdRef = useRef<string | null>(categories[0]?.id ?? null)
  const motionRef = useRef<ChapterMotion>(emptyMotion)

  const report = useCallback((id: string, score: number, next: ChapterMotion) => {
    scoresRef.current.set(id, score)
    motionById.current.set(id, next)

    let bestId: string | null = null
    let best = 0
    for (const [k, v] of scoresRef.current) {
      if (v > best) {
        best = v
        bestId = k
      }
    }

    // Keep last chapter if briefly between sections — avoids blank wait
    if (best < 0.02) {
      if (activeIdRef.current && motionById.current.has(activeIdRef.current)) {
        const keep = motionById.current.get(activeIdRef.current)!
        if (!nearlyEqual(keep, motionRef.current)) {
          motionRef.current = keep
          setMotion(keep)
        }
      }
      return
    }

    if (bestId && bestId !== activeIdRef.current) {
      activeIdRef.current = bestId
      setActiveId(bestId)
      setVideoIndex(0)
    }

    if (bestId) {
      const m = motionById.current.get(bestId) ?? emptyMotion
      if (!nearlyEqual(m, motionRef.current)) {
        motionRef.current = m
        setMotion(m)
      }
    }
  }, [])

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeId) ?? categories[0] ?? null,
    [activeId],
  )

  const value = useMemo(
    () => ({
      activeId,
      motion,
      videoIndex,
      setVideoIndex,
      report,
      activeCategory,
    }),
    [activeId, motion, videoIndex, report, activeCategory],
  )

  return <SceneCtx.Provider value={value}>{children}</SceneCtx.Provider>
}

export function useScene() {
  const ctx = useContext(SceneCtx)
  if (!ctx) throw new Error('useScene outside provider')
  return ctx
}
