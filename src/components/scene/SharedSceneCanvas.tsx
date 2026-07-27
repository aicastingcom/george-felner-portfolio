import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../../scene/SceneContext'
import { FilmmakerRig, PreloadLikeness } from './FilmmakerRig'
import { ErrorBoundary } from '../ErrorBoundary'

function CameraRig({
  turn,
  zoom,
  profileSide,
}: {
  turn: number
  zoom: number
  profileSide: 'left' | 'right'
}) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3(0, 0.1, 0))
  const primed = useRef(false)

  useFrame((_, dt) => {
    const z = THREE.MathUtils.clamp(zoom, 0, 1)
    const open = profileSide === 'right' ? -1 : 1
    const camX = THREE.MathUtils.lerp(0, open * -0.35, turn * (1 - z))
    const camY = 0.2
    const camZ = THREE.MathUtils.lerp(3.8, 3.3, Math.max(turn * 0.35, z * 0.4))
    if (!primed.current) {
      camera.position.set(camX, camY, camZ)
      look.current.set(open * 0.7 * turn * (1 - z), 0.1, 0)
      camera.lookAt(look.current)
      primed.current = true
      return
    }
    const k = 1 - Math.exp(-16 * dt)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camX, k)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camY, k)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camZ, k)
    look.current.x = THREE.MathUtils.lerp(look.current.x, open * 0.7 * turn * (1 - z), k)
    look.current.y = 0.1
    look.current.z = 0
    camera.lookAt(look.current)
  })

  return null
}

/** One shared WebGL canvas — volumetric meshes only */
export function SharedSceneCanvas() {
  const { activeCategory, motion } = useScene()
  const { turn, fade, zoom } = motion
  if (!activeCategory) return null

  return (
    <div className="shared-scene" aria-hidden>
      <ErrorBoundary fallback={<div className="shared-scene-fallback">3D failed to load</div>}>
        <Canvas
          camera={{ position: [0, 0.2, 3.8], fov: 32 }}
          dpr={[1, 1.75]}
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.55} />
          <directionalLight
            position={[3.5, 5, 4]}
            intensity={2.4}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-3, 2, 2]} intensity={1.1} color="#a8c0e0" />
          <directionalLight position={[0, 1.5, -3]} intensity={0.7} />
          <spotLight
            position={[activeCategory.profileSide === 'right' ? -2 : 2, 3, 3]}
            intensity={1.2 + turn * 0.6}
            angle={0.5}
            penumbra={0.8}
            color="#ffd8b0"
          />
          <Suspense fallback={null}>
            <Environment preset="city" environmentIntensity={0.35} />
            <PreloadLikeness />
          </Suspense>

          <CameraRig turn={turn} zoom={zoom} profileSide={activeCategory.profileSide} />

          <group visible={fade < 0.97}>
            <FilmmakerRig
              categoryId={activeCategory.id}
              turn={turn}
              fade={fade}
              profileSide={activeCategory.profileSide}
            />
          </group>

          <ContactShadows position={[0, -0.55, 0]} opacity={0.45} scale={8} blur={2.2} far={4} />
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
