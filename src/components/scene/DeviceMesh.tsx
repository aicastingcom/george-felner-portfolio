import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DeviceKind } from '../../data/categories'

type Props = {
  kind: DeviceKind
  src: string
  reveal: number
  zoom: number
  /** Figure ends on this side → device enters from the opposite side */
  profileSide: 'left' | 'right'
}

function deviceSize(kind: DeviceKind): { w: number; h: number; depth: number; radius: number } {
  switch (kind) {
    case 'phone':
      return { w: 0.72, h: 1.45, depth: 0.04, radius: 0.06 }
    case 'ipad':
      return { w: 1.15, h: 1.5, depth: 0.035, radius: 0.05 }
    case 'macbook':
      return { w: 2.1, h: 1.35, depth: 0.04, radius: 0.03 }
    case 'cinema':
    case 'tv':
    case 'monitor':
    default:
      return { w: 2.4, h: 1.35, depth: 0.06, radius: 0.02 }
  }
}

/** Real 3D device — rotates in (not a flat CSS slide) with live video on the screen */
export function DeviceMesh({ kind, src, reveal, zoom, profileSide }: Props) {
  const group = useRef<THREE.Group>(null)
  const screenMat = useRef<THREE.MeshStandardMaterial>(null)
  const openSide = profileSide === 'right' ? -1 : 1
  const { w, h, depth } = deviceSize(kind)

  const video = useMemo(() => {
    const el = document.createElement('video')
    el.muted = true
    el.loop = true
    el.playsInline = true
    el.preload = 'metadata'
    el.setAttribute('playsinline', '')
    el.setAttribute('muted', '')
    try {
      el.src = src
    } catch {
      /* ignore bad src */
    }
    return el
  }, [src])

  const texture = useMemo(() => {
    const t = new THREE.VideoTexture(video)
    t.colorSpace = THREE.SRGBColorSpace
    t.minFilter = THREE.LinearFilter
    t.magFilter = THREE.LinearFilter
    t.generateMipmaps = false
    return t
  }, [video])

  useEffect(() => {
    const play = () => {
      void video.play().catch(() => {})
    }
    video.addEventListener('loadeddata', play)
    play()
    return () => {
      video.removeEventListener('loadeddata', play)
      texture.dispose()
      try {
        video.pause()
        video.removeAttribute('src')
        video.load()
      } catch {
        /* ignore */
      }
    }
  }, [texture, video])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return

    const r = THREE.MathUtils.clamp(reveal, 0, 1)
    const z = THREE.MathUtils.clamp(zoom, 0, 1)

    // Enter from the open side, edge-on, then swing to face the camera
    const enterX = openSide * THREE.MathUtils.lerp(3.2, 1.15, r)
    const centerX = THREE.MathUtils.lerp(enterX, 0, z)
    const y = THREE.MathUtils.lerp(0.15, 0.35, z)
    const zPos = THREE.MathUtils.lerp(0.2, 0.85, z)

    // Edge-on (~70°) → slight angle beside figure → dead-on when zoomed
    const startYaw = openSide * THREE.MathUtils.degToRad(72)
    const midYaw = openSide * THREE.MathUtils.degToRad(18)
    const yaw = THREE.MathUtils.lerp(THREE.MathUtils.lerp(startYaw, midYaw, r), 0, z)
    const pitch = THREE.MathUtils.lerp(THREE.MathUtils.degToRad(8), 0, z)
    const scale = THREE.MathUtils.lerp(0.55, 1.05 + z * 0.35, Math.max(r, z * 0.5))

    const k = 1 - Math.exp(-10 * dt)
    g.position.x = THREE.MathUtils.lerp(g.position.x, centerX, k)
    g.position.y = THREE.MathUtils.lerp(g.position.y, y, k)
    g.position.z = THREE.MathUtils.lerp(g.position.z, zPos, k)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, yaw, k)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pitch, k)
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x || scale, scale, k))
    g.visible = r > 0.02

    if (screenMat.current) {
      screenMat.current.opacity = Math.min(1, r * 1.2)
      screenMat.current.emissiveIntensity = 0.35 + z * 0.55
    }
  })

  const bezel = 0.045
  const screenW = w - bezel * 2
  const screenH = h - bezel * 2

  return (
    <group ref={group} position={[openSide * 3.2, 0.15, 0.2]} rotation={[0.1, openSide * 1.25, 0]}>
      {/* chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, depth]} />
        <meshStandardMaterial color="#141414" metalness={0.65} roughness={0.28} />
      </mesh>
      {/* inner lip */}
      <mesh position={[0, 0, depth * 0.35]}>
        <boxGeometry args={[w - 0.02, h - 0.02, depth * 0.2]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* glowing video screen */}
      <mesh position={[0, 0, depth * 0.55 + 0.002]}>
        <planeGeometry args={[screenW, screenH]} />
        <meshStandardMaterial
          ref={screenMat}
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.45}
          roughness={0.35}
          metalness={0.05}
          transparent
          opacity={0}
          side={THREE.FrontSide}
        />
      </mesh>
      {/* phone notch */}
      {kind === 'phone' && (
        <mesh position={[0, h * 0.42, depth * 0.56]}>
          <boxGeometry args={[0.16, 0.035, 0.01]} />
          <meshStandardMaterial color="#050505" />
        </mesh>
      )}
      {/* macbook base hint */}
      {kind === 'macbook' && (
        <mesh position={[0, -h * 0.55, -0.15]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[w * 1.02, 0.04, 0.9]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.25} />
        </mesh>
      )}
    </group>
  )
}
