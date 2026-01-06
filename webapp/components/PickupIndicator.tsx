'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface PickupIndicatorProps {
  position: THREE.Vector3
  color: string
  deliveryId: string
}

// Available present models
const PRESENT_MODELS = [
  '/models/present_white_cube.glb',
  '/models/present_green_round.glb',
  '/models/present_green_rectangle.glb',
  '/models/present_green_cube.glb',
  '/models/present_white_round.glb',
  '/models/present_white_rectangle.glb',
]

/**
 * Pulsing indicator for active pickup locations using present models
 */
export function PickupIndicator({ position, color, deliveryId }: PickupIndicatorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  // Select a consistent model based on delivery ID
  const modelPath = useMemo(() => {
    const hash = deliveryId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return PRESENT_MODELS[hash % PRESENT_MODELS.length]
  }, [deliveryId])

  const { scene } = useGLTF(modelPath)

  // Clone the model preserving original textures
  const presentClone = useMemo(() => {
    return scene.clone()
  }, [scene])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    timeRef.current += delta

    // Gentle pulse animation (scale)
    const pulse = Math.sin(timeRef.current * 2) * 0.08 + 1
    groupRef.current.scale.set(pulse, pulse, pulse)

    // Subtle bob up and down
    const bob = Math.sin(timeRef.current * 1.5) * 0.1
    groupRef.current.position.y = position.y + 0.4 + bob
  })

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y + 0.4, position.z]}
    >
      {/* Original present model with textures */}
      <primitive object={presentClone} />

      {/* Colored glow sphere around the present */}
      <mesh
        position={[0, .2, 0]}
      >
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// Preload all present models
PRESENT_MODELS.forEach((model) => {
  useGLTF.preload(model)
})
