import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/** Real reconstructed volumetric meshes — NOT photo planes */
const MODEL: Record<string, string> = {
  cinema: '/models/george-cinema.glb',
  ai: '/models/george-ai.glb',
  advertising: '/models/george-advertising.glb',
  corporate: '/models/george-corporate.glb',
  animation: '/models/george-animation.glb',
  drone: '/models/george-drone.glb',
  social: '/models/george-social.glb',
  webseries: '/models/george-webseries.glb',
}

// Preload at module scope (not inside a component render)
Object.values(MODEL).forEach((url) => useGLTF.preload(url))

/** Brief §3: small figure ~10–12% of viewport */
const TARGET_HEIGHT = 0.48

function VolumetricFigure({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const root = useMemo(() => {
    const clone = scene.clone(true)

    // TripoSR often exports facing -Z / away from camera — spin to face the visitor
    clone.rotation.y = Math.PI

    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true

      const apply = (m: THREE.Material) => {
        const src = m as THREE.MeshStandardMaterial & {
          map?: THREE.Texture | null
          vertexColors?: boolean
          color?: THREE.Color
        }
        const next = new THREE.MeshStandardMaterial({
          color: src.color ? src.color.clone().multiplyScalar(1.35) : new THREE.Color('#d8d0c8'),
          map: src.map ?? null,
          vertexColors: Boolean(src.vertexColors),
          roughness: 0.48,
          metalness: 0.12,
          emissive: new THREE.Color('#1a1512'),
          emissiveIntensity: 0.25,
        })
        next.side = THREE.FrontSide
        return next
      }

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(apply)
      } else {
        mesh.material = apply(mesh.material)
      }
    })

    // Normalize size + center so yaw pivots through the torso
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const scale = TARGET_HEIGHT / Math.max(size.y, 0.001)
    clone.scale.setScalar(scale)

    const box2 = new THREE.Box3().setFromObject(clone)
    const center = box2.getCenter(new THREE.Vector3())
    clone.position.x -= center.x
    clone.position.y -= center.y
    clone.position.z -= center.z

    return clone
  }, [scene])

  return <primitive object={root} />
}

type RigProps = {
  categoryId: string
  turn: number
  fade: number
  profileSide: 'left' | 'right'
}

/**
 * Volumetric GLB of George. Scroll = continuous real 3D yaw
 * (facing visitor → profile). Same mesh the whole chapter.
 */
export function FilmmakerRig({ categoryId, turn, fade, profileSide }: RigProps) {
  const group = useRef<THREE.Group>(null)
  const primed = useRef(false)
  const url = MODEL[categoryId] ?? MODEL.cinema
  const targetYaw = profileSide === 'right' ? Math.PI * 0.52 : -Math.PI * 0.52
  const targetX = profileSide === 'right' ? 0.55 : -0.55

  // Re-snap when chapter changes so we never lerp from the previous pose
  useEffect(() => {
    primed.current = false
  }, [categoryId, profileSide])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const t = THREE.MathUtils.clamp(turn, 0, 1)
    const desiredYaw = THREE.MathUtils.lerp(0, targetYaw, t)
    const desiredX = THREE.MathUtils.lerp(0, targetX, t)
    const live = 1 - THREE.MathUtils.clamp(fade, 0, 1)

    if (!primed.current) {
      g.rotation.y = desiredYaw
      g.position.set(desiredX, 0, 0)
      primed.current = true
    } else {
      const k = 1 - Math.exp(-24 * dt)
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, desiredYaw, k)
      g.position.x = THREE.MathUtils.lerp(g.position.x, desiredX, k)
      g.position.y = 0
    }

    g.visible = live > 0.04
    // Fade out as device takes over
    g.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial
        if (mat && 'opacity' in mat) {
          mat.transparent = live < 0.99
          mat.opacity = live
          mat.depthWrite = live > 0.5
        }
      })
    })
  })

  return (
    <group ref={group}>
      <Suspense fallback={null}>
        <VolumetricFigure key={url} url={url} />
      </Suspense>
    </group>
  )
}

export function PreloadLikeness() {
  return null
}
