import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Category, VideoOrientation } from '../data/categories'

type Props = {
  category: Category
  /** 0–1 subject turn — screen waits until mostly complete */
  turn: number
  zoom: number
  active: boolean
  index: number
  onIndex: (i: number) => void
}

/**
 * Brief device motion:
 * appears from the side (seen in perspective) → rotates to face viewer → zooms in.
 * Videos autoplay; swipe / dots change clips in this category only.
 * Portrait clips rotate the bezel upright; landscape clips get a bouncy Y spin.
 */
export function DeviceScreen({ category, turn, zoom, active, index, onIndex }: Props) {
  const startX = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const prevOrientation = useRef<VideoOrientation | null>(null)
  const [ready, setReady] = useState(false)
  const [orientation, setOrientation] = useState<VideoOrientation>('landscape')
  const [orientAnim, setOrientAnim] = useState<'portrait' | 'landscape-spin' | null>(null)
  const video = category.videos[index]

  // Screen sits opposite the figure after profile turn
  const enterFrom = category.profileSide === 'right' ? 'left' : 'right'

  const onSwipe = useCallback(
    (dx: number) => {
      if (Math.abs(dx) < 40 || category.videos.length < 2) return
      if (dx < 0) onIndex((index + 1) % category.videos.length)
      else onIndex((index - 1 + category.videos.length) % category.videos.length)
    },
    [category.videos.length, index, onIndex],
  )

  useEffect(() => {
    onIndex(0)
  }, [category.id, onIndex])

  useEffect(() => {
    setReady(false)
  }, [video.src])

  const resolveOrientation = useCallback(
    (el?: HTMLVideoElement | null): VideoOrientation | null => {
      if (video.orientation) return video.orientation
      if (el?.videoWidth && el.videoHeight) {
        return el.videoHeight > el.videoWidth ? 'portrait' : 'landscape'
      }
      return null
    },
    [video.orientation],
  )

  const commitOrientation = useCallback((next: VideoOrientation) => {
    const prev = prevOrientation.current

    if (prev === null) {
      setOrientAnim(next === 'portrait' ? 'portrait' : null)
    } else if (prev !== next) {
      setOrientAnim(next === 'portrait' ? 'portrait' : 'landscape-spin')
    } else if (next === 'landscape') {
      setOrientAnim('landscape-spin')
    } else {
      setOrientAnim('portrait')
    }

    prevOrientation.current = next
    setOrientation(next)
  }, [])

  // Explicit per-video orientation (e.g. Animation chapter) applies immediately
  useEffect(() => {
    if (!video.orientation) return
    commitOrientation(video.orientation)
  }, [video.src, video.orientation, commitOrientation])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const onMeta = () => {
      const next = resolveOrientation(el)
      if (next) commitOrientation(next)
    }
    el.addEventListener('loadedmetadata', onMeta)
    if (el.readyState >= 1) onMeta()

    return () => el.removeEventListener('loadedmetadata', onMeta)
  }, [resolveOrientation, commitOrientation, video.src, index])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !active) return
    const play = () => {
      void el.play().catch(() => {})
    }
    play()
    el.addEventListener('loadeddata', play)
    el.addEventListener('canplay', play)
    return () => {
      el.removeEventListener('loadeddata', play)
      el.removeEventListener('canplay', play)
    }
  }, [active, ready, video.src, index])

  // Wait until subject has mostly turned, then full device choreography
  if (!active || turn < 0.68 || zoom < 0.02) return null

  // 0 → 1 across zoom phase
  const t = Math.min(1, Math.max(0, (zoom - 0.02) / 0.78))

  // Full rotation: enter from side (edge-on) → swing to face viewer → zoom
  const yawAmt = enterFrom === 'left' ? 72 : -72
  const xAmt = enterFrom === 'left' ? -36 : 36

  let opacity: number
  let scale: number
  let yaw: number
  let x: number

  if (t < 0.38) {
    const u = t / 0.38
    opacity = Math.min(1, u * 1.35)
    scale = 0.55 + u * 0.2
    yaw = yawAmt * (1 - u * 0.22)
    x = xAmt * (1 - u * 0.4)
  } else if (t < 0.72) {
    const u = (t - 0.38) / 0.34
    opacity = 1
    scale = 0.75 + u * 0.1
    yaw = yawAmt * 0.78 * (1 - u)
    x = xAmt * 0.6 * (1 - u)
  } else {
    const u = (t - 0.72) / 0.28
    opacity = 1
    scale = 0.85 + u * 0.18
    yaw = 0
    x = 0
  }

  const style: CSSProperties = {
    position: 'fixed',
    left: '50%',
    top: '50%',
    zIndex: 28,
    opacity,
    transform: `translate(-50%, -50%) translateX(${x}vw) perspective(1400px) rotateY(${yaw}deg) scale(${scale})`,
    transformStyle: 'preserve-3d',
  }

  const orientClass = [
    orientation === 'portrait' ? 'is-portrait-video' : 'is-landscape-video',
    orientAnim === 'portrait' ? 'anim-portrait' : '',
    orientAnim === 'landscape-spin' ? 'anim-landscape-spin' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={`device-screen device-${category.device} device-centered ${orientClass}`}
      style={style}
      onPointerDown={(e) => {
        startX.current = e.clientX
      }}
      onPointerUp={(e) => {
        if (startX.current != null) onSwipe(e.clientX - startX.current)
        startX.current = null
      }}
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (startX.current != null && e.changedTouches[0]) {
          onSwipe(e.changedTouches[0].clientX - startX.current)
        }
        startX.current = null
      }}
    >
      <div
        className="device-orient"
        onAnimationEnd={() => setOrientAnim(null)}
      >
        <div className={`device-bezel${ready ? ' is-ready' : ' is-loading'}`}>
          <video
            ref={videoRef}
            key={video.src}
            className="device-video"
            src={video.src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={t > 0.7}
            onLoadedData={() => setReady(true)}
            onCanPlay={() => setReady(true)}
            onPlaying={() => setReady(true)}
          />
        </div>
      </div>
      <div className="device-meta" style={{ opacity: t > 0.35 && ready ? 1 : 0 }}>
        <span>{video.label}</span>
        {category.videos.length > 1 && (
          <>
            <div className="swipe-dots" aria-hidden>
              {category.videos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === index ? 'active' : ''}
                  onClick={() => onIndex(i)}
                  aria-label={`Video ${i + 1}`}
                />
              ))}
            </div>
            <p className="swipe-hint">Swipe for more</p>
          </>
        )}
      </div>
    </div>
  )
}
