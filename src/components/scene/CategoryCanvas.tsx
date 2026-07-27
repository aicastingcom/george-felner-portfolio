import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import type { Category } from '../../data/categories'
import { FilmmakerRig } from './FilmmakerRig'
import { DeviceMesh } from './DeviceMesh'

type Props = {
  category: Category
  turn: number
  fade: number
  reveal: number
  zoom: number
  videoSrc: string
}

function CameraRig({
  turn,
  reveal,
  zoom,
  profileSide,
}: {
  turn: number
  reveal: number
  zoom: number
  profileSide: 'left' | 'right'
}) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3(0, 0.35, 0))

  useFrame((_, dt) => {
    const z = THREE.MathUtils.clamp(zoom, 0, 1)
    const r = THREE.MathUtils.clamp(reveal, 0, 1)
    const open = profileSide === 'right' ? -1 : 1

    // Start on the figure → ease toward the device as it enters → dolly into the screen
    const camX = THREE.MathUtils.lerp(0, open * -0.15, turn) + THREE.MathUtils.lerp(0, 0, z)
    const camY = THREE.MathUtils.lerp(0.55, 0.4, z)
    const camZ = THREE.MathUtils.lerp(4.0, THREE.MathUtils.lerp(3.4, 2.15, z), Math.max(r * 0.35, z))

    const k = 1 - Math.exp(-8 * dt)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camX, k)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camY, k)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camZ, k)

    const lookX = THREE.MathUtils.lerp(0, open * 0.55 * (1 - z), Math.max(turn, r))
    const lookY = THREE.MathUtils.lerp(0.35, 0.4, z)
    const lookZ = THREE.MathUtils.lerp(0, 0.5, z)
    look.current.x = THREE.MathUtils.lerp(look.current.x, lookX, k)
    look.current.y = THREE.MathUtils.lerp(look.current.y, lookY, k)
    look.current.z = THREE.MathUtils.lerp(look.current.z, lookZ, k)
    camera.lookAt(look.current)
  })

  return null
}

/** Continuous WebGL scene: figure turn + 3D device rotate-in + camera dolly */
export function CategoryCanvas({ category, turn, fade, reveal, zoom, videoSrc }: Props) {
  return (
    <div className="category-canvas">
      <Canvas
        camera={{ position: [0, 0.55, 4.0], fov: 30 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3.5, 4.5, 4]} intensity={2.3} />
        <directionalLight position={[-4, 2.5, 1]} intensity={0.8} color="#9eb6d4" />
        <directionalLight position={[0, 1.2, -4]} intensity={0.65} />
        <spotLight
          position={[category.profileSide === 'right' ? -2.5 : 2.5, 2.6, 2.8]}
          intensity={0.65 + turn * 0.75}
          angle={0.55}
          penumbra={0.85}
          color="#ffd7b0"
        />
        <spotLight
          position={[category.profileSide === 'right' ? -2 : 2, 1.8, 3]}
          intensity={reveal * 1.4 + zoom * 0.8}
          angle={0.45}
          penumbra={0.7}
          color="#ffffff"
        />

        <CameraRig
          turn={turn}
          reveal={reveal}
          zoom={zoom}
          profileSide={category.profileSide}
        />

        <group visible={fade < 0.98}>
          <FilmmakerRig
            categoryId={category.id}
            turn={turn}
            fade={fade}
            profileSide={category.profileSide}
          />
        </group>

        {/* 3D device for rotate-in; hide once HTML screen takes over so we never end on black */}
        {reveal > 0.01 && zoom < 0.55 && (
          <DeviceMesh
            kind={category.device}
            src={videoSrc}
            reveal={reveal}
            zoom={zoom}
            profileSide={category.profileSide}
          />
        )}

        <ContactShadows position={[0, -1.0, 0]} opacity={0.48} scale={14} blur={2.6} far={6} />
      </Canvas>
    </div>
  )
}
